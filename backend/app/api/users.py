from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import require_roles
from ..models.models import User, UserRole, Application
from ..schemas.schemas import UserResponse
from ..services.audit_service import audit_service

router = APIRouter(prefix="/users", tags=["User & Permission Management"])

class UpdateUserRoleRequest(BaseModel):
    role: UserRole
    is_active: bool

class AssignOfficerRequest(BaseModel):
    application_id: int
    officer_user_id: int

@router.get("", response_model=List[UserResponse])
def list_system_users(
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("admin", "supervising_authority"))
):
    return db.query(User).order_by(User.id.asc()).all()

@router.patch("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    req: UpdateUserRoleRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("admin"))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_role = user.role.value
    user.role = req.role
    user.is_active = req.is_active
    db.commit()
    db.refresh(user)

    audit_service.log_event(
        db=db,
        event_type="USER_ROLE_UPDATED",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="User",
        entity_id=str(user.id),
        action=f"Administrator updated user '{user.username}' role from '{old_role}' to '{req.role.value}' (Active: {req.is_active})",
        details={"user_id": user.id, "new_role": req.role.value, "is_active": req.is_active},
        actor_user_id=user_payload.get("user_id")
    )

    return user

@router.post("/assign-officer")
def assign_officer_to_application(
    req: AssignOfficerRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("admin", "supervising_authority"))
):
    app = db.query(Application).filter(Application.id == req.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    officer = db.query(User).filter(User.id == req.officer_user_id).first()
    if not officer or officer.role != UserRole.SCRUTINY_OFFICER:
        raise HTTPException(status_code=400, detail="Target user must be an active Scrutiny Officer")

    app.assigned_officer_id = officer.id
    db.commit()

    audit_service.log_event(
        db=db,
        event_type="OFFICER_ASSIGNMENT",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="Application",
        entity_id=app.application_number,
        action=f"Assigned scrutiny officer '{officer.full_name}' to application {app.application_number}",
        details={"application_id": app.id, "officer_user_id": officer.id},
        actor_user_id=user_payload.get("user_id")
    )

    return {
        "message": f"Application {app.application_number} assigned to {officer.full_name}",
        "assigned_officer": officer.full_name,
        "application_id": app.id
    }
