import time
from urllib.parse import urlparse
from typing import Dict, Any
from .base_adapter import AuthorityAdapter
from ...models.models import VerificationStatus, AuthoritySourceType

# Explicit strict whitelist of allowed issuing domain suffixes (Prevents SSRF)
ALLOWED_AUTHORITY_DOMAINS = {
    "aicte-india.org",
    "gov.in",
    "nic.in",
    "digitallocker.gov.in",
    "bharatkosh.gov.in"
}

class QRSignatureAdapter(AuthorityAdapter):
    @property
    def source_type(self) -> AuthoritySourceType:
        return AuthoritySourceType.QR_SIGNATURE_SERVICE

    @property
    def endpoint_name(self) -> str:
        return "https://verify.aicte-india.org/sec/dss-verify (Simulated Adapter)"

    def verify(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        t0 = time.time()
        scenario = payload.get("scenario", "NORMAL")
        embedded_qr_payload = payload.get("qr_data", "https://verify.aicte-india.org/doc/2024-EOA-991204")

        # SSRF Protection: strictly inspect hostname before calling or trusting
        parsed = urlparse(embedded_qr_payload)
        hostname = parsed.hostname or ""
        is_safe_domain = any(hostname.endswith(domain) for domain in ALLOWED_AUTHORITY_DOMAINS)

        latency_ms = int((time.time() - t0) * 1000) + 130

        if not is_safe_domain and embedded_qr_payload.startswith("http"):
            return {
                "status": VerificationStatus.MANUAL_REVIEW_REQUIRED,
                "matched_fields": {},
                "mismatched_fields": {
                    "unauthorized_qr_target": embedded_qr_payload
                },
                "response_summary": f"[SECURITY AUDIT] Decoded QR points to external untrusted host '{hostname}'. Arbitrary URL fetching prevented. Physical scrutiny required.",
                "latency_ms": latency_ms,
                "simulated_demo": True
            }

        if scenario == "SOURCE_UNAVAILABLE":
            return {
                "status": VerificationStatus.SOURCE_UNAVAILABLE,
                "matched_fields": {},
                "mismatched_fields": {},
                "response_summary": "[SIMULATED DEMO] Digital Signature Service (DSS) OCSP responder unavailable. Document not invalidated.",
                "latency_ms": 3100,
                "simulated_demo": True
            }

        return {
            "status": VerificationStatus.VERIFIED,
            "matched_fields": {
                "signer_identity": "Director, AICTE Regulation Bureau (DSC Class 3)",
                "timestamp_token": "2024-05-18T10:14:02Z",
                "x509_cert_valid": True,
                "signature_algorithm": "SHA256withRSA"
            },
            "mismatched_fields": {},
            "response_summary": "[SIMULATED DEMO] Digital signature valid. Public key verified against CCA India root chain of trust.",
            "latency_ms": latency_ms,
            "simulated_demo": True
        }
