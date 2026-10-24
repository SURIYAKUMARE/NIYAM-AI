import os
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_payload, verify_institution_access
from ..core.storage import storage_provider
from ..models.models import (
    Application, Document, DocumentVersion, DocumentStatus, ExtractedField, UserRole
)
from ..schemas.schemas import DocumentResponse, DocumentVersionResponse
from ..services.ocr_service import ocr_service
from ..services.audit_service import audit_service
from ..services.malware_scanner import malware_scanner

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload/{doc_id}", response_model=DocumentResponse)
async def upload_document_version(
    doc_id: int,
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document checklist slot not found")

    app = doc.application
    verify_institution_access(user_payload, app.institution_id)

    # Read bytes safely
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    # Operational malware and threat quarantine scanner
    scan_report = malware_scanner.scan_file(file_bytes, file.filename or "uploaded_document.pdf")
    if not scan_report["is_safe"]:
        audit_service.log_event(
            db=db,
            event_type="MALWARE_BLOCKED",
            actor_username=user_payload.get("username", "system"),
            actor_role=user_payload.get("role", "unknown"),
            entity_type="DOCUMENT",
            entity_id=str(doc_id),
            action="UPLOAD_BLOCKED_MALWARE",
            details={
                "threat": scan_report["threat_name"],
                "file_name": file.filename,
                "quarantined_at": scan_report["quarantine_path"],
                "sha256": scan_report["sha256"]
            },
            actor_user_id=user_payload.get("user_id")
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Security Violation: File rejected by operational malware scanner ({scan_report['threat_name']}). Payload quarantined."
        )

    # Store via storage provider (computes SHA-256 and validates MIME)
    storage_path, sha256_hash, mime_type, file_size = storage_provider.store_file(
        content=file_bytes,
        original_filename=file.filename or "uploaded_document.pdf"
    )

    # Compute version number
    version_num = len(doc.versions) + 1

    doc_version = DocumentVersion(
        document_id=doc.id,
        version_number=version_num,
        file_name=file.filename or f"doc_v{version_num}.pdf",
        file_size=file_size,
        mime_type=mime_type,
        sha256_hash=sha256_hash,
        storage_path=storage_path,
        uploaded_by_user_id=user_payload.get("user_id"),
        uploaded_at=datetime.now(timezone.utc),
        is_duplicate_detected=False,
        malware_scan_status=scan_report["scan_status"],
        scan_engine=scan_report["scanner_engine"]
    )
    db.add(doc_version)
    db.flush()

    doc.current_version_id = doc_version.id
    doc.status = DocumentStatus.VALIDATED if version_num == 1 else DocumentStatus.RECTIFIED

    # Execute OCR and structured extraction
    hints = {
        "institution_name": app.institution.name if app.institution else "Applicant Institute",
        "aicte_id": app.institution.aicte_permanent_id if app.institution else "1-00000000",
        "academic_year": app.academic_year
    }
    extracted_data = ocr_service.extract_document_data(
        file_path=storage_path,
        mime_type=mime_type,
        checklist_code=doc.checklist_item_code,
        hints=hints
    )

    for field_info in extracted_data:
        ef = ExtractedField(
            document_version_id=doc_version.id,
            field_name=field_info["field_name"],
            original_value=field_info["original_value"],
            confidence_score=field_info["confidence_score"],
            is_low_confidence=field_info["is_low_confidence"],
            page_number=field_info["page_number"],
            bounding_box=field_info.get("bounding_box"),
            raw_text_excerpt=field_info.get("raw_text_excerpt"),
            extraction_method=field_info["extraction_method"]
        )
        db.add(ef)

    db.commit()
    db.refresh(doc)

    # Audit log
    audit_service.log_event(
        db=db,
        event_type="DOCUMENT_UPLOAD",
        actor_username=user_payload.get("username"),
        actor_role=user_payload.get("role"),
        entity_type="DocumentVersion",
        entity_id=str(doc_version.id),
        action=f"Uploaded version {version_num} for document '{doc.title}' (SHA-256: {sha256_hash[:12]}...)",
        details={
            "application_number": app.application_number,
            "document_title": doc.title,
            "version_number": version_num,
            "sha256": sha256_hash,
            "fields_extracted_count": len(extracted_data)
        },
        actor_user_id=user_payload.get("user_id")
    )

    return doc

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document_by_id(
    doc_id: int,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document checklist slot not found")
    verify_institution_access(user_payload, doc.application.institution_id)
    return doc

@router.get("/{doc_id}/access-token")
def get_secure_document_token(
    doc_id: int,
    version_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    """
    Issues short-lived signed JWT for secure private streaming
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    verify_institution_access(user_payload, doc.application.institution_id)

    target_v_id = version_id or doc.current_version_id
    doc_version = db.query(DocumentVersion).filter(DocumentVersion.id == target_v_id).first()
    if not doc_version:
        raise HTTPException(status_code=404, detail="No document version available")

    token = storage_provider.generate_signed_token(
        storage_path=doc_version.storage_path,
        doc_id=doc.id,
        user_id=user_payload.get("user_id"),
        expires_in=900  # 15 minutes
    )
    return {"token": token, "file_name": doc_version.file_name, "mime_type": doc_version.mime_type}

@router.get("/stream/{token}")
def stream_document_content(token: str):
    """
    Safely stream private document content given signed token
    """
    storage_path = storage_provider.verify_signed_token(token)
    if not os.path.exists(storage_path):
        raise HTTPException(status_code=404, detail="Document file not found on disk")

    ext = os.path.splitext(storage_path)[1].lower()
    media_type = "application/pdf" if ext == ".pdf" else "image/png"
    return FileResponse(storage_path, media_type=media_type)
