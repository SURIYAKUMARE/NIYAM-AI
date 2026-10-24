from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from ..core.database import get_db
from ..core.security import verify_password, create_access_token, get_current_user_payload
from ..core.config import settings
from ..core.totp import (
    verify_totp_code,
    generate_totp_secret,
    get_totp_uri,
    generate_recovery_codes,
    verify_and_consume_recovery_code,
)
from ..models.models import User, UserRole
from ..schemas.schemas import Token, UserResponse, LoginRequest, MfaVerifyRequest, MfaEnrollResponse, MfaConfirmRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

OFFICIAL_ROLES = [UserRole.SCRUTINY_OFFICER, UserRole.SUPERVISING_AUTHORITY, UserRole.ADMIN]

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account")

    user_info = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value,
        "institution_id": user.institution_id,
        "designation": user.designation,
        "institution_name": user.institution.name if user.institution else None
    }

    # If user is in an official regulatory role, enforce mandatory TOTP challenge
    if user.role in OFFICIAL_ROLES:
        # Issue temporary challenge session token (valid 5 minutes)
        mfa_session_data = {
            "sub": user.username,
            "user_id": user.id,
            "role": user.role.value,
            "institution_id": user.institution_id,
            "scope": "mfa_pending",
            "mfa_completed": False
        }
        mfa_session_token = create_access_token(mfa_session_data, expires_delta=timedelta(minutes=5))
        return {
            "access_token": None,
            "token_type": "bearer",
            "mfa_required": True,
            "mfa_session_token": mfa_session_token,
            "user": user_info
        }

    # Applicant / Auditor roles complete standard login
    token_data = {
        "sub": user.username,
        "user_id": user.id,
        "role": user.role.value,
        "institution_id": user.institution_id,
        "scope": "full_access",
        "mfa_completed": True
    }
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "mfa_required": False,
        "mfa_session_token": None,
        "user": user_info
    }

@router.post("/mfa/verify", response_model=Token)
def verify_mfa(request: MfaVerifyRequest, db: Session = Depends(get_db)):
    """
    Verifies 6-digit TOTP code or recovery code.
    Enforces attempt throttling, replay prevention, and secret validation.
    """
    try:
        payload = jwt.decode(request.mfa_session_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired MFA session token")

    if payload.get("scope") != "mfa_pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token scope for MFA completion")

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now_utc = datetime.now(timezone.utc)
    # Check attempt throttling lock
    if user.mfa_locked_until and user.mfa_locked_until.replace(tzinfo=timezone.utc) > now_utc:
        remaining = int((user.mfa_locked_until.replace(tzinfo=timezone.utc) - now_utc).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"MFA verification throttled due to excessive failed attempts. Try again in {remaining} seconds."
        )

    # Secret: use user's secret or default seeded secret
    secret = user.mfa_secret or "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP"
    is_valid, counter = verify_totp_code(secret, request.code, user.mfa_last_verified_counter)

    # Check recovery code fallback
    if not is_valid and request.code.upper().startswith("REC-"):
        rec_valid, updated_hashes = verify_and_consume_recovery_code(request.code, user.recovery_codes_hash)
        if rec_valid:
            is_valid = True
            user.recovery_codes_hash = updated_hashes

    if not is_valid:
        user.mfa_failed_attempts = (user.mfa_failed_attempts or 0) + 1
        if user.mfa_failed_attempts >= 5:
            user.mfa_locked_until = now_utc + timedelta(minutes=5)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid MFA verification code. Attempts remaining: {max(0, 5 - user.mfa_failed_attempts)}"
        )

    # Verification successful: reset failed attempts & record counter to prevent replay attacks
    user.mfa_failed_attempts = 0
    user.mfa_locked_until = None
    if counter:
        user.mfa_last_verified_counter = counter
    db.commit()

    # Issue production access token with mfa_completed: True
    full_token_data = {
        "sub": user.username,
        "user_id": user.id,
        "role": user.role.value,
        "institution_id": user.institution_id,
        "scope": "full_access",
        "mfa_completed": True
    }
    access_token = create_access_token(full_token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "mfa_required": False,
        "mfa_session_token": None,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "institution_id": user.institution_id,
            "designation": user.designation,
            "institution_name": user.institution.name if user.institution else None
        }
    }

@router.post("/mfa/enroll", response_model=MfaEnrollResponse)
def enroll_mfa(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    """Generates new RFC 6238 secret and recovery codes for authenticator setup."""
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    secret = generate_totp_secret()
    uri = get_totp_uri(secret, user.username)
    plain_codes, hash_str = generate_recovery_codes()

    # Store staging secret until confirmed
    user.mfa_secret = secret
    user.recovery_codes_hash = hash_str
    user.mfa_enrolled = False
    db.commit()

    return {
        "secret": secret,
        "otpauth_uri": uri,
        "recovery_codes": plain_codes
    }

@router.post("/mfa/confirm")
def confirm_mfa_enrollment(request: MfaConfirmRequest, payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    """Verifies initial code to confirm enrollment and activate MFA protection."""
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user or user.mfa_secret != request.secret:
        raise HTTPException(status_code=400, detail="Invalid enrollment session")

    is_valid, counter = verify_totp_code(request.secret, request.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid verification code. Authenticator enrollment unconfirmed.")

    user.mfa_enrolled = True
    user.mfa_last_verified_counter = counter
    db.commit()
    return {"status": "MFA_ENROLLED_CONFIRMED", "message": "Authenticator confirmed and MFA activated."}

@router.get("/me", response_model=UserResponse)
def get_current_user_info(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/demo-accounts")
def list_demo_accounts():
    """
    Returns available synthetic demo accounts for instant 1-click role switching in UI
    """
    return [
        {
            "username": "applicant",
            "role": "applicant",
            "role_title": "Institution Applicant",
            "name": "Dr. Rajeshwari Sharma",
            "organization": "Apex Institute of Technology & Science (1-492048123)",
            "description": "Uploads evidence, tracks preliminary validation, rectifies deficiencies early."
        },
        {
            "username": "officer",
            "role": "scrutiny_officer",
            "role_title": "Scrutiny Officer",
            "name": "Er. Anand Mohan Verma",
            "organization": "AICTE Western Regional Office, Mumbai",
            "description": "Inspects extracted evidence, reviews AI advisory findings, raises clarifications."
        },
        {
            "username": "authority",
            "role": "supervising_authority",
            "role_title": "Supervising Authority",
            "name": "Prof. (Dr.) Sudhir K. Sen",
            "organization": "AICTE Regulation Bureau, New Delhi",
            "description": "Reviews escalations, recommendations, records final statutory review outcomes."
        },
        {
            "username": "admin",
            "role": "admin",
            "role_title": "System Administrator",
            "name": "Vikramjit Singh",
            "organization": "AICTE IT Directorate",
            "description": "Manages rule versions, checklists, source integration adapters without accessing raw confidential records."
        },
        {
            "username": "auditor",
            "role": "auditor",
            "role_title": "Statutory Auditor",
            "name": "Smt. Meenakshi Iyer",
            "organization": "CAG External Regulatory Oversight",
            "description": "Read-only access to tamper-evident audit logs and evaluation provenance."
        }
    ]
