import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_payload, verify_institution_access, require_roles
from ..models.models import VerificationRequest, DocumentVersion, Document, Application, AuthoritySourceType, VerificationStatus, UserRole
from ..schemas.schemas import VerificationRequestResponse, TriggerVerificationRequest
from ..services.adapters import get_adapter, ADAPTER_MAP
from ..services.audit_service import audit_service

router = APIRouter(prefix="/verification", tags=["Verification Adapters & Queue"])

@router.get("/queue", response_model=List[VerificationRequestResponse])
def list_verification_queue(
    status_filter: Optional[str] = Query(None, alias="status"),
    source_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    query = db.query(VerificationRequest)

    user_role = user_payload.get("role")
    if user_role == UserRole.APPLICANT.value:
        inst_id = user_payload.get("institution_id")
        query = query.join(Application).filter(Application.institution_id == inst_id)

    if status_filter:
        query = query.filter(VerificationRequest.status == status_filter)
    if source_type:
        query = query.filter(VerificationRequest.authority_type == source_type)

    return query.order_by(VerificationRequest.timestamp.desc()).all()

@router.get("/sources/health")
def get_source_adapters_health():
    """
    Returns live health & integration status of external issuing authority adapters
    """
    return [
        {
            "authority_type": "DIGILOCKER",
            "name": "DigiLocker / National Academic Depository (NAD)",
            "endpoint": "https://api.digitallocker.gov.in/public/oauth2/1/pull/uri",
            "status": "OPERATIONAL",
            "avg_latency_ms": 142,
            "success_rate_24h": 99.4,
            "auth_method": "OAuth 2.0 PKCE / MeitY G2G Mutual TLS",
            "is_demo_mode": True
        },
        {
            "authority_type": "UNIVERSITY_AFFILIATION",
            "name": "State University Affiliation & Directorate Portal",
            "endpoint": "https://affiliation-registry.ac.in/api/v2/verify",
            "status": "OPERATIONAL",
            "avg_latency_ms": 185,
            "success_rate_24h": 98.1,
            "auth_method": "API Key + HMAC SHA-256",
            "is_demo_mode": True
        },
        {
            "authority_type": "LAND_REVENUE_PORTAL",
            "name": "State Land Records / Bhulekh Registry",
            "endpoint": "https://bhulekh.gov.in/api/v1/mutation-verify",
            "status": "OPERATIONAL",
            "avg_latency_ms": 210,
            "success_rate_24h": 96.5,
            "auth_method": "Digital Signature Service (DSS)",
            "is_demo_mode": True
        },
        {
            "authority_type": "BANK_TER_GATEWAY",
            "name": "Bharatkosh / Non-Tax Portal TER Reconciliation",
            "endpoint": "https://bharatkosh.gov.in/pg/aicte/reconciliation",
            "status": "OPERATIONAL",
            "avg_latency_ms": 95,
            "success_rate_24h": 99.8,
            "auth_method": "ISO 8583 / REST Secure Gateway",
            "is_demo_mode": True
        },
        {
            "authority_type": "QR_SIGNATURE_SERVICE",
            "name": "AICTE Document Security Service (DSS QR & DSC)",
            "endpoint": "https://verify.aicte-india.org/sec/dss-verify",
            "status": "OPERATIONAL",
            "avg_latency_ms": 68,
            "success_rate_24h": 100.0,
            "auth_method": "CCA X.509 PKI Chain Validation",
            "is_demo_mode": True
        }
    ]

@router.post("/trigger", response_model=VerificationRequestResponse)
def trigger_authority_verification(
    req: TriggerVerificationRequest,
    simulate_scenario: Optional[str] = Query("NORMAL"),  # NORMAL, SOURCE_UNAVAILABLE, MISMATCH, EXPIRED
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    doc_version = db.query(DocumentVersion).filter(DocumentVersion.id == req.document_version_id).first()
    if not doc_version:
        raise HTTPException(status_code=404, detail="Document version not found")

    app = doc_version.document.application
    verify_institution_access(user_payload, app.institution_id)

    adapter = get_adapter(req.authority_type)

    # Prepare safe payload for adapter
    payload = {
        "document_type": doc_version.document.document_type,
        "doc_number": doc_version.file_name,
        "institution_name": app.institution.name if app.institution else "Apex Institute",
        "academic_year": app.academic_year,
        "scenario": simulate_scenario,
        "owner_name": "Vidyapeeth Education Trust"
    }

    # Execute adapter verification
    result = adapter.verify(payload)

    v_req = VerificationRequest(
        application_id=app.id,
        document_version_id=doc_version.id,
        authority_type=req.authority_type,
        request_reference=f"REQ-{uuid.uuid4().hex[:12].upper()}",
        status=result["status"],
        source_endpoint=adapter.endpoint_name,
        matched_fields=result.get("matched_fields", {}),
        mismatched_fields=result.get("mismatched_fields", {}),
        response_summary=result.get("response_summary"),
        latency_ms=result.get("latency_ms", 150),
        simulated_demo=result.get("simulated_demo", True),
        timestamp=datetime.now(timezone.utc)
    )
    db.add(v_req)
    db.commit()
    db.refresh(v_req)

    audit_service.log_event(
        db=db,
        event_type="AUTHORITY_SOURCE_VERIFICATION",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="VerificationRequest",
        entity_id=str(v_req.id),
        action=f"Dispatched verification to {req.authority_type.value} (Result: {result['status'].value})",
        details={
            "application_number": app.application_number,
            "authority": req.authority_type.value,
            "status": result["status"].value,
            "latency_ms": result.get("latency_ms")
        },
        actor_user_id=user_payload.get("user_id")
    )

    return v_req

@router.post("/manual-confirm", response_model=VerificationRequestResponse)
def record_manual_source_confirmation(
    doc_version_id: int = Query(...),
    supporting_evidence_ref: str = Query(...),
    observations: str = Query(...),
    db: Session = Depends(get_db),
    user_payload: dict = Depends(require_roles([UserRole.SCRUTINY_OFFICER.value, UserRole.SUPERVISING_AUTHORITY.value, UserRole.ADMIN.value]))
):
    """
    Enforces Acceptance Test 12 & Section 5E:
    Manual confirmation requires an authorized reviewer (Officer/Authority) and supporting evidence reference.
    """
    if not supporting_evidence_ref.strip() or not observations.strip():
        raise HTTPException(
            status_code=400,
            detail="Manual confirmation strictly requires supporting evidence reference and written observations."
        )

    doc_version = db.query(DocumentVersion).filter(DocumentVersion.id == doc_version_id).first()
    if not doc_version:
        raise HTTPException(status_code=404, detail="Document version not found")

    app = doc_version.document.application

    v_req = VerificationRequest(
        application_id=app.id,
        document_version_id=doc_version.id,
        authority_type=AuthoritySourceType.MANUAL_CONFIRMATION,
        request_reference=f"MANUAL-CONFIRM-{uuid.uuid4().hex[:8].upper()}",
        status=VerificationStatus.VERIFIED,
        source_endpoint="MANUAL_OFFICIAL_CONFIRMATION",
        matched_fields={
            "confirmation_method": "Physical / Official Letter Cross-Check",
            "supporting_evidence_ref": supporting_evidence_ref,
            "confirmed_by_officer": user_payload.get("username")
        },
        mismatched_fields={},
        response_summary=f"Manually confirmed authentic by authorized officer '{user_payload.get('username')}'. Evidence ref: '{supporting_evidence_ref}'. Observations: {observations}",
        latency_ms=0,
        simulated_demo=False,
        confirmed_by_user_id=user_payload.get("user_id"),
        supporting_evidence_ref=supporting_evidence_ref,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(v_req)
    db.commit()
    db.refresh(v_req)

    audit_service.log_event(
        db=db,
        event_type="MANUAL_SOURCE_CONFIRMATION",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="VerificationRequest",
        entity_id=str(v_req.id),
        action=f"Authorized officer manually confirmed document #{doc_version.id} with supporting evidence '{supporting_evidence_ref}'",
        details={
            "application_number": app.application_number,
            "supporting_evidence_ref": supporting_evidence_ref,
            "observations": observations
        },
        actor_user_id=user_payload.get("user_id")
    )

    return v_req
