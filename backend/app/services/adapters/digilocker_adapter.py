import time
from typing import Dict, Any
from .base_adapter import AuthorityAdapter
from ...models.models import VerificationStatus, AuthoritySourceType

class DigiLockerAdapter(AuthorityAdapter):
    @property
    def source_type(self) -> AuthoritySourceType:
        return AuthoritySourceType.DIGILOCKER

    @property
    def endpoint_name(self) -> str:
        return "https://api.digitallocker.gov.in/public/oauth2/1/pull/uri (Simulated Adapter)"

    def verify(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        t0 = time.time()
        doc_type = payload.get("document_type", "")
        doc_number = payload.get("doc_number", "")
        inst_name = payload.get("institution_name", "")
        scenario = payload.get("scenario", "NORMAL")

        # Simulate latency
        latency_ms = int((time.time() - t0) * 1000) + 120

        if scenario == "SOURCE_UNAVAILABLE":
            return {
                "status": VerificationStatus.SOURCE_UNAVAILABLE,
                "matched_fields": {},
                "mismatched_fields": {},
                "response_summary": "[SIMULATED DEMO] DigiLocker Gateway connection timed out (HTTP 503 Service Unavailable). Document remains in status: SOURCE UNAVAILABLE pending retry.",
                "latency_ms": 3200,
                "simulated_demo": True
            }

        if scenario == "EXPIRED":
            return {
                "status": VerificationStatus.EXPIRED,
                "matched_fields": {
                    "document_id": doc_number,
                    "issuing_authority": "Directorate of Fire Safety"
                },
                "mismatched_fields": {
                    "valid_until": {"expected_minimum": "2025-06-30", "issued_until": "2024-03-31"}
                },
                "response_summary": "[SIMULATED DEMO] DigiLocker pull verified document authenticity, but certificate has passed validity end date.",
                "latency_ms": latency_ms,
                "simulated_demo": True
            }

        return {
            "status": VerificationStatus.VERIFIED,
            "matched_fields": {
                "issuer_uri": f"in.gov.digitallocker.aicte.{doc_number}",
                "institution_name": inst_name,
                "provenance": "Cryptographically signed by Ministry of Electronics & IT (MeitY) Certifying Authority"
            },
            "mismatched_fields": {},
            "response_summary": f"[SIMULATED DEMO] Successfully verified against National Academic Depository (NAD / DigiLocker). Document URI validated with digital signature.",
            "latency_ms": latency_ms,
            "simulated_demo": True
        }
