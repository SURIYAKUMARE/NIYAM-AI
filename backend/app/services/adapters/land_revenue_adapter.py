import time
from typing import Dict, Any
from .base_adapter import AuthorityAdapter
from ...models.models import VerificationStatus, AuthoritySourceType

class LandRevenueAdapter(AuthorityAdapter):
    @property
    def source_type(self) -> AuthoritySourceType:
        return AuthoritySourceType.LAND_REVENUE_PORTAL

    @property
    def endpoint_name(self) -> str:
        return "https://bhulekh.gov.in/api/v1/mutation-verify (Simulated Adapter)"

    def verify(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        t0 = time.time()
        scenario = payload.get("scenario", "NORMAL")
        survey_no = payload.get("survey_no", "142/2A")

        latency_ms = int((time.time() - t0) * 1000) + 160

        if scenario == "SOURCE_UNAVAILABLE":
            return {
                "status": VerificationStatus.SOURCE_UNAVAILABLE,
                "matched_fields": {},
                "mismatched_fields": {},
                "response_summary": "[SIMULATED DEMO] State Land Revenue Registry API is unreachable during scheduled maintenance window.",
                "latency_ms": 3500,
                "simulated_demo": True
            }

        if scenario == "MISMATCH":
            return {
                "status": VerificationStatus.MISMATCH_DETECTED,
                "matched_fields": {
                    "survey_number": survey_no
                },
                "mismatched_fields": {
                    "registered_owner": {
                        "deed_document": payload.get("owner_name", "Vidyapeeth Education Trust"),
                        "government_revenue_khasra": "Kalyan Industrial Real Estate Corp (Unmutated)"
                    }
                },
                "response_summary": "[SIMULATED DEMO] Title mismatch: Sub-Registrar 7/12 land ledger shows unmutated commercial title not transferred to sponsoring educational society.",
                "latency_ms": latency_ms,
                "simulated_demo": True
            }

        return {
            "status": VerificationStatus.VERIFIED,
            "matched_fields": {
                "khasra_survey_no": survey_no,
                "title_holder": payload.get("owner_name", "Vidyapeeth Education Trust"),
                "land_classification": "Educational / Non-Agricultural (NA)",
                "encumbrance_status": "Nil / Free of Mortgage"
            },
            "mismatched_fields": {},
            "response_summary": "[SIMULATED DEMO] Revenue land record confirmed authentic. Contiguous non-agricultural land verified under registered trust.",
            "latency_ms": latency_ms,
            "simulated_demo": True
        }
