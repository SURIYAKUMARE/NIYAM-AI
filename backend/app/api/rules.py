from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import require_roles
from ..models.models import RuleSet, RuleSetStatus, Rule, ChecklistItem, Application, UserRole
from ..schemas.schemas import RuleSetResponse, RuleResponse, ChecklistItemResponse, CreateRuleSetRequest, CreateRuleRequest
from ..services.compliance_engine import compliance_engine
from ..services.audit_service import audit_service

router = APIRouter(prefix="/rules", tags=["Rule & Checklist Administration"])

@router.get("", response_model=List[RuleSetResponse])
def list_rule_sets(
    db: Session = Depends(get_db)
):
    return db.query(RuleSet).order_by(RuleSet.created_at.desc()).all()

@router.get("/{version}", response_model=RuleSetResponse)
def get_rule_set(
    version: str,
    db: Session = Depends(get_db)
):
    rs = db.query(RuleSet).filter(RuleSet.version == version).first()
    if not rs:
        raise HTTPException(status_code=404, detail="Rule set version not found")
    return rs

@router.post("", response_model=RuleSetResponse)
def create_draft_rule_set(
    req: CreateRuleSetRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles([UserRole.ADMIN.value]))
):
    existing = db.query(RuleSet).filter(RuleSet.version == req.version).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Rule set version '{req.version}' already exists")

    rs = RuleSet(
        version=req.version,
        title=req.title,
        status=RuleSetStatus.DRAFT,
        effective_from=req.effective_from,
        effective_to=req.effective_to,
        handbook_edition=req.handbook_edition,
        notes=req.notes
    )
    db.add(rs)
    db.commit()
    db.refresh(rs)

    audit_service.log_event(
        db=db,
        event_type="RULESET_CREATED",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="RuleSet",
        entity_id=rs.version,
        action=f"Created new draft rule set version {rs.version}",
        details={"version": rs.version, "title": rs.title},
        actor_user_id=user_payload.get("user_id")
    )

    return rs

@router.post("/{version}/rules", response_model=RuleResponse)
def add_rule_to_version(
    version: str,
    req: CreateRuleRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles([UserRole.ADMIN.value]))
):
    rs = db.query(RuleSet).filter(RuleSet.version == version).first()
    if not rs:
        raise HTTPException(status_code=404, detail="Rule set not found")
    if rs.status == RuleSetStatus.RETIRED:
        raise HTTPException(status_code=400, detail="Cannot add rules to a retired rule set version")

    rule = Rule(
        rule_set_version=version,
        rule_code=req.rule_code,
        category_code=req.category_code,
        title=req.title,
        description=req.description,
        condition_type=req.condition_type,
        condition_config=req.condition_config,
        severity=req.severity,
        source_handbook_ref=req.source_handbook_ref,
        is_active=True
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)

    audit_service.log_event(
        db=db,
        event_type="RULE_CREATED",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="Rule",
        entity_id=rule.rule_code,
        action=f"Added rule {rule.rule_code} to rule set {version}",
        details={"rule_code": rule.rule_code, "severity": rule.severity.value},
        actor_user_id=user_payload.get("user_id")
    )

    return rule

@router.post("/{version}/activate")
def activate_rule_set(
    version: str,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles([UserRole.ADMIN.value]))
):
    rs = db.query(RuleSet).filter(RuleSet.version == version).first()
    if not rs:
        raise HTTPException(status_code=404, detail="Rule set not found")

    rs.status = RuleSetStatus.ACTIVE
    db.commit()

    audit_service.log_event(
        db=db,
        event_type="RULESET_ACTIVATED",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="RuleSet",
        entity_id=rs.version,
        action=f"Promoted rule set version {rs.version} to ACTIVE status",
        details={"version": rs.version},
        actor_user_id=user_payload.get("user_id")
    )

    return {"message": f"Rule set {version} activated successfully", "status": rs.status.value}

@router.post("/{version}/test")
def test_rule_set_against_sample_application(
    version: str,
    sample_app_id: int,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles([UserRole.ADMIN.value]))
):
    """
    Executes draft or candidate rule set against existing sample application without committing
    """
    app = db.query(Application).filter(Application.id == sample_app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Sample application not found")

    # Run compliance engine with override
    run_result = compliance_engine.execute_validation_run(
        db=db,
        application_id=app.id,
        triggered_by_user_id=user_payload.get("user_id"),
        override_rule_version=version
    )

    return {
        "tested_version": version,
        "sample_application": app.application_number,
        "findings_count": run_result.findings_count,
        "validation_status": run_result.status
    }
