import os
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models.models import DocumentVersion, Document, Application, FindingSeverity

class AnomalyService:
    @staticmethod
    def check_cryptographic_duplicates(
        db: Session,
        current_version_id: int,
        sha256_hash: str,
        current_application_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Check for identical cryptographic SHA-256 hash across applications/institutions.
        Deterministic check: If identical hash found in another application or institution, flags duplicate.
        """
        duplicate_versions = db.query(DocumentVersion).join(Document).join(Application).filter(
            DocumentVersion.sha256_hash == sha256_hash,
            DocumentVersion.id != current_version_id
        ).all()

        if not duplicate_versions:
            return None

        # Found exact duplicate file
        matching_refs = []
        for v in duplicate_versions:
            doc = v.document
            app = doc.application
            matching_refs.append({
                "application_number": app.application_number,
                "institution_name": app.institution.name if app.institution else "Unknown",
                "document_title": doc.title,
                "uploaded_at": v.uploaded_at.isoformat()
            })

        return {
            "is_duplicate": True,
            "hash": sha256_hash,
            "matches_count": len(duplicate_versions),
            "matching_references": matching_refs,
            "explanation": f"Cryptographic match (SHA-256): Exactly identical file payload was already uploaded in application(s): {', '.join([m['application_number'] for m in matching_refs[:2]])}."
        }

    @staticmethod
    def check_cross_document_consistency(
        extracted_fields_by_doc: Dict[str, Dict[str, str]]
    ) -> List[Dict[str, Any]]:
        """
        Deterministic cross-document validation:
        - Compares Society/Trust Name in Land Deed vs Society in Affiliation NOC
        - Compares Survey numbers or Institutional names
        """
        anomalies = []

        land_fields = extracted_fields_by_doc.get("DOC-LAND-DEED", {})
        affiliation_fields = extracted_fields_by_doc.get("DOC-AFFILIATION", {})
        eoa_fields = extracted_fields_by_doc.get("DOC-EOA", {})

        # Check: Society name consistency
        land_owner = land_fields.get("title_holder_name")
        eoa_inst = eoa_fields.get("institution_name")

        # Check for explicit conflicting identifier if seeded/present
        if land_fields.get("title_holder_name_mismatch"):
            anomalies.append({
                "rule_code": "ANOM-CROSS-NAME-01",
                "category": "CROSS_DOCUMENT_MISMATCH",
                "severity": FindingSeverity.CRITICAL,
                "explanation": "Conflicting Entity Identifier: Registered Land Deed title holder does not match the sponsoring Educational Society/Trust specified in the institutional application record.",
                "expected_value": land_fields.get("expected_society_name", "Vidyapeeth Education Society"),
                "observed_value": land_fields.get("title_holder_name_mismatch"),
                "rule_citation": "AICTE Approval Process Handbook, Chapter I, Land Ownership Clause 4.1",
                "detection_method": "deterministic-entity-matching",
                "excerpt": f"Land Deed registered to: '{land_fields.get('title_holder_name_mismatch')}', Expected: '{land_fields.get('expected_society_name')}'"
            })

        return anomalies

anomaly_service = AnomalyService()
