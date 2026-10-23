from datetime import datetime, timezone, date
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models.models import (
    Application, Document, DocumentVersion, ExtractedField, Rule, ChecklistItem,
    ValidationRun, Finding, FindingSeverity, FindingStatus, RuleSet
)
from .anomaly_service import anomaly_service

class ComplianceEngine:
    def execute_validation_run(
        self,
        db: Session,
        application_id: int,
        triggered_by_user_id: int,
        override_rule_version: Optional[str] = None
    ) -> ValidationRun:
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise ValueError(f"Application {application_id} not found")

        rule_version = override_rule_version or app.rule_set_version or "v2025.1"
        
        # Load active checklist items and rules for this version & category
        checklist_items = db.query(ChecklistItem).filter(
            ChecklistItem.rule_set_version == rule_version,
            (ChecklistItem.category_code == app.category_code) | (ChecklistItem.category_code == "ALL")
        ).all()

        active_rules = db.query(Rule).filter(
            Rule.rule_set_version == rule_version,
            Rule.is_active == True,
            (Rule.category_code == app.category_code) | (Rule.category_code == "ALL")
        ).all()

        validation_run = ValidationRun(
            application_id=application.id if hasattr(application := app, 'id') else application_id,
            rule_set_version=rule_version,
            triggered_by_user_id=triggered_by_user_id,
            total_rules_evaluated=len(active_rules) + len(checklist_items),
            findings_count=0,
            status="SUCCESS",
            run_at=datetime.now(timezone.utc)
        )
        db.add(validation_run)
        db.flush()

        findings_to_create: List[Finding] = []

        # 1. Checklist Evaluation: Check for missing mandatory documents
        docs_by_item: Dict[str, Document] = {}
        for doc in app.documents:
            docs_by_item[doc.checklist_item_code] = doc

        for item in checklist_items:
            if item.is_mandatory:
                doc = docs_by_item.get(item.item_code)
                if not doc or not doc.current_version_id or doc.status == "PENDING_UPLOAD":
                    findings_to_create.append(Finding(
                        validation_run_id=validation_run.id,
                        application_id=app.id,
                        document_version_id=None,
                        rule_code="RULE-MANDATORY-DOC-01",
                        category="MISSING_DOCUMENT",
                        severity=FindingSeverity.CRITICAL,
                        explanation=f"Mandatory submission requirement missing: '{item.title}' has not been uploaded.",
                        expected_value=f"Uploaded valid document conforming to {item.title}",
                        observed_value="No document uploaded",
                        rule_citation=f"AICTE APH {rule_version}, Checklist Requirement {item.item_code}",
                        detection_method="deterministic-checklist-verifier",
                        confidence_score=1.0,
                        status=FindingStatus.OPEN
                    ))

        # Build index of extracted fields per document item code
        extracted_by_item: Dict[str, Dict[str, Any]] = {}
        doc_version_map: Dict[str, DocumentVersion] = {}

        for doc in app.documents:
            if doc.current_version_id:
                latest_v = db.query(DocumentVersion).filter(DocumentVersion.id == doc.current_version_id).first()
                if latest_v:
                    doc_version_map[doc.checklist_item_code] = latest_v
                    field_dict = {}
                    for f in latest_v.extracted_fields:
                        val = f.corrected_value if f.is_corrected else f.original_value
                        field_dict[f.field_name] = val
                    extracted_by_item[doc.checklist_item_code] = field_dict

                    # Check for low-confidence extraction
                    for f in latest_v.extracted_fields:
                        if f.is_low_confidence and not f.is_corrected:
                            findings_to_create.append(Finding(
                                validation_run_id=validation_run.id,
                                application_id=app.id,
                                document_version_id=latest_v.id,
                                rule_code="RULE-EXTRACTION-CONF-01",
                                category="EXTRACTION_UNCERTAINTY",
                                severity=FindingSeverity.MINOR,
                                explanation=f"Low OCR confidence ({int(f.confidence_score * 100)}%) on field '{f.field_name}'. Manual scrutiny or applicant clarification advised.",
                                expected_value="Clear, legible official document text (>70% confidence)",
                                observed_value=f.original_value,
                                rule_citation="Document Processing Guidelines, Section 4.2",
                                page_number=f.page_number,
                                bounding_box=f.bounding_box,
                                excerpt=f.raw_text_excerpt,
                                detection_method=f.extraction_method,
                                confidence_score=f.confidence_score,
                                status=FindingStatus.OPEN
                            ))

                    # Check for exact duplicate cryptographic hash
                    dup_result = anomaly_service.check_cryptographic_duplicates(
                        db, latest_v.id, latest_v.sha256_hash, app.id
                    )
                    if dup_result:
                        findings_to_create.append(Finding(
                            validation_run_id=validation_run.id,
                            application_id=app.id,
                            document_version_id=latest_v.id,
                            rule_code="RULE-DUPLICATE-HASH-01",
                            category="DUPLICATE_ANOMALY",
                            severity=FindingSeverity.CRITICAL,
                            explanation=dup_result["explanation"],
                            expected_value="Unique institutional document specific to this applicant entity",
                            observed_value=f"Identical SHA-256: {latest_v.sha256_hash[:16]}...",
                            rule_citation="AICTE Statutory Scrutiny Guidelines, Duplicate Prevention Clause 2.1",
                            detection_method="sha256-cryptographic-hash-matcher",
                            confidence_score=1.0,
                            status=FindingStatus.OPEN
                        ))

        # 2. Rule evaluation (Deterministic regulatory checks)
        for rule in active_rules:
            cfg = rule.condition_config or {}
            cond_type = rule.condition_type

            if cond_type == "DATE_NOT_EXPIRED":
                doc_code = cfg.get("document_code", "DOC-FIRE-NOC")
                field_name = cfg.get("date_field", "valid_until_date")
                latest_v = doc_version_map.get(doc_code)
                if latest_v:
                    doc_fields = extracted_by_item.get(doc_code, {})
                    date_val_str = doc_fields.get(field_name)
                    if date_val_str:
                        try:
                            # Parse YYYY-MM-DD
                            exp_date = datetime.strptime(date_val_str.strip(), "%Y-%m-%d").date()
                            today = date.today()
                            if exp_date < today:
                                findings_to_create.append(Finding(
                                    validation_run_id=validation_run.id,
                                    application_id=app.id,
                                    document_version_id=latest_v.id,
                                    rule_code=rule.rule_code,
                                    category="EXPIRY",
                                    severity=rule.severity,
                                    explanation=f"Regulatory Expiry: {rule.title}. The submitted certificate expired on {exp_date.strftime('%d-%b-%Y')}.",
                                    expected_value=f"Valid at least until the end of academic session {app.academic_year}",
                                    observed_value=f"Expired on {exp_date.isoformat()}",
                                    rule_citation=rule.source_handbook_ref,
                                    page_number=1,
                                    detection_method="deterministic-date-comparator",
                                    confidence_score=1.0,
                                    status=FindingStatus.OPEN
                                ))
                        except Exception:
                            pass

            elif cond_type == "CROSS_FIELD_MATCH":
                # Check cross-document consistency
                anomalies = anomaly_service.check_cross_document_consistency(extracted_by_item)
                for anom in anomalies:
                    v_id = doc_version_map.get("DOC-LAND-DEED")
                    findings_to_create.append(Finding(
                        validation_run_id=validation_run.id,
                        application_id=app.id,
                        document_version_id=v_id.id if v_id else None,
                        rule_code=anom["rule_code"],
                        category=anom["category"],
                        severity=anom["severity"],
                        explanation=anom["explanation"],
                        expected_value=anom.get("expected_value"),
                        observed_value=anom.get("observed_value"),
                        rule_citation=anom.get("rule_citation"),
                        excerpt=anom.get("excerpt"),
                        detection_method=anom.get("detection_method"),
                        confidence_score=1.0,
                        status=FindingStatus.OPEN
                    ))

            elif cond_type == "TER_PAYMENT_VERIFIED":
                if app.ter_payment_status != "PAID":
                    findings_to_create.append(Finding(
                        validation_run_id=validation_run.id,
                        application_id=app.id,
                        document_version_id=None,
                        rule_code=rule.rule_code,
                        category="COMPLIANCE_DEFICIENCY",
                        severity=FindingSeverity.CRITICAL,
                        explanation="Technical Education Regulatory (TER) Processing Fee is not verified as settled.",
                        expected_value="Reconciled TER payment status = PAID",
                        observed_value=f"Current status: {app.ter_payment_status}",
                        rule_citation=rule.source_handbook_ref,
                        detection_method="reconciliation-engine",
                        confidence_score=1.0,
                        status=FindingStatus.OPEN
                    ))

        # Persist findings
        for f in findings_to_create:
            db.add(f)

        validation_run.findings_count = len(findings_to_create)
        if any(f.severity == FindingSeverity.CRITICAL for f in findings_to_create):
            validation_run.status = "ERRORS_FOUND"
            app.status = "DEFICIENCIES_DETECTED"
        elif findings_to_create:
            validation_run.status = "WARNINGS_FOUND"
            app.status = "DEFICIENCIES_DETECTED"
        else:
            validation_run.status = "SUCCESS"
            app.status = "PRELIMINARY_CHECK_PASSED"

        # Update overall risk score
        crit_count = sum(1 for f in findings_to_create if f.severity == FindingSeverity.CRITICAL)
        maj_count = sum(1 for f in findings_to_create if f.severity == FindingSeverity.MAJOR)
        min_count = sum(1 for f in findings_to_create if f.severity == FindingSeverity.MINOR)
        app.overall_risk_score = round(min(100.0, (crit_count * 35.0) + (maj_count * 15.0) + (min_count * 5.0)), 1)

        db.commit()
        db.refresh(validation_run)
        return validation_run

compliance_engine = ComplianceEngine()
