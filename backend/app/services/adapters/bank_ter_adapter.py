import time
from typing import Dict, Any
from .base_adapter import AuthorityAdapter
from ...models.models import VerificationStatus, AuthoritySourceType

class BankTERAdapter(AuthorityAdapter):
    @property
    def source_type(self) -> AuthoritySourceType:
        return AuthoritySourceType.BANK_TER_GATEWAY

    @property
    def endpoint_name(self) -> str:
        return "https://bharatkosh.gov.in/pg/aicte/reconciliation (Simulated Adapter)"

    def verify(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        t0 = time.time()
        scenario = payload.get("scenario", "NORMAL")
        tx_ref = payload.get("ter_ref", "AICTE-TER-2025-884920")

        latency_ms = int((time.time() - t0) * 1000) + 110

        if scenario == "SOURCE_UNAVAILABLE":
            return {
                "status": VerificationStatus.SOURCE_UNAVAILABLE,
                "matched_fields": {},
                "mismatched_fields": {},
                "response_summary": "[SIMULATED DEMO] Central Payment Gateway Bharatkosh reconciliation endpoint timeout.",
                "latency_ms": 3000,
                "simulated_demo": True
            }

        return {
            "status": VerificationStatus.VERIFIED,
            "matched_fields": {
                "transaction_id": tx_ref,
                "payment_gateway": "Bharatkosh / SBI ePay",
                "status": "SETTLED_SUCCESS",
                "amount": "INR 3,00,000.00",
                "payment_head": "AICTE Processing TER Charges 2025-26"
            },
            "mismatched_fields": {},
            "response_summary": "[SIMULATED DEMO] Electronic payment confirmed settled with AICTE designated treasury account.",
            "latency_ms": latency_ms,
            "simulated_demo": True
        }
