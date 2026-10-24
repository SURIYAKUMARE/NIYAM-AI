# NIYAM — Release Readiness Checklist & Dependency Audit
**Release Version:** v1.0.0-PROTOTYPE  
**Target Release Date:** October 2026  
**Problem Statement ID:** 26261 | AICTE Regulation Bureau

---

## 1. Readiness Summary

| Category | Status | Verified Evidence |
| :--- | :--- | :--- |
| **Acceptance Test Suite** | **READY (17/17 Passed)** | `pytest backend/tests/test_compliance_and_isolation.py -v` executed with 100% pass rate. |
| **Frontend Production Build** | **READY (21/21 Routes)** | `next build` compiled with static optimization and clean type evaluation. |
| **Zero-Trust Institutional RBAC** | **ENFORCED** | Server-side boundary checks on every endpoint (`403 Forbidden` on cross-institution access). |
| **Document Processing & OCR** | **OPERATIONAL** | Layout parser, confidence scoring, visual bounding box coordinates, and prompt-injection redactor. |
| **Audit Ledger Integrity** | **TAMPER-EVIDENT** | Cryptographically chained SHA-256 historical block log verified via `GET /api/v1/audit/verify-chain`. |
| **Backup & Restoration** | **VERIFIED** | Automated backup generation and checksum restoration verified in test suite (`test_acceptance_16`). |

---

## 2. External Connector Audit: Verified vs. Unconfigured

To maintain scientific integrity and comply with statutory scrutiny expectations, external connectors are audited as follows:

| Issuing Authority Connector | Adapter Type | Current Configuration | Production Requirements for Live Activation |
| :--- | :--- | :--- | :--- |
| **DigiLocker Regulatory Hub** | Simulated Adapter | **CONFIGURED (DEMO)** | Production API Key & OAuth 2.0 Client credentials from DigiLocker National Gateway. |
| **State Land Revenue Registry** | Simulated Adapter | **CONFIGURED (DEMO)** | State Land Portal XML/JSON endpoint credentials & IP whitelisting. |
| **Affiliating University Portal** | Simulated Adapter | **CONFIGURED (DEMO)** | State Technical University academic database API token. |
| **TER Bank Fee Gateway** | Simulated Adapter | **CONFIGURED (DEMO)** | Scheduled bank gateway merchant key & reconciliation webhook certificate. |
| **Cryptographic QR Decoder** | Heuristic Parser | **OPERATIONAL** | Public key infrastructure (PKI) root certificate for digital signatures. |

> [!NOTE]
> All simulated connector responses are explicitly labeled in the UI (`[SIMULATED DEMO ADAPTER]`) and never disguised as live government production records.

---

## 3. Security Audit & Hardening

1. **Prompt Injection Sanitization:** Implemented in [`backend/app/core/security.py`](backend/app/core/security.py). Malicious text inside uploaded PDFs (`"Ignore previous instructions"`) is quarantined and replaced with `[REDACTED_PROMPT_INJECTION]`.
2. **File Size & Type Bounds:** Maximum file size capped at 25 MB; accepted MIME types strictly restricted to `application/pdf`, `image/png`, and `image/jpeg`.
3. **Secret Isolation:** No secrets, API keys, or JWT tokens are committed to source control. Configuration templates are provided in [`.env.example`](.env.example).
4. **Session Security:** Standard 8-hour access token expiration with official-user MFA challenge.

---

## 4. Unresolved Dependencies & External Pre-requisites

1. **State Government Data Agreements:** Direct real-time Land Revenue checks require bilateral data-sharing MOUs with respective state revenue inspectorates.
2. **University Registrar Webhooks:** Real-time course intake quotas require technical integration with university examination branches.
