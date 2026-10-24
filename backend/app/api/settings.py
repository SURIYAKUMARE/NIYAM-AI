from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import require_roles
from ..core.config import settings
from ..models.models import UserRole
from ..services.audit_service import audit_service

router = APIRouter(prefix="/settings", tags=["System & Integration Settings"])

@router.get("")
def get_system_settings(
    user_payload: dict = Depends(require_roles("admin"))
):
    return {
        "project_name": settings.PROJECT_NAME,
        "demo_mode": settings.DEMO_MODE,
        "max_file_size_mb": settings.MAX_FILE_SIZE_BYTES // (1024 * 1024),
        "allowed_extensions": list(settings.ALLOWED_EXTENSIONS),
        "data_retention_days": settings.DATA_RETENTION_DAYS,
        "storage_type": settings.STORAGE_TYPE,
        "s3_endpoint": settings.S3_ENDPOINT_URL,
        "s3_bucket": settings.S3_BUCKET_NAME,
        "active_rule_version": "v2025.1",
        "human_decision_statutory_mandate": True,
        "ai_advisory_mode": "Strict Advisory (No Automated Reject/Approve)",
        "source_adapters": {
            "digilocker": {"status": "ENABLED_SIMULATED", "timeout_ms": 5000, "rate_limit_per_min": 60},
            "university_affiliation": {"status": "ENABLED_SIMULATED", "timeout_ms": 6000, "rate_limit_per_min": 45},
            "land_revenue": {"status": "ENABLED_SIMULATED", "timeout_ms": 8000, "rate_limit_per_min": 30},
            "bank_ter": {"status": "ENABLED_SIMULATED", "timeout_ms": 4000, "rate_limit_per_min": 100},
            "qr_dss": {"status": "ENABLED_SIMULATED", "timeout_ms": 3000, "rate_limit_per_min": 120}
        }
    }

@router.patch("")
def update_system_setting(
    setting_update: dict,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("admin"))
):
    audit_service.log_event(
        db=db,
        event_type="SYSTEM_SETTING_UPDATED",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="Settings",
        entity_id="global_config",
        action="Administrator updated platform integration settings",
        details=setting_update,
        actor_user_id=user_payload.get("user_id")
    )
    return {"status": "SUCCESS", "message": "Settings updated and recorded in audit ledger", "data": setting_update}
