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

The platform enforces zero-trust server-side data isolation and role boundaries:

| Role | Username | Password | Permitted Access & Scope |
| :--- | :--- | :--- | :--- |
| **Institution Applicant** | `applicant` | `password123` | **Strict Isolation**: Can only access their own institution (`1-492048123`). Upload evidence, rectify deficiencies, track verification progress. Cross-institution access blocked with HTTP 403. |
| **Scrutiny Officer** | `officer` | `password123` | Review assigned applications across institutions, inspect extracted OCR fields against visual bounding boxes, confirm/dismiss findings, issue clarifications. |
| **Supervising Authority** | `authority` | `password123` | Review escalations and officer recommendations, record statutory determinations (`APPROVE`, `REJECT`, `INSPECT`) with mandatory written justifications, view executive analytics. |
| **System Administrator** | `admin` | `password123` | Manage versioned rule sets, checklist mappings, source adapter timeouts. **Privilege Boundary**: Does not automatically receive unrestricted viewing access to private confidential documents. |
| **Statutory Auditor** | `auditor` | `password123` | Read-only inspection of append-only audit trail and cryptographic SHA-256 block chain verification. |

*(Quick 1-click persona switching is available in the top navigation bar or `/login`).*

---

## 3. The 14 Connected Functional Screens

1. **Login & Role-Aware Navigation** (`/login`): Secure sign-in with instant 1-click demo persona switcher.
2. **Institution Dashboard** (`/institution/dashboard`): Institutional identity, approval year, active deficiency alert banner, and checklist completion metrics.
3. **New Application Wizard** (`/institution/applications/new`): 3-step wizard selecting category (EoA, Increase in Intake, New Institution, Change of Site), course intake matrix, and checklist preview.
4. **Application Catalog** (`/applications`): Filterable, searchable workspace with risk scores and status pills.
5. **Application Detail Workspace** (`/applications/[id]`): Multi-tab flagship view covering document checklist, evidence-linked findings, source verifications, clarifications, and timeline.
6. **Document Upload & Checklist Page** (`/applications/[id]` tab 1): Immutable document versioning, upload/rectify controls, SHA-256 hash tracking.
7. **Document Review Workspace** (`/review`): Split-view layout previewing simulated document pages, visual bounding boxes, OCR confidence scores, and human-in-the-loop field correction with audit logging.
8. **Verification Queue & Source Status** (`/verification`): Live operational status of external issuing authority adapters, latency metrics, and verification request ledger.
9. **Compliance Findings & Rectification Tracker** (`/findings`): Actionable regulatory discrepancies linked to handbook clauses and observed values.
10. **Officer Review Queue** (`/officer/queue`): Assigned applications sorted by risk priority, deficiency count, and scrutiny status.
11. **Infrastructure Evidence Review** (`/infrastructure`): Campus photos, floor plans, geotag markers, computer vision terminal counts, and physical inspection triggers.
12. **Rule & Checklist Administration** (`/admin/rules`): Draft rule set creation, deterministic rule authoring, dry-run testing against sample applications, and version activation.
13. **Audit History** (`/audit`): Append-only audit trail with live SHA-256 block chain integrity verification.
14. **User & Integration Settings** (`/admin/settings`): Storage retention policies, adapter timeouts, rate limits, and security toggles.

---

## 4. The 9 Synthetic Scenarios Walkthrough

The application comes pre-seeded with 9 distinct synthetic test scenarios accessible directly from the **Scenario Walkthrough Bar**:

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

Run the comprehensive pytest suite verifying role isolation, deterministic compliance rules, duplicate detection, and tamper-evident audit chaining:

```cmd
python -m pytest backend/tests/test_compliance_and_isolation.py -v
```

**Results:**
- `test_health`: PASSED
- `test_demo_accounts_list`: PASSED
- `test_applicant_institution_isolation`: PASSED
- `test_officer_cross_institution_scrutiny`: PASSED
- `test_missing_document_finding`: PASSED
- `test_expired_certificate_finding`: PASSED
- `test_source_verification_adapter`: PASSED
- `test_audit_tamper_evident_chain`: PASSED
*(8 passed in 8.63s)*

---

## 8. Remaining Production Integrations & Limitations

- **Production Government G2G Credentials**: External adapters operate with clearly labeled synthetic responses until official production OAuth2 credentials and Mutual TLS client certificates are provisioned by MeitY, Land Registries, and Bharatkosh.
- **Physical Tesseract / GPU OCR Deployment**: Current build utilizes `pypdf` extraction and advanced regex/layout heuristics. For production air-gapped server deployments, a GPU-accelerated OCR model (e.g. PaddleOCR or TrOCR) can be plugged directly into `OCRService`.
- **Physical Inspection Visits**: Physical inspection flags are advisory triggers for official AICTE Expert Visit Committees (EVC) and do not substitute for on-site physical scrutiny.
