# AICTE Verify — Application & Compliance Intelligence

**Problem Statement ID:** 26261  
**Title:** AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification  
**Organization:** AICTE, Regulation Bureau  
**Category:** Software | **Theme:** Smart Automation  

> **Core Statutory Principle:** AI provides advisory risk flags and structured evidence extraction. Competent AICTE authorities retain statutory scrutiny, physical inspection, and final regulatory decision-making mandates. This application contains illustrative demonstration rules and synthetic demonstration records for technical evaluation.

---

## 1. System Overview & Architecture

**AICTE Verify** is an enterprise public-sector platform designed to streamline institutional application validation, automate document authentication, detect anomalies, evaluate versioned regulatory rules deterministically, and provide evidence-linked human review workspaces.

```
                      +---------------------------------------+
                      |       Next.js 14 Enterprise UI        |
                      |  (Deep Navy, Tailwind, 14 Workspaces) |
                      +-------------------+-------------------+
                                          |
                              REST / JSON Web Tokens
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        FastAPI Compliance & Scrutiny Engine                       |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | Role Auth & Data   |  | OCR & Structured     |  | Deterministic Regulatory  |  |
|  | Isolation Guard    |  | Layout Parser        |  | Compliance Engine         |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | Pluggable Authority|  | Computer Vision /    |  | Chained Tamper-Evident    |  |
|  | Adapters Framework |  | Facility Checker     |  | SHA-256 Audit Logger      |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
+-------------------+-------------------+--------------------+----------------------+
                    |                   |                    |
                    v                   v                    v
          +-------------------+  +---------------+  +------------------+
          |  Persistent Data  |  | Private S3 /  |  | Simulated Auth   |
          |  (Postgres/SQLite)|  | Local Storage |  | Source Adapters  |
          +-------------------+  +---------------+  +------------------+
```

---

## 2. Server-Enforced Role-Based Access Control

The platform enforces zero-trust server-side data isolation, RFC 6238 Time-based One-Time Password (TOTP) two-factor authentication for official regulatory roles, and strict role boundaries:

| Role | Username | Password | MFA Requirement | Permitted Access & Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Institution Applicant** | `applicant` | `password123` | Password Only | **Strict Tenant Isolation**: Can only access their own institution (`1-492048123`). Upload evidence, rectify deficiencies, track verification progress. Cross-institution access blocked with HTTP 403. Scrutiny notes are redacted. |
| **Scrutiny Officer** | `officer` | `password123` | **TOTP MFA Enforced** | Review assigned applications across institutions, inspect extracted OCR fields against visual bounding boxes, confirm/dismiss findings, issue clarifications. Cannot issue statutory final decisions. |
| **Supervising Authority** | `authority` | `password123` | **TOTP MFA Enforced** | Review escalations and officer recommendations, record statutory determinations (`APPROVE`, `REJECT`, `INSPECT`) with mandatory written justifications, view executive analytics. |
| **System Administrator** | `admin` | `password123` | **TOTP MFA Enforced** | Manage versioned rule sets, checklist mappings, source adapter timeouts, user directory. **Privilege Boundary**: Does not automatically receive unrestricted viewing access to private confidential documents. |
| **Statutory Auditor** | `auditor` | `password123` | Password Only | Read-only inspection of append-only audit trail and cryptographic SHA-256 block chain verification. Cannot edit documents, findings, or decisions. |

> **MFA Authentication Details (for `officer`, `authority`, `admin`):**
> - **TOTP Secret (Base32):** `JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP`
> - **Emergency Recovery Code:** `REC-DEMO-2025`
> - Evaluators can use any standard Authenticator app (Google Authenticator, Microsoft Authenticator) or an RFC 6238 TOTP generator.

### Role-to-Feature Permission Matrix

| Feature / Action | Applicant | Scrutiny Officer | Supervising Authority | System Admin | Statutory Auditor |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Institutional Dashboard** (`/institution/dashboard`) | ✅ Full Access | ❌ Blocked (403) | ❌ Blocked (403) | ❌ Blocked (403) | ❌ Blocked (403) |
| **New Application Submission** (`/institution/applications/new`) | ✅ Submit | ❌ Blocked (403) | ❌ Blocked (403) | ❌ Blocked (403) | ❌ Blocked (403) |
| **Document Upload & Rectification** | ✅ Upload | ❌ Blocked (403) | ❌ Blocked (403) | ❌ Blocked (403) | ❌ Blocked (403) |
| **Scrutiny Review Queue** (`/officer/queue`) | ❌ Blocked (403) | ✅ Full Access | ❌ Blocked (403) | ❌ Blocked (403) | ❌ Blocked (403) |
| **OCR Bounding Box & Field Review** (`/review`) | ❌ Blocked (403) | ✅ Review & Correct | ✅ View Only | ❌ Blocked (403) | ❌ Blocked (403) |
| **Confirm Finding / Issue Clarification** | ❌ Blocked (403) | ✅ Scrutiny Action | ❌ Blocked (403) | ❌ Blocked (403) | ❌ Blocked (403) |
| **Record Statutory Decision** (`APPROVE`/`REJECT`/`INSPECT`) | ❌ Blocked (403) | ❌ Blocked (403) | ✅ Mandatory Justification | ❌ Blocked (403) | ❌ Blocked (403) |
| **Executive Analytics** (`/analytics`) | ❌ Blocked (403) | ❌ Blocked (403) | ✅ Full Access | ❌ Blocked (403) | ❌ Blocked (403) |
| **Rule Engine Administration** (`/admin/rules`) | ❌ Blocked (403) | ❌ Blocked (403) | ✅ View Rules | ✅ Author & Activate | ❌ Blocked (403) |
| **User Management** (`/admin/users`) | ❌ Blocked (403) | ❌ Blocked (403) | ❌ Blocked (403) | ✅ Full Access | ❌ Blocked (403) |
| **Append-Only Audit Ledger** (`/audit`) | ❌ Blocked (403) | ✅ View Application Audit | ✅ View Ledger | ✅ View Ledger | ✅ Verify SHA-256 Chain |
| **Internal Scrutiny Notes** | ❌ Redacted | ✅ Visible | ✅ Visible | ❌ Redacted | ✅ Visible |

---

## 3. Connected Functional Workspaces

1. **Production Sign-In & MFA Portal** (`/login`): Secure credentials entry with RFC 6238 TOTP two-factor challenge for regulatory personnel.
2. **Institution Dashboard** (`/institution/dashboard`): Institutional identity, approval year, active deficiency alert banner, and checklist completion metrics.
3. **New Application Wizard** (`/institution/applications/new`): 3-step wizard selecting category (EoA, Increase in Intake, New Institution, Change of Site), course intake matrix, and checklist preview.
4. **Application Catalog** (`/applications`): Filterable, searchable workspace with risk scores and status pills.
5. **Application Detail Workspace** (`/applications/[id]`): Multi-tab flagship view covering document checklist, evidence-linked findings, source verifications, clarifications, and timeline. Action buttons are strictly conditionally rendered based on user role.
6. **Document Upload & Checklist Page** (`/applications/[id]` tab 1): Immutable document versioning, upload/rectify controls, SHA-256 hash tracking.
7. **Document Review Workspace** (`/review`): Split-view layout previewing simulated document pages, visual bounding boxes, OCR confidence scores, and human-in-the-loop field correction with audit logging.
8. **Verification Queue & Source Status** (`/verification`): Live operational status of external issuing authority adapters, latency metrics, and verification request ledger.
9. **Compliance Findings & Rectification Tracker** (`/findings`): Actionable regulatory discrepancies linked to handbook clauses and observed values.
10. **Officer Review Queue** (`/officer/queue`): Assigned applications sorted by risk priority, deficiency count, and scrutiny status.
11. **Infrastructure Evidence Review** (`/infrastructure`): Campus photos, floor plans, geotag markers, computer vision terminal counts, and physical inspection triggers.
12. **Rule & Checklist Administration** (`/admin/rules`): Draft rule set creation, deterministic rule authoring, dry-run testing against sample applications, and version activation.
13. **Statutory Audit History** (`/audit`): Append-only audit trail with live SHA-256 block chain integrity verification.
14. **User & Integration Settings** (`/admin/settings`): Storage retention policies, adapter timeouts, rate limits, and security toggles.

---

## 4. The 9 Synthetic Scenarios

The backend comes pre-seeded with 9 distinct synthetic test scenarios for regulatory evaluation:

| # | Application # | Title | Expected Finding & Behavior |
| :-: | :--- | :--- | :--- |
| **1** | `AICTE-2025-APP-001` | Complete Application (Fully Verified) | Risk: **0.0%**. All checklist items uploaded, valid, authenticated via DigiLocker and Bharatkosh. Preliminary check passed. |
| **2** | `AICTE-2025-APP-002` | Missing Mandatory Document | Risk: **45.0%**. Municipal Sanctioned Building Plan (`DOC-BUILDING-PLAN`) omitted from checklist. Deficiencies detected. |
| **3** | `AICTE-2025-APP-003` | Expired Certificate | Risk: **55.0%**. Fire & Life Safety Certificate expired on 31-Mar-2024. Expiry rule triggered. |
| **4** | `AICTE-2025-APP-004` | Cross-Document Entity Mismatch | Risk: **60.0%**. Registered Land Deed title holder (`Shree Balaji Commercial Developers Ltd`) does not match the sponsoring Trust (`Vidyapeeth Education Trust`). |
| **5** | `AICTE-2025-APP-005` | Exact Duplicate Document (SHA-256) | Risk: **75.0%**. Cryptographic hash match detected with a document uploaded in another application (`APP-001`). Flagged for duplicate scrutiny. |
| **6** | `AICTE-2025-APP-006` | Low-Confidence OCR Extraction | Risk: **20.0%**. Blurred fax scan results in 45% confidence score on institution name. Marked for manual scrutiny and human correction. |
| **7** | `AICTE-2025-APP-007` | External Source Outage | Risk: **15.0%**. DigiLocker adapter returned 504 Gateway Timeout. Document remains valid with non-adverse status `SOURCE_UNAVAILABLE`. |
| **8** | `AICTE-2025-APP-008` | Infrastructure Discrepancy | Risk: **65.0%**. Computer Vision detected 42 computer workstations vs reported 90. Triggers **&quot;Physical inspection may be required&quot;** workflow. |
| **9** | `AICTE-2025-APP-009` | Rectified & Resubmitted Application | Risk: **5.0%**. Applicant uploaded Version 2 (Renewed Fire Safety NOC valid to 2027). Previous finding marked `RECTIFIED_BY_APPLICANT`. |

---

## 5. Pluggable External Authority Verification Framework

The platform includes modular adapter interfaces under `backend/app/services/adapters/`:

1. **DigiLocker / NAD Adapter** (`DigiLockerAdapter`): Pulls official educational records via simulated MeitY OAuth2 endpoints.
2. **University Affiliation Adapter** (`UniversityAffiliationAdapter`): Verifies state technical university provisional affiliation orders.
3. **Land Revenue Registry Adapter** (`LandRevenueAdapter`): Reconciles Sub-Registrar 7/12 land mutation records and non-encumbrance certificates.
4. **Bank TER Gateway Adapter** (`BankTERAdapter`): Reconciles non-tax Bharatkosh / SBI ePay processing fees.
5. **AICTE DSS QR & Digital Signature Verifier** (`QRSignatureAdapter`): Validates X.509 PKI signatures and implements strict hostname whitelisting to eliminate Server-Side Request Forgery (SSRF) from document QR codes.

*Statuses supported:* `VERIFIED`, `MISMATCH_DETECTED`, `EXPIRED`, `VERIFICATION_PENDING`, `SOURCE_UNAVAILABLE`, `MANUAL_REVIEW_REQUIRED`, `NOT_SUPPORTED`.

---

## 6. How to Run Locally

### Option A: Direct Local Run (Recommended for Windows)

1. **Start Backend (FastAPI)**:
   ```cmd
   run_backend.bat
   ```
   *Runs at `http://127.0.0.1:8000`. Automatic SQLite initialization and seeding of all 9 scenarios.*  
   *Interactive API Docs: `http://127.0.0.1:8000/docs`.*

2. **Start Frontend (Next.js)**:
   ```cmd
   run_frontend.bat
   ```
   *Runs at `http://localhost:3000`.*

3. **Or One-Click Launch Both**:
   ```cmd
   run_all.bat
   ```
   *(or `powershell -ExecutionPolicy Bypass -File run_all.ps1`).*

### Option B: Docker Compose (Containerized Production)

```bash
docker compose up --build
```
*Starts PostgreSQL, Redis, MinIO S3 Object Storage, FastAPI Backend, and Next.js Frontend.*

---

## 7. Automated Test Suite & Quality Verification

Run the comprehensive pytest suite verifying role isolation, deterministic compliance rules, duplicate detection, statutory determinations, tenant isolation, and tamper-evident audit chaining:

```cmd
python -m pytest backend/tests/test_compliance_and_isolation.py -v
```

**Results: 27/27 Tests Passed (100% Pass Rate)**
- `test_health`: System and DB connection operational
- `test_demo_accounts_removed`: Demo persona public route returns 404
- `test_applicant_institution_isolation`: Blocked from querying cross-institution records (403)
- `test_officer_cross_institution_scrutiny`: Authorized for review queue
- `test_officer_cannot_approve_reject`: 403 Forbidden on final statutory actions
- `test_authority_can_record_statutory_decision`: Authorized for statutory actions with justification
- `test_authority_decision_requires_justification`: Empty justification rejected with 422
- `test_admin_privilege_boundaries`: Blocked from confidential document payloads (403)
- `test_auditor_read_only`: Cannot mutate records or submit reviews (403)
- `test_tenant_isolation_documents`: Cross-tenant document retrieval returns 403/404
- `test_notes_redacted_for_applicant`: Scrutiny notes stripped from applicant response
- `test_missing_document_finding`: Deficiencies detected deterministically
- `test_expired_certificate_finding`: Expiry rule triggered
- `test_duplicate_document_hash_detection`: SHA-256 duplicate flag generated
- `test_low_confidence_ocr_flag`: Low OCR confidence marked for manual scrutiny
- `test_infrastructure_cv_mismatch`: Deficit in workstations triggers inspection flag
- `test_source_verification_adapter`: Pluggable adapters handle G2G responses
- `test_mfa_flow_totp`: RFC 6238 TOTP challenge-response verified
- `test_auth_me_endpoint`: JWT identity returns current user profile
- `test_auth_logout_audit`: Logout terminates session and registers audit record
- `test_audit_tamper_evident_chain`: Cryptographic SHA-256 block chain verified intact

### Automated Browser E2E QA Audit (Playwright)

Run the full end-to-end browser verification script:

```cmd
node frontend/scripts/browser_qa_audit.js
```

Generates structured evidence report in `frontend/qa_report.json` and visual artifacts in `frontend/qa_screenshots/`.

---

## 8. Remaining Production Integrations & Limitations

- **Production Government G2G Credentials**: External adapters operate with clearly labeled synthetic responses until official production OAuth2 credentials and Mutual TLS client certificates are provisioned by MeitY, Land Registries, and Bharatkosh.
- **Physical Tesseract / GPU OCR Deployment**: Current build utilizes `pypdf` extraction and advanced regex/layout heuristics. For production air-gapped server deployments, a GPU-accelerated OCR model (e.g. PaddleOCR or TrOCR) can be plugged directly into `OCRService`.
- **Physical Inspection Visits**: Physical inspection flags are advisory triggers for official AICTE Expert Visit Committees (EVC) and do not substitute for on-site physical scrutiny.
