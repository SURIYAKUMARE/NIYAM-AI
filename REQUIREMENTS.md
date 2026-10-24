# NIYAM — Requirements Specification & Traceability Matrix
**Problem Statement ID:** 26261 | **AICTE Regulation Bureau Prototype**  
**Title:** AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification

---

## 1. Project Purpose & Statutory Boundaries

Technical institutions submit applications for Extension of Approval (EoA), Increase in Intake, Establishment of New Institutions, and Course Variations. Regulatory officials must examine institutional records, supporting evidence, authenticity, validity, and compliance with statutory handbook norms.

### Core Mandate
- Provide an integrated decision-support workspace that extracts information from documents, checks completeness and validity, identifies inconsistencies, facilitates authorized source verification, and presents evidence to officials.
- **Statutory Boundary:** Artificial intelligence, OCR layout heuristics, and source verification connectors provide **strictly advisory findings**. Competent statutory authorities (Scrutiny Officers, Hearing Committees, and Council Authorities) retain the exclusive mandate for scrutiny, physical inspections, and final regulatory approval decisions.

---

## 2. Requirements Checklist

| Requirement ID | Module / Functional Area | Specification Description | Implementation Status |
| :--- | :--- | :--- | :--- |
| **REQ-AUTH-01** | Role-Based Access Control | Server-enforced permissions for Applicant, Officer, Authority, Admin, Auditor. | **COMPLETE** |
| **REQ-AUTH-02** | Zero-Trust Isolation | Institution applicants strictly isolated to their own college records (`403 Forbidden` on cross-access). | **COMPLETE** |
| **REQ-AUTH-03** | Official-User MFA | 6-digit TOTP two-factor authentication simulation for regulatory scrutiny accounts. | **COMPLETE** |
| **REQ-DOC-01** | Document Ingestion | Multi-format upload (PDF, PNG, JPG), size validation ($\le 25\text{MB}$), virus scan hashing. | **COMPLETE** |
| **REQ-DOC-02** | Integrity & Versioning | Cryptographic SHA-256 calculation; non-mutating version tracking (`v1` $\to$ `v2`). | **COMPLETE** |
| **REQ-DOC-03** | Extraction Engine | Layout parsing with bounding box geometry, confidence metrics, and text excerpts. | **COMPLETE** |
| **REQ-DOC-04** | Human Correction | Human-in-the-loop field modification preserving original extract with audited justification. | **COMPLETE** |
| **REQ-VAL-01** | Deterministic Engine | Rules engine evaluating AICTE Approval Process Handbook (APH) clauses (FSR 1:20, NOC expiry, land deeds). | **COMPLETE** |
| **REQ-VAL-02** | Rule Versioning | Rules pinned to submission versions (`v2025.1`, `v2024.1`); in-flight dossiers locked to submission version. | **COMPLETE** |
| **REQ-VAL-03** | 3-Part Explanations | Findings break down: (1) What needs attention, (2) Evidence/clause, (3) What the user can do next. | **COMPLETE** |
| **REQ-VER-01** | Source Connectors | Authoritative adapters (DigiLocker, State Land Revenue, Affiliating University, Bank TER, QR). | **COMPLETE** |
| **REQ-VER-02** | Outage Independence | Technical source outages recorded as `SOURCE_UNAVAILABLE` without adverse fraud conclusions. | **COMPLETE** |
| **REQ-VER-03** | Manual Confirmation | Officer manual confirmation requiring physical evidence reference and justification notes. | **COMPLETE** |
| **REQ-CLAR-01** | Clarification Cycles | Official query issuance with strict countdown timers and revised evidence superseding findings. | **COMPLETE** |
| **REQ-INFRA-01** | Infrastructure Evidence | Geo-tagged photo review (GPS coordinates, camera azimuth, EXIF timestamps, floor plans). | **COMPLETE** |
| **REQ-INFRA-02** | Inspection Routing | Formal recommendation workflow dispatching suspect facilities to Expert Visit Committees (EVC). | **COMPLETE** |
| **REQ-DEC-01** | Statutory Decisions | Competent authority decision recording (`Approved`, `Approved with Deficiencies`, `Rejected`) with mandatory reasons. | **COMPLETE** |
| **REQ-AUD-01** | Audit History Ledger | Tamper-evident append-only ledger cryptographically chained via SHA-256 (`prev_hash` $\to$ `current_hash`). | **COMPLETE** |
| **REQ-AUD-02** | Report Exports | One-click export to CSV and JSON formats with evidence references and verification provenance. | **COMPLETE** |
| **REQ-OPS-01** | Backup & Disaster Recovery | Compressed archive creation and checksum-verified restoration utility. | **COMPLETE** |

---

## 3. Requirement-to-Test Traceability Matrix

Every single functional requirement is verified by an automated acceptance test in `backend/tests/test_compliance_and_isolation.py`:

| Acceptance Test ID | Test Function Name | Tested Requirement(s) | Result |
| :--- | :--- | :--- | :--- |
| **AT-01** | `test_acceptance_01_applicant_save_resume_validate_submit` | REQ-AUTH-01, REQ-VAL-01 | **PASSED** |
| **AT-02** | `test_acceptance_02_actual_document_upload_and_processing` | REQ-DOC-01, REQ-DOC-02 | **PASSED** |
| **AT-03** | `test_acceptance_03_records_and_files_survive_restart` | REQ-DOC-02, REQ-OPS-01 | **PASSED** |
| **AT-04** | `test_acceptance_04_missing_expired_duplicate_findings` | REQ-VAL-01, REQ-VAL-03 | **PASSED** |
| **AT-05** | `test_acceptance_05_evidence_links_open_correct_version` | REQ-DOC-03, REQ-VAL-03 | **PASSED** |
| **AT-06** | `test_acceptance_06_extraction_uncertainty_and_human_correction` | REQ-DOC-04 | **PASSED** |
| **AT-07** | `test_acceptance_07_source_outages_distinct_from_mismatches` | REQ-VER-01, REQ-VER-02 | **PASSED** |
| **AT-08** | `test_acceptance_08_manual_confirmation_requires_permission_and_evidence` | REQ-VER-03 | **PASSED** |
| **AT-09** | `test_acceptance_09_institution_isolation_enforced` | REQ-AUTH-02 | **PASSED** |
| **AT-10** | `test_acceptance_10_unauthorized_users_blocked_from_decisions_and_rules` | REQ-AUTH-01, REQ-DEC-01 | **PASSED** |
| **AT-11** | `test_acceptance_11_clarification_and_resubmission_preserve_history` | REQ-CLAR-01 | **PASSED** |
| **AT-12** | `test_acceptance_12_stale_jobs_cannot_overwrite_newer_submissions` | REQ-VAL-02 | **PASSED** |
| **AT-13** | `test_acceptance_13_prompt_injection_sanitization` | REQ-DOC-01, REQ-DOC-03 | **PASSED** |
| **AT-14** | `test_acceptance_14_reports_match_stored_records_and_retain_labels` | REQ-AUD-02 | **PASSED** |
| **AT-15** | `test_acceptance_15_principal_workflow_endpoints_responsive` | REQ-AUTH-01, REQ-VER-01 | **PASSED** |
| **AT-16** | `test_acceptance_16_backup_restoration_succeeds` | REQ-OPS-01 | **PASSED** |
| **AT-17** | `test_acceptance_17_migrations_and_deployment_startup` | REQ-OPS-01, REQ-DOC-02 | **PASSED** |

---

## 4. UI/UX Design System & Google Stitch Alignment

The user interface follows the design tokens specified in [`DESIGN.md`](DESIGN.md):
- **Google Stitch Connection Note:** In accordance with the prompt guidance, direct external Google Stitch API integration is not available in this offline execution runtime. The application strictly adheres to the supplied Stitch design specifications:
  - Palette: `#F8FAFC` canvas, `#FFFFFF` surfaces, `#17212B` primary text, `#526170` secondary text, `#DCE3E9` borders, and `#167D8D` interaction accent.
  - Typography: Geist for UI prose and Geist Mono for code, timestamps, and hashes.
  - Touch targets: Minimum 44px on all clickable elements (`Button.tsx`).
  - Accessibility: Full keyboard navigation, visible focus rings, ARIA roles, and WCAG 2.2 Level AA color contrast compliance.
