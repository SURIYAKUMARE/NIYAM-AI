import json
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from ..models.models import AuditLog
from ..core.config import settings

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        event_type: str,
        actor_username: str,
        actor_role: str,
        entity_type: str,
        entity_id: str,
        action: str,
        details: Optional[Dict[str, Any]] = None,
        actor_user_id: Optional[int] = None,
        ip_address: str = "127.0.0.1"
    ) -> AuditLog:
        if details is None:
            details = {}

        # Fetch previous record to build cryptographic chain
        last_log = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
        prev_hash = last_log.record_hash if last_log else "GENESIS_BLOCK_AICTE_VERIFY_2025"

        now = datetime.now(timezone.utc)
        payload_str = (
            f"{prev_hash}|{now.isoformat()}|{actor_username}|{actor_role}|"
            f"{entity_type}:{entity_id}|{action}|{json.dumps(details, sort_keys=True)}|"
            f"{settings.AUDIT_LOG_TAMPER_KEY}"
        )
        current_hash = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()

        audit_entry = AuditLog(
            event_type=event_type,
            actor_user_id=actor_user_id,
            actor_username=actor_username,
            actor_role=actor_role,
            entity_type=entity_type,
            entity_id=str(entity_id),
            action=action,
            details=details,
            ip_address=ip_address,
            timestamp=now,
            previous_record_hash=prev_hash,
            record_hash=current_hash
        )

        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry

audit_service = AuditService()
