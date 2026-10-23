from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_payload, verify_institution_access, require_roles
from ..models.models import ClarificationRequest, Application, UserRole
from ..schemas.schemas import ClarificationResponse, CreateClarificationRequest, RespondClarificationRequest
from ..services.audit_service import audit_service

router = APIRouter(prefix="/clarifications", tags=["Clarifications"])

@router.get("/{app_id}", response_model=List[ClarificationResponse])
def get_application_clarifications(
    app_id: int,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    verify_institution_access(user_payload, app.institution_id)
    return app.clarifications

@router.post("/{app_id}", response_model=ClarificationResponse)
def create_clarification_request(
    app_id: int,
    req: CreateClarificationRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles([UserRole.SCRUTINY_OFFICER.value, UserRole.SUPERVISING_AUTHORITY.value, UserRole.ADMIN.value]))
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    clarification = ClarificationRequest(
        application_id=app.id,
        finding_id=req.finding_id,
        officer_user_id=user_payload.get("user_id"),
        question=req.question,
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    )
    db.add(clarification)

    # Transition application status
    app.status = "CLARIFICATION_REQUESTED"

    db.commit()
    db.refresh(clarification)

    audit_service.log_event(
        db=db,
        event_type="CLARIFICATION_REQUESTED",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="ClarificationRequest",
        entity_id=str(clarification.id),
        action=f"Officer issued formal clarification query for application {app.application_number}",
        details={"question": req.question, "finding_id": req.finding_id},
        actor_user_id=user_payload.get("user_id")
    )

    return clarification

@router.post("/{clarification_id}/respond", response_model=ClarificationResponse)
def respond_clarification(
    clarification_id: int,
    req: RespondClarificationRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    clarification = db.query(ClarificationRequest).filter(ClarificationRequest.id == clarification_id).first()
    if not clarification:
        raise HTTPException(status_code=404, detail="Clarification request not found")

    app = clarification.application
    verify_institution_access(user_payload, app.institution_id)

    clarification.applicant_response = req.applicant_response
    clarification.response_document_version_id = req.response_document_version_id
    clarification.status = "RESPONDED"
    clarification.responded_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(clarification)

    audit_service.log_event(
        db=db,
        event_type="CLARIFICATION_RESPONDED",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="ClarificationRequest",
        entity_id=str(clarification.id),
        action=f"Applicant submitted response to clarification query #{clarification.id}",
        details={"response": req.applicant_response},
        actor_user_id=user_payload.get("user_id")
    )

    return clarification
