from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_payload, verify_institution_access, require_roles
from ..models.models import Application, ValidationRun, Finding, FindingStatus, UserRole
from ..schemas.schemas import FindingResponse, UpdateFindingDispositionRequest
from ..services.compliance_engine import compliance_engine
from ..services.audit_service import audit_service

router = APIRouter(prefix="/validation", tags=["Validation & Findings"])

@router.post("/run/{app_id}")
def trigger_validation(
    app_id: int,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    verify_institution_access(user_payload, app.institution_id)

    # Execute deterministic compliance engine
    val_run = compliance_engine.execute_validation_run(
        db=db,
        application_id=app.id,
        triggered_by_user_id=user_payload.get("user_id")
    )

    audit_service.log_event(
        db=db,
        event_type="COMPLIANCE_EVALUATION_RUN",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="ValidationRun",
        entity_id=str(val_run.id),
        action=f"Executed compliance validation run under ruleset {val_run.rule_set_version} (Status: {val_run.status}, Findings: {val_run.findings_count})",
        details={
            "application_number": app.application_number,
            "rule_set_version": val_run.rule_set_version,
            "findings_count": val_run.findings_count,
            "overall_risk_score": app.overall_risk_score
        },
        actor_user_id=user_payload.get("user_id")
    )

    return {
        "validation_run_id": val_run.id,
        "status": val_run.status,
        "findings_count": val_run.findings_count,
        "application_status": app.status.value,
        "overall_risk_score": app.overall_risk_score
    }

@router.get("/findings", response_model=List[FindingResponse])
def list_findings(
    application_id: Optional[int] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    query = db.query(Finding)

    user_role = user_payload.get("role")
    if user_role == UserRole.APPLICANT.value:
        inst_id = user_payload.get("institution_id")
        query = query.join(Application).filter(Application.institution_id == inst_id)

    if application_id:
        query = query.filter(Finding.application_id == application_id)
    if severity:
        query = query.filter(Finding.severity == severity)
    if status:
        query = query.filter(Finding.status == status)

    return query.order_by(Finding.id.desc()).all()

@router.patch("/findings/{finding_id}/disposition", response_model=FindingResponse)
def update_finding_disposition(
    finding_id: int,
    req: UpdateFindingDispositionRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles([UserRole.SCRUTINY_OFFICER.value, UserRole.SUPERVISING_AUTHORITY.value, UserRole.ADMIN.value]))
):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    old_status = finding.status.value
    finding.status = req.status
    finding.officer_notes = req.officer_notes
    finding.reviewed_by_user_id = user_payload.get("user_id")
    finding.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(finding)

    audit_service.log_event(
        db=db,
        event_type="FINDING_DISPOSITION_UPDATE",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="Finding",
        entity_id=str(finding.id),
        action=f"Official updated finding #{finding.id} from '{old_status}' to '{req.status.value}'",
        details={
            "application_id": finding.application_id,
            "rule_code": finding.rule_code,
            "new_status": req.status.value,
            "officer_notes": req.officer_notes
        },
        actor_user_id=user_payload.get("user_id")
    )

    return finding
