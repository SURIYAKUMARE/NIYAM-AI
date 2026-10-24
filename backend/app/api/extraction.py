from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_payload, verify_institution_access
from ..models.models import ExtractedField, FieldCorrection, DocumentVersion, Document, Application
from ..schemas.schemas import ExtractedFieldResponse, FieldCorrectionRequest
from ..services.audit_service import audit_service

router = APIRouter(prefix="/extraction", tags=["Extraction & Corrections"])

@router.post("/field/{field_id}/correct", response_model=ExtractedFieldResponse)
def correct_extracted_field(
    field_id: int,
    req: FieldCorrectionRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    field = db.query(ExtractedField).filter(ExtractedField.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Extracted field not found")

    doc_version = field.document_version
    app = doc_version.document.application

    # Access control
    verify_institution_access(user_payload, app.institution_id)

    old_val = field.corrected_value if field.is_corrected else field.original_value

    # Record correction in immutable history
    correction = FieldCorrection(
        extracted_field_id=field.id,
        old_value=old_val,
        new_value=req.new_value,
        reason=req.reason,
        corrected_by_user_id=user_payload.get("user_id"),
        timestamp=datetime.now(timezone.utc)
    )
    db.add(correction)

    field.corrected_value = req.new_value
    field.is_corrected = True
    field.corrected_by_user_id = user_payload.get("user_id")
    field.corrected_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(field)

    # Log to audit trail
    audit_service.log_event(
        db=db,
        event_type="EXTRACTION_FIELD_CORRECTION",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="ExtractedField",
        entity_id=str(field.id),
        action=f"Corrected field '{field.field_name}' from '{old_val}' to '{req.new_value}'",
        details={
            "application_number": app.application_number,
            "field_name": field.field_name,
            "old_value": old_val,
            "new_value": req.new_value,
            "reason": req.reason
        },
        actor_user_id=user_payload.get("user_id")
    )

    return field

@router.get("/doc-version/{version_id}", response_model=list[ExtractedFieldResponse])
def get_extracted_fields_for_version(
    version_id: int,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    doc_version = db.query(DocumentVersion).filter(DocumentVersion.id == version_id).first()
    if not doc_version:
        raise HTTPException(status_code=404, detail="Document version not found")

    app = doc_version.document.application
    verify_institution_access(user_payload, app.institution_id)

    return doc_version.extracted_fields

@router.get("/field/{field_id}", response_model=ExtractedFieldResponse)
def get_extracted_field(
    field_id: int,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    field = db.query(ExtractedField).filter(ExtractedField.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Extracted field not found")

    app = field.document_version.document.application
    verify_institution_access(user_payload, app.institution_id)

    return field
