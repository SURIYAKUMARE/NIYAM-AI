from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from ..core.database import get_db
from ..core.security import verify_password, create_access_token, get_current_user_payload
from ..core.config import settings
from ..models.models import User
from ..schemas.schemas import Token, UserResponse, LoginRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

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

    token_data = {
        "sub": user.username,
        "user_id": user.id,
        "role": user.role.value,
        "institution_id": user.institution_id
    }
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
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
