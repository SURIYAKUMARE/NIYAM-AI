import io
import csv
import json
import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_payload, verify_institution_access
from ..models.models import Application, Document, Finding, VerificationRequest, ReviewAction
from ..services.audit_service import audit_service

router = APIRouter(prefix="/reports", tags=["Reports & Receipts"])

@router.get("/application/{app_id}/summary")
def get_application_validation_report(
    app_id: int,
    format: str = "json",  # "json" or "csv"
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    verify_institution_access(user_payload, app.institution_id)

    # Compile structured summary
    report_data = {
        "platform": "Niyam — Institutional Application Review Platform",
        "regulatory_context": "AICTE Approval Process Handbook (Illustrative Demo)",
        "report_generated_at": datetime.now(timezone.utc).isoformat(),
        "application_details": {
            "application_number": app.application_number,
            "institution_name": app.institution.name if app.institution else "Unknown",
            "aicte_permanent_id": app.institution.aicte_permanent_id if app.institution else "N/A",
            "state": app.institution.state if app.institution else "N/A",
            "category": app.category_code,
            "academic_year": app.academic_year,
            "status": app.status.value,
            "submission_date": app.submission_date.isoformat() if app.submission_date else None,
            "pinned_rule_version": app.rule_set_version,
            "advisory_risk_score": app.overall_risk_score,
            "ter_payment_status": app.ter_payment_status,
        },
        "checklist_documents": [
            {
                "code": doc.checklist_item_code,
                "title": doc.title,
                "status": doc.status.value,
                "is_mandatory": doc.is_mandatory,
                "current_version": doc.current_version_id,
            }
            for doc in app.documents
        ],
        "compliance_findings": [
            {
                "rule_code": f.rule_code,
                "category": f.category,
                "severity": f.severity.value,
                "explanation": f.explanation,
                "expected": f.expected_value,
                "observed": f.observed_value,
                "rule_citation": f.rule_citation,
                "status": f.status.value,
                "officer_notes": f.officer_notes,
            }
            for f in app.findings
        ],
        "authorized_review_actions": [
            {
                "action_type": act.action_type,
                "statutory_decision": act.statutory_decision,
                "comments": act.comments,
                "timestamp": act.created_at.isoformat(),
            }
            for act in app.review_actions
        ]
    }

    # Audit export
    audit_service.log_event(
        db=db,
        event_type="REPORT_EXPORT",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="ApplicationReport",
        entity_id=app.application_number,
        action=f"Exported validation report for {app.application_number} (Format: {format})",
        details={"application_id": app.id, "format": format},
        actor_user_id=user_payload.get("user_id")
    )

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Report Type", "AICTE Compliance Validation Report"])
        writer.writerow(["Application Number", app.application_number])
        writer.writerow(["Institution", app.institution.name if app.institution else ""])
        writer.writerow(["Status", app.status.value])
        writer.writerow(["Rule Version", app.rule_set_version])
        writer.writerow([])
        writer.writerow(["Rule Code", "Category", "Severity", "Explanation", "Expected", "Observed", "Status"])
        for f in app.findings:
            writer.writerow([f.rule_code, f.category, f.severity.value, f.explanation, f.expected_value, f.observed_value, f.status.value])

        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=Validation_Report_{app.application_number}.csv"}
        )

    return report_data

@router.get("/application/{app_id}/receipt")
def get_submission_receipt(
    app_id: int,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    verify_institution_access(user_payload, app.institution_id)

    # Compute deterministic tamper-evident snapshot hash of this submission receipt
    snapshot_str = f"{app.application_number}|{app.institution_id}|{app.category_code}|{app.academic_year}|{app.rule_set_version}|{app.status.value}|{app.submission_date}"
    receipt_hash = hashlib.sha256(snapshot_str.encode("utf-8")).hexdigest()

    return {
        "title": "Official Regulatory Application Submission Receipt",
        "receipt_number": f"REC-{app.application_number}-{app.id:04d}",
        "application_number": app.application_number,
        "institution_name": app.institution.name if app.institution else "N/A",
        "aicte_permanent_id": app.institution.aicte_permanent_id if app.institution else "N/A",
        "category": app.category_code,
        "academic_session": app.academic_year,
        "rule_set_version": app.rule_set_version,
        "submission_timestamp": app.submission_date.isoformat() if app.submission_date else datetime.now(timezone.utc).isoformat(),
        "ter_payment_status": app.ter_payment_status,
        "ter_transaction_ref": app.ter_transaction_ref,
        "cryptographic_receipt_hash": receipt_hash,
        "notice": "This document certifies formal electronic submission under Niyam Platform rules. Statutory scrutiny and inspection determinations remain with competent AICTE authorities."
    }
