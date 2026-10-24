from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import require_roles
from ..models.models import ReviewAction, Application, ApplicationStatus, UserRole
from ..schemas.schemas import ReviewActionResponse, RecordReviewActionRequest
from ..services.audit_service import audit_service

router = APIRouter(prefix="/review-actions", tags=["Review Actions & Statutory Decisions"])

@router.get("/{app_id}", response_model=List[ReviewActionResponse])
def get_application_review_history(
    app_id: int,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("scrutiny_officer", "supervising_authority", "auditor"))
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app.review_actions

@router.post("/{app_id}", response_model=ReviewActionResponse)
def record_review_action(
    app_id: int,
    req: RecordReviewActionRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("scrutiny_officer", "supervising_authority"))
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    user_role = user_payload.get("role")

    # Task 4 & Task 5: Only supervising_authority can issue statutory decisions
    if req.action_type == "STATUTORY_DECISION_RECORDED":
        if user_role != UserRole.SUPERVISING_AUTHORITY.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Only competent Supervising Authority can record final statutory decisions."
            )
        # Server-side validation: Non-empty written justification
        if not req.comments or not req.comments.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mandatory written justification is required for all official statutory regulatory decisions."
            )

        if req.statutory_decision in ("APPROVE", "APPROVED_WITH_DEFICIENCIES"):
            app.status = ApplicationStatus.APPROVED_BY_AUTHORITY
        elif req.statutory_decision in ("REJECT", "REJECTED"):
            app.status = ApplicationStatus.REJECTED_BY_AUTHORITY
        elif req.statutory_decision in ("INSPECT", "INSPECTION_ORDERED"):
            app.status = ApplicationStatus.RECOMMENDED_FOR_INSPECTION
    else:
        # Officer actions (recommendations, observations)
        if user_role not in (UserRole.SCRUTINY_OFFICER.value, UserRole.SUPERVISING_AUTHORITY.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Only Scrutiny Officers can record preliminary scrutiny observations."
            )
        if req.action_type == "RECOMMENDED_FOR_APPROVAL":
            app.status = ApplicationStatus.RECOMMENDED_FOR_APPROVAL
        elif req.action_type == "RECOMMENDED_FOR_INSPECTION":
            app.status = ApplicationStatus.RECOMMENDED_FOR_INSPECTION

    action = ReviewAction(
        application_id=app.id,
        officer_user_id=user_payload.get("user_id"),
        action_type=req.action_type,
        comments=req.comments,
        statutory_decision=req.statutory_decision,
        created_at=datetime.now(timezone.utc)
    )
    db.add(action)
    db.commit()
    db.refresh(action)

    audit_service.log_event(
        db=db,
        event_type="STATUTORY_REVIEW_ACTION",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="ReviewAction",
        entity_id=str(action.id),
        action=f"Recorded official review action: {req.action_type} (Statutory Decision: {req.statutory_decision or 'None'})",
        details={
            "application_number": app.application_number,
            "action_type": req.action_type,
            "statutory_decision": req.statutory_decision,
            "comments": req.comments
        },
        actor_user_id=user_payload.get("user_id")
    )

    return action
