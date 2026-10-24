import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_payload, verify_institution_access, require_roles
from ..models.models import (
    Application, ApplicationStatus, Institution, Document, DocumentStatus,
    ChecklistItem, ValidationRun, UserRole
)
from ..schemas.schemas import ApplicationResponse, ApplicationCreateRequest
from ..services.audit_service import audit_service

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("applicant", "scrutiny_officer", "supervising_authority"))
):
    query = db.query(Application)

    # Server-enforced role boundary: Applicant sees ONLY their institution's applications
    user_role = user_payload.get("role")
    if user_role == UserRole.APPLICANT.value:
        inst_id = user_payload.get("institution_id")
        query = query.filter(Application.institution_id == inst_id)

    if status_filter:
        query = query.filter(Application.status == status_filter)

    if search:
        search_pattern = f"%{search}%"
        query = query.join(Institution).filter(
            (Application.application_number.ilike(search_pattern)) |
            (Institution.name.ilike(search_pattern)) |
            (Institution.aicte_permanent_id.ilike(search_pattern))
        )

    apps = query.order_by(Application.created_at.desc()).all()

    # Redact internal officer notes for applicants
    if user_role == UserRole.APPLICANT.value:
        for a in apps:
            if hasattr(a, "internal_notes"):
                a.internal_notes = None

    return apps

@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("applicant", "scrutiny_officer", "supervising_authority", "auditor"))
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application record not found")

    # Enforce institution isolation for applicants
    verify_institution_access(user_payload, app.institution_id, db=db)

    # Log sensitive record access in audit trail
    audit_service.log_event(
        db=db,
        event_type="SENSITIVE_RECORD_ACCESS",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="Application",
        entity_id=app.application_number,
        action=f"Viewed application workspace {app.application_number}",
        details={"application_id": app.id, "institution_id": app.institution_id},
        actor_user_id=user_payload.get("user_id")
    )

    # Task 5: Redact internal fields for applicants
    user_role = user_payload.get("role")
    if user_role == UserRole.APPLICANT.value:
        if hasattr(app, "internal_notes"):
            app.internal_notes = None

    return app

@router.post("", response_model=ApplicationResponse)
def create_application(
    req: ApplicationCreateRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("applicant"))
):
    user_role = user_payload.get("role")
    inst_id = user_payload.get("institution_id")
    if not inst_id:
        inst = db.query(Institution).first()
        inst_id = inst.id if inst else 1

    # Generate unique application number
    app_count = db.query(Application).count() + 1
    rand_suffix = random.randint(100, 999)
    app_number = f"AICTE-2025-APP-{app_count:03d}-{rand_suffix}"

    app = Application(
        application_number=app_number,
        institution_id=inst_id,
        category_code=req.category_code,
        academic_year=req.academic_year,
        status=ApplicationStatus.DRAFT,
        rule_set_version="v2025.1",
        approved_programmes=req.approved_programmes or [
            {"name": "Computer Science & Engineering", "intake": 120},
            {"name": "Information Technology", "intake": 60}
        ],
        ter_payment_status="PAID",
        ter_transaction_ref=f"TXN-TER-{rand_suffix}-2025",
        notes=req.notes or "Draft Application created via Web Wizard"
    )
    db.add(app)
    db.flush()

    # Automatically initialize required checklist items from active rule set
    checklists = db.query(ChecklistItem).filter(
        ChecklistItem.rule_set_version == app.rule_set_version,
        (ChecklistItem.category_code == app.category_code) | (ChecklistItem.category_code == "ALL")
    ).all()

    for item in checklists:
        doc = Document(
            application_id=app.id,
            checklist_item_code=item.item_code,
            title=item.title,
            document_type="STATUTORY_CERTIFICATE",
            is_mandatory=item.is_mandatory,
            status=DocumentStatus.PENDING_UPLOAD
        )
        db.add(doc)

    db.commit()
    db.refresh(app)

    audit_service.log_event(
        db=db,
        event_type="APPLICATION_CREATED",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="Application",
        entity_id=app.application_number,
        action=f"Created new application {app.application_number}",
        details={"category": req.category_code, "academic_year": req.academic_year},
        actor_user_id=user_payload.get("user_id")
    )

    return app

@router.post("/{app_id}/submit", response_model=ApplicationResponse)
def submit_application(
    app_id: int,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("applicant"))
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    verify_institution_access(user_payload, app.institution_id, db=db)

    app.status = ApplicationStatus.SUBMITTED_FOR_SCRUTINY
    app.submission_date = datetime.now(timezone.utc)
    db.commit()
    db.refresh(app)

    audit_service.log_event(
        db=db,
        event_type="APPLICATION_SUBMISSION",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="Application",
        entity_id=app.application_number,
        action="Applicant formally submitted application for official regulatory scrutiny",
        details={"application_id": app.id},
        actor_user_id=user_payload.get("user_id")
    )

    return app
