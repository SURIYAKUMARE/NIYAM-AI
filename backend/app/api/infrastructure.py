from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_payload, verify_institution_access, require_roles
from ..models.models import InfrastructureEvidence, Application, UserRole
from ..schemas.schemas import InfrastructureEvidenceResponse, UpdateInfrastructureComments
from ..services.audit_service import audit_service

router = APIRouter(prefix="/infrastructure", tags=["Infrastructure Evidence Review"])

@router.get("/{app_id}", response_model=List[InfrastructureEvidenceResponse])
def get_application_infrastructure(
    app_id: int,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("applicant", "scrutiny_officer", "supervising_authority", "auditor"))
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    verify_institution_access(user_payload, app.institution_id, db=db)
    return app.infrastructure_items

@router.patch("/{item_id}/review", response_model=InfrastructureEvidenceResponse)
def review_infrastructure_item(
    item_id: int,
    req: UpdateInfrastructureComments,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("scrutiny_officer", "supervising_authority"))
):
    item = db.query(InfrastructureEvidence).filter(InfrastructureEvidence.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Infrastructure evidence item not found")

    item.inspection_recommended = req.inspection_recommended
    item.officer_comments = req.officer_comments
    item.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(item)

    audit_service.log_event(
        db=db,
        event_type="INFRASTRUCTURE_REVIEW",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="InfrastructureEvidence",
        entity_id=str(item.id),
        action=f"Officer reviewed infrastructure item '{item.caption}' (Inspection Flag: {req.inspection_recommended})",
        details={
            "application_id": item.application_id,
            "facility_type": item.facility_type,
            "inspection_recommended": req.inspection_recommended,
            "officer_comments": req.officer_comments
        },
        actor_user_id=user_payload.get("user_id")
    )

    return item
