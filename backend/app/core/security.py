import re
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Union
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def hash_password(password: str) -> str:
    # Deterministic salted SHA-256 for portable, light runtime without complex C bindings
    salt = "aicte_secure_salt_2025_"
    return hashlib.sha256((salt + password).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def sanitize_untrusted_text(text: Optional[str]) -> str:
    """
    Sanitize text extracted from OCR or uploaded files:
    - Strips control characters
    - Neutralizes potential prompt injection markers
    - Strips script and style HTML tags
    """
    if not text:
        return ""
    sanitized = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    sanitized = re.sub(r'(?i)<\s*script[^>]*>.*?<\s*/\s*script\s*>', '[REDACTED_SCRIPT]', sanitized, flags=re.DOTALL)
    sanitized = re.sub(r'(?i)<\s*style[^>]*>.*?<\s*/\s*style\s*>', '[REDACTED_STYLE]', sanitized, flags=re.DOTALL)
    sanitized = re.sub(r'<\s*script[^>]*>', '[REDACTED_SCRIPT]', sanitized)
    suspicious_patterns = [
        r'(?i)ignore\s+(all\s+)?previous\s+instructions',
        r'(?i)disregard\s+(all\s+)?(previous\s+)?(instructions|prompt)',
        r'(?i)system\s*:\s*',
        r'(?i)you\s+are\s+now\s+in\s+developer\s+mode',
        r'(?i)assistant\s*:\s*',
    ]
    for pattern in suspicious_patterns:
        sanitized = re.sub(pattern, '[REDACTED_PROMPT_INJECTION]', sanitized)
    return sanitized.strip()

def get_current_user_payload(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: int = payload.get("user_id")
        institution_id: Optional[int] = payload.get("institution_id")
        mfa_completed: bool = payload.get("mfa_completed", True)
        scope: str = payload.get("scope", "full_access")

        if username is None:
            raise credentials_exception

        # Server-enforce MFA completion for official regulatory roles
        if role in ["scrutiny_officer", "supervising_authority", "admin"] and not mfa_completed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="MFA verification challenge required for official regulatory roles. Protected session blocked."
            )

        return {
            "username": username,
            "role": role,
            "user_id": user_id,
            "institution_id": institution_id,
            "mfa_completed": mfa_completed,
            "scope": scope
        }
    except JWTError:
        raise credentials_exception

def require_roles(*roles: Union[str, List[str]]):
    """
    Reusable dependency to enforce role-based access control.
    Accepts require_roles("admin", "auditor") or require_roles(["admin", "auditor"]).
    Logs access denials (403) to AuditService.
    """
    if len(roles) == 1 and isinstance(roles[0], (list, tuple)):
        allowed_roles = list(roles[0])
    else:
        allowed_roles = list(roles)

    def role_checker(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
        user_role = payload.get("role")
        if user_role not in allowed_roles:
            # Audit log access denial
            try:
                from ..services.audit_service import AuditService
                AuditService.log_event(
                    db=db,
                    event_type="ACCESS_DENIED_403",
                    actor_id=payload.get("user_id"),
                    actor_role=user_role,
                    target_entity="ROLE_PERMISSION",
                    target_id=0,
                    details={
                        "username": payload.get("username"),
                        "required_roles": allowed_roles,
                        "attempted_role": user_role,
                    }
                )
            except Exception:
                pass

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}. Your role: {user_role}"
            )
        return payload
    return role_checker

def verify_institution_access(payload: dict, target_institution_id: int, db: Optional[Session] = None):
    """
    Server-side institution isolation check:
    If user is 'applicant', they can only access records matching their institution_id.
    Cross-institution access is strictly forbidden (403).
    """
    user_role = payload.get("role")
    if user_role == "applicant":
        user_inst_id = payload.get("institution_id")
        if user_inst_id != target_institution_id:
            if db:
                try:
                    from ..services.audit_service import AuditService
                    AuditService.log_event(
                        db=db,
                        event_type="ACCESS_DENIED_TENANT_ISOLATION",
                        actor_id=payload.get("user_id"),
                        actor_role=user_role,
                        target_entity="INSTITUTION_RECORD",
                        target_id=target_institution_id,
                        details={
                            "username": payload.get("username"),
                            "user_institution_id": user_inst_id,
                            "target_institution_id": target_institution_id,
                        }
                    )
                except Exception:
                    pass

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are not authorized to view or modify records belonging to other institutions."
            )
    return True
