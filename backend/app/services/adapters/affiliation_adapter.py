import time
from typing import Dict, Any
from .base_adapter import AuthorityAdapter
from ...models.models import VerificationStatus, AuthoritySourceType

class UniversityAffiliationAdapter(AuthorityAdapter):
    @property
    def source_type(self) -> AuthoritySourceType:
        return AuthoritySourceType.UNIVERSITY_AFFILIATION

    @property
    def endpoint_name(self) -> str:
        return "https://affiliation-registry.ac.in/api/v2/verify (Simulated Adapter)"

    def verify(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        t0 = time.time()
        scenario = payload.get("scenario", "NORMAL")
        inst_name = payload.get("institution_name", "Apex Institute")
        acad_year = payload.get("academic_year", "2025-26")

        latency_ms = int((time.time() - t0) * 1000) + 140

        if scenario == "SOURCE_UNAVAILABLE":
            return {
                "status": VerificationStatus.SOURCE_UNAVAILABLE,
                "matched_fields": {},
                "mismatched_fields": {},
                "response_summary": "[SIMULATED DEMO] University portal backend returned 504 Gateway Timeout. Document not rejected; flagged for automated retry.",
                "latency_ms": 4100,
                "simulated_demo": True
            }

        if scenario == "MISMATCH":
            return {
                "status": VerificationStatus.MISMATCH_DETECTED,
                "matched_fields": {
                    "university": "State Technological University"
                },
                "mismatched_fields": {
                    "registered_name": {
                        "application": inst_name,
                        "university_records": "Apex Global Polytechnic (Erstwhile)"
                    }
                },
                "response_summary": "[SIMULATED DEMO] Affiliation registry returned conflicting institution nomenclature. Officer manual review required.",
                "latency_ms": latency_ms,
                "simulated_demo": True
            }

        return {
            "status": VerificationStatus.VERIFIED,
            "matched_fields": {
                "institution_name": inst_name,
                "affiliation_status": "Provisional Approval Granted",
                "academic_year": acad_year,
                "approved_intake": 480
            },
            "mismatched_fields": {},
            "response_summary": f"[SIMULATED DEMO] University affiliation record confirmed for academic session {acad_year} under State Technological University registry.",
            "latency_ms": latency_ms,
            "simulated_demo": True
        }
