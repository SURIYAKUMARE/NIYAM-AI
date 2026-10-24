# NIYAM — Supabase Architecture & Migration Plan
**AICTE Problem Statement ID:** 26261  
**Target Platform:** Supabase Auth, PostgreSQL (pgcrypto / RLS), and Supabase Private Storage  
**Author:** Engineering Lead & Product Architect  
**Date:** October 24, 2026  

---

## 1. Executive Migration Strategy

The migration of NIYAM to Supabase preserves 100% of the working regulatory workflows, OCR extraction pipeline, heuristic malware quarantine, deterministic compliance engine, and tamper-evident audit history while elevating identity governance and data isolation to enterprise sovereign standards.

### Core Principles
1. **Zero Disruption to Existing Schema Relationships:**  
   The 18 operational tables retain their existing relational foreign key graph. `public.users` is connected to Supabase Auth via `auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE`.
2. **Strict Server-Side Authorization:**  
   Client-side claims or `getSession().user` alone are never trusted for authorization. All roles, institution memberships, and MFA assurance levels (`aal2`) are enforced via database Row Level Security (RLS) policies and FastAPI server-side JWT verification.
3. **Prevention of Privilege Escalation:**  
   The database trigger `public.handle_new_auth_user()` ensures that any public registration default role is strictly `applicant`. Privileged official roles (`scrutiny_officer`, `supervising_authority`, `admin`, `auditor`) can only be provisioned through secure database seeding or administrative invitation.
4. **Private Document Storage:**  
   All submitted regulatory documents (building plans, land deeds, fire safety certificates) are stored in the private Supabase Storage bucket `niyam-documents-private`. Access requires authenticated requests or short-lived signed URLs with 60-second TTLs.

---

## 2. Identity Mapping & Auth Architecture

```
+-------------------------------------------------------------+
|                      Supabase Auth                          |
|  auth.users (id: UUID, email, encrypted_password, factors)  |
+------------------------------+------------------------------+
                               |
                               | Trigger on INSERT
                               v
+-------------------------------------------------------------+
|                 Application Identity Link                   |
|  public.users (id: SERIAL, auth_user_id: UUID, role, inst)  |
+------------------------------+------------------------------+
                               |
                               | Foreign Key
                               v
+-------------------------------------------------------------+
|              Institutional Scrutiny Database                |
|  applications (institution_id, assigned_officer_id)        |
|  documents -> document_versions -> extracted_fields         |
|  findings, review_actions, audit_logs                       |
+-------------------------------------------------------------+
```

### Supported Personas & Destination Routing:
| Persona / Role | Supabase Role Claim | Landing Destination | Primary Authorization Scope |
| :--- | :--- | :--- | :--- |
| **Institutional Applicant** | `applicant` | `/institution/dashboard` | Manage own institution's drafts, upload checklist documents, respond to clarification queries |
| **Regulatory Scrutiny Officer** | `scrutiny_officer` | `/officer/queue` | Review assigned dossiers, verify external sources, confirm/dismiss findings, issue queries |
| **Competent Authority** | `supervising_authority` | `/authority/dashboard` | Scrutinize high-risk dossiers, record statutory regulatory decisions (AAL2 MFA required) |
| **System Administrator** | `admin` | `/admin/rules` | Manage rule sets, checklist items, and institutional profiles (AAL2 MFA required) |
| **Read-Only Auditor** | `auditor` | `/auditor/logs` | Inspect cryptographically chained tamper-evident audit logs |

---

## 3. Database Migration Sequence

All database migrations are maintained in an authoritative, versioned sequence in `supabase/migrations/`:

1. **`20261024000001_initial_niyam_schema.sql`:**  
   Establishes PostgreSQL custom enum types, the 18 core application tables, indexes, and the automated `auth.users` $\to$ `public.users` trigger.
2. **`20261024000002_row_level_security.sql`:**  
   Enables Row Level Security across all tables and establishes institutional isolation policies (`current_institution_id()`), official role exemptions, and immutable append-only constraints on `audit_logs`.
3. **`20261024000003_storage_and_mfa.sql`:**  
   Provisions private bucket `niyam-documents-private`, establishes storage folder RLS policies, and creates the AAL2 MFA enforcement trigger on statutory decisions.

---

## 4. Supabase Storage Migration Strategy

### Storage Bucket Configuration:
* **Bucket ID:** `niyam-documents-private`
* **Public Visibility:** `FALSE` (Private)
* **Max Payload Size:** `26214400` bytes (25 MB)
* **Allowed MIME Types:** `application/pdf`, `image/png`, `image/jpeg`

### Hierarchy & Folder Convention:
Files are addressed hierarchically by institution and application:
$$\text{Path: } \texttt{institution\_<institution\_id>/app\_<application\_id>/<version\_id>\_<filename>}$$

### Download & Streaming Security:
1. Public direct URLs are disabled.
2. When an applicant or officer requests document viewing, the server/client generates a signed URL with a maximum expiry of 900 seconds (15 minutes).
3. The malware scanner intercepts all uploads prior to permanent storage commitment. Quarantined files are redirected to an isolated quarantine repository (`uploads/quarantine/`).

---

## 5. Next.js 14 `@supabase/ssr` Client Topology

The application uses the official `@supabase/ssr` architecture:
* **Browser Client:** `createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)` with cookie storage in `frontend/src/lib/supabase/client.ts`.
* **Server Client:** `createServerClient(..., { cookies: { getAll, setAll } })` in `frontend/src/lib/supabase/server.ts` for server components and route handlers.
* **Middleware:** `frontend/src/middleware.ts` refreshes expired tokens and enforces route gating.
* **Service Role Client:** `frontend/src/lib/supabase/admin.ts` initialized strictly server-side using `SUPABASE_SERVICE_ROLE_KEY` for background workers and administrative operations.

---

## 6. Staging Verification, Rollback, and Recovery

1. **Backup Pre-Migration Snapshot:**  
   Execute `create_system_backup()` to generate a baseline `.tar.gz` archive with SHA-256 manifest.
2. **Staging Schema Execution:**  
   Execute `supabase db push` or run migrations against target Supabase PostgreSQL instance.
3. **Identity Verification Check:**  
   Sign in with applicant account; verify that RLS blocks `SELECT * FROM applications WHERE institution_id != my_inst`.
4. **Rollback Plan:**  
   In the event of an external provider disruption, the application's hybrid architecture seamlessly fails over to the local SQLite database via `DATABASE_URL="sqlite:///./aicte_verify.db"`.
