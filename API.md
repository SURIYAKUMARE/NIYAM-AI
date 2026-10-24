# NIYAM — Complete API Reference & Permission Matrix
**Base URL:** `/api/v1`  
**Authentication Scheme:** Bearer JWT Token (`Authorization: Bearer <token>`)

---

## 1. Role-Based Access Control (RBAC) Permission Matrix

| Endpoint Route | Method | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | Public | Authenticate user and receive JWT access token |
| `/auth/me` | `GET` | Authenticated | Retrieve current user profile and institutional affiliation |
| `/applications` | `GET` | All Roles | List applications (Applicants filtered strictly to own institution) |
| `/applications` | `POST` | `applicant` | Create a new draft application |
| `/applications/{id}` | `GET` | Assigned / Isolated | Fetch detailed application workspace dossier |
| `/applications/{id}/submit` | `POST` | `applicant` | Formally submit application for regulatory scrutiny |
| `/documents/upload/{doc_id}` | `POST` | `applicant` | Upload document version to checklist slot |
| `/documents/{id}/versions` | `GET` | Assigned / Isolated | List historical versions for a document |
| `/extraction/field/{id}/correct`| `POST` | `applicant`, `officer`, `authority` | Human-in-the-loop field correction with audit justification |
| `/extraction/doc-version/{id}` | `GET` | Assigned / Isolated | Retrieve extracted fields with bounding box coordinates |
| `/validation/run/{app_id}` | `POST` | `applicant`, `officer`, `authority` | Trigger deterministic compliance evaluation |
| `/validation/findings` | `GET` | All Roles | Query evidence-linked regulatory compliance findings |
| `/validation/findings/{id}/disposition` | `PATCH` | `officer`, `authority`, `admin` | Update finding status (Confirm / Dismiss / Waive) |
| `/verification/queue` | `GET` | All Roles | List external issuing authority verification jobs |
| `/verification/manual-confirm`| `POST` | `officer`, `authority` | Record manual verification with physical evidence reference |
| `/infrastructure/{app_id}` | `GET` | All Roles | Retrieve geo-tagged laboratory & classroom evidence |
| `/infrastructure/{id}/inspection-request` | `POST` | `officer`, `authority` | Route facility for physical inspection by Expert Visit Committee |
| `/clarifications/{app_id}` | `POST` | `officer`, `authority` | Issue formal clarification query with deadline |
| `/clarifications/{id}/respond`| `POST` | `applicant` | Submit institutional rectification narrative |
| `/review-actions/{app_id}` | `POST` | `authority` | Record final statutory decision (`Approved` / `Rejected`) |
| `/rules` | `GET` | All Roles | List versioned regulatory rule sets |
| `/rules` | `POST` | `admin` | Create new draft rule set version |
| `/rules/{version}/activate` | `POST` | `admin` | Promote rule set version to active status |
| `/audit` | `GET` | `auditor`, `admin`, `authority`, `officer` | Inspect tamper-evident append-only audit ledger |
| `/audit/verify-chain` | `GET` | All Roles | Verify cryptographic SHA-256 block hash integrity |
| `/reports/application/{id}/summary` | `GET` | Assigned / Isolated | Export comprehensive validation summary report (JSON/CSV) |
| `/reports/application/{id}/receipt` | `GET` | Assigned / Isolated | Generate cryptographic submission receipt |
| `/users` | `GET` | `admin`, `authority` | List system users and role profiles |
| `/users/assign-officer` | `POST` | `admin`, `authority` | Assign scrutiny officer to application |

---

## 2. Key Endpoint Schemas & Payloads

### 2.1 Authentication: `POST /api/v1/auth/login`
**Request Payload:**
```json
{
  "username": "officer",
  "password": "password123"
}
```
**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 2,
    "username": "officer",
    "full_name": "Er. Anand Mohan Verma",
    "role": "scrutiny_officer",
    "institution_id": null,
    "institution_name": null,
    "designation": "Scrutiny Officer"
  }
}
```

### 2.2 Document Version Upload: `POST /api/v1/documents/upload/{doc_id}`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Data:**
  - `file`: Binary file upload (`.pdf`, `.png`, `.jpg`)
  - `notes`: Optional string description
- **Response (200 OK):**
```json
{
  "id": 1,
  "checklist_item_code": "DOC-FIRE-NOC",
  "document_name": "Fire Safety Certificate",
  "current_version_id": 12,
  "versions": [
    {
      "id": 12,
      "version_number": 2,
      "file_name": "Fire_NOC_Renewed_2026.pdf",
      "file_size": 249120,
      "mime_type": "application/pdf",
      "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "uploaded_at": "2026-10-24T07:20:00Z"
    }
  ]
}
```

### 2.3 Manual Verification Confirmation: `POST /api/v1/verification/manual-confirm`
- **Query / Body Parameters:**
  - `doc_version_id`: `int` (Required)
  - `supporting_evidence_ref`: `str` (Required, non-empty physical document reference)
  - `observations`: `str` (Officer scrutiny observations)
- **Response (200 OK):**
```json
{
  "id": 48,
  "authority_type": "MANUAL_CONFIRMATION",
  "status": "MANUAL_CONFIRMED",
  "request_reference": "MAN-CONF-2026-DOC-12",
  "supporting_evidence_ref": "DOTE-CONFIRM-2025-998",
  "response_summary": "Manual confirmation recorded by officer",
  "timestamp": "2026-10-24T07:22:00Z"
}
```

### 2.4 Cryptographic Audit Ledger: `GET /api/v1/audit/verify-chain`
- **Response (200 OK):**
```json
{
  "status": "VERIFIED_TAMPER_EVIDENT",
  "verified_records": 104,
  "latest_block_hash": "a1f9e2b49c7d812300bce427a1b92019...",
  "genesis_block": "GENESIS_BLOCK_2025"
}
```
