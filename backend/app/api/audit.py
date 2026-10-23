from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import require_roles
from ..models.models import AuditLog, UserRole
from ..schemas.schemas import AuditLogResponse

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_trail(
    event_type: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    actor_username: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles([UserRole.AUDITOR.value, UserRole.ADMIN.value, UserRole.SUPERVISING_AUTHORITY.value, UserRole.SCRUTINY_OFFICER.value]))
):
    query = db.query(AuditLog)

    if event_type:
        query = query.filter(AuditLog.event_type == event_type)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if actor_username:
        query = query.filter(AuditLog.actor_username == actor_username)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (AuditLog.action.ilike(pattern)) |
            (AuditLog.entity_id.ilike(pattern)) |
            (AuditLog.actor_username.ilike(pattern))
        )

    return query.order_by(AuditLog.id.desc()).limit(limit).all()

@router.get("/verify-chain")
def verify_audit_log_tamper_integrity(
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles([UserRole.AUDITOR.value, UserRole.ADMIN.value]))
):
    """
    Verifies cryptographic SHA-256 block chaining across all historical records
    """
    logs = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    if not logs:
        return {"status": "HEALTHY", "verified_records": 0, "chain_tampered": False}

    is_valid = True
    tampered_id = None

    for i in range(1, len(logs)):
        prev = logs[i - 1]
        curr = logs[i]
        if curr.previous_record_hash != prev.record_hash:
            is_valid = False
            tampered_id = curr.id
            break

    return {
        "status": "VERIFIED_TAMPER_EVIDENT" if is_valid else "CHAIN_INTEGRITY_BREACH",
        "verified_records": len(logs),
        "chain_intact": is_valid,
        "first_breached_record_id": tampered_id,
        "genesis_hash": logs[0].previous_record_hash if logs else None,
        "latest_block_hash": logs[-1].record_hash if logs else None
    }
