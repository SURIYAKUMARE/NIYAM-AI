import io
import csv
import json
import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_payload, verify_institution_access, require_roles
from ..models.models import Application, Document, Finding, VerificationRequest, ReviewAction
from ..services.audit_service import audit_service

router = APIRouter(prefix="/reports", tags=["Reports & Receipts"])

@router.get("/application/{app_id}/summary")
def get_application_validation_report(
    app_id: int,
    format: str = "json",  # "json" or "csv"
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("applicant", "scrutiny_officer", "supervising_authority", "auditor"))
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    verify_institution_access(user_payload, app.institution_id, db=db)

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
                "officer_notes": f.officer_notes if user_payload.get("role") != "applicant" else None,
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
        writer.writerow([])
        writer.writerow(["CHECKLIST DOCUMENTS"])
        writer.writerow(["Code", "Title", "Mandatory", "Status"])
        for doc in app.documents:
            writer.writerow([doc.checklist_item_code, doc.title, doc.is_mandatory, doc.status.value])
        writer.writerow([])
        writer.writerow(["COMPLIANCE FINDINGS"])
        writer.writerow(["Rule Code", "Category", "Severity", "Explanation", "Status"])
        for f in app.findings:
            writer.writerow([f.rule_code, f.category, f.severity.value, f.explanation, f.status.value])

        output.seek(0)
        return Response(content=output.getvalue(), media_type="text/csv", headers={
            "Content-Disposition": f"attachment; filename=dossier_{app.application_number}.csv"
        })

    return report_data

@router.get("/application/{app_id}/submission-receipt")
@router.get("/application/{app_id}/receipt")
def get_submission_receipt(
    app_id: int,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles("applicant", "scrutiny_officer", "supervising_authority", "auditor"))
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    verify_institution_access(user_payload, app.institution_id, db=db)

    receipt_hash = hashlib.sha256(
        f"{app.application_number}:{app.submission_date}:{app.ter_transaction_ref}:{len(app.documents)}".encode()
    ).hexdigest()

    return {
        "receipt_number": f"REC-{app.application_number}-{receipt_hash[:8].upper()}",
        "application_number": app.application_number,
        "institution_name": app.institution.name if app.institution else "Apex Institute",
        "aicte_permanent_id": app.institution.aicte_permanent_id if app.institution else "N/A",
        "submission_timestamp": app.submission_date.isoformat() if app.submission_date else datetime.now(timezone.utc).isoformat(),
        "academic_year": app.academic_year,
        "ter_payment_status": app.ter_payment_status,
        "ter_transaction_ref": app.ter_transaction_ref,
        "total_documents_catalogued": len(app.documents),
        "cryptographic_fingerprint_sha256": receipt_hash,
        "cryptographic_receipt_hash": receipt_hash,
        "issuing_bureau": "AICTE Approval Bureau, New Delhi"
    }
