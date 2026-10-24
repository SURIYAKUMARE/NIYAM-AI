-- =============================================================================
-- NIYAM — Supabase PostgreSQL Schema Migration 000001
-- AICTE Problem Statement ID: 26261
-- Description: Core 18 Relational Tables, Data Types, and Auth User Identity Link
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Custom Enum Types
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM (
    'applicant',
    'scrutiny_officer',
    'supervising_authority',
    'admin',
    'auditor'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM (
    'DRAFT',
    'PRELIMINARY_CHECK_PASSED',
    'DEFICIENCIES_DETECTED',
    'SUBMITTED_FOR_SCRUTINY',
    'UNDER_SCRUTINY',
    'CLARIFICATION_REQUESTED',
    'RESUBMITTED',
    'RECOMMENDED_FOR_APPROVAL',
    'RECOMMENDED_FOR_INSPECTION',
    'REJECTED_BY_AUTHORITY',
    'APPROVED_BY_AUTHORITY'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.document_status AS ENUM (
    'PENDING_UPLOAD',
    'UPLOADED',
    'PROCESSING',
    'VALIDATED',
    'DEFICIENT',
    'VERIFIED',
    'RECTIFIED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.finding_severity AS ENUM (
    'CRITICAL',
    'MAJOR',
    'MINOR',
    'ADVISORY'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.finding_status AS ENUM (
    'OPEN',
    'RECTIFIED_BY_APPLICANT',
    'DISMISSED_BY_OFFICER',
    'CONFIRMED_BY_OFFICER',
    'WAIVED_BY_AUTHORITY'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM (
    'VERIFIED',
    'MISMATCH_DETECTED',
    'EXPIRED',
    'VERIFICATION_PENDING',
    'SOURCE_UNAVAILABLE',
    'MANUAL_REVIEW_REQUIRED',
    'NOT_SUPPORTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.authority_source_type AS ENUM (
    'DIGILOCKER',
    'UNIVERSITY_AFFILIATION',
    'LAND_REVENUE_PORTAL',
    'BANK_TER_GATEWAY',
    'QR_SIGNATURE_SERVICE',
    'MANUAL_CONFIRMATION'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.ruleset_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'RETIRED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Institutions Table
CREATE TABLE IF NOT EXISTS public.institutions (
  id SERIAL PRIMARY KEY,
  aicte_permanent_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  legal_entity_type VARCHAR(100) DEFAULT 'Registered Trust / Society',
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  pin_code VARCHAR(20) NOT NULL,
  contact_email VARCHAR(150) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  established_year INTEGER DEFAULT 2010,
  accreditation_grade VARCHAR(20) DEFAULT 'NAAC A+',
  has_prior_deficiencies BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_institutions_aicte_id ON public.institutions(aicte_permanent_id);
CREATE INDEX IF NOT EXISTS idx_institutions_name ON public.institutions(name);

-- 3. Users / Profiles Table (Mapped to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  hashed_password VARCHAR(255) DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'applicant',
  institution_id INTEGER REFERENCES public.institutions(id) ON DELETE SET NULL,
  designation VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  
  -- MFA metadata
  mfa_secret VARCHAR(64),
  mfa_enrolled BOOLEAN DEFAULT FALSE,
  mfa_last_verified_counter INTEGER,
  mfa_failed_attempts INTEGER DEFAULT 0,
  mfa_locked_until TIMESTAMPTZ,
  recovery_codes_hash VARCHAR(512)
);

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_institution_id ON public.users(institution_id);

-- 4. Application Categories Table
CREATE TABLE IF NOT EXISTS public.application_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  academic_year VARCHAR(20) DEFAULT '2025-26',
  is_active BOOLEAN DEFAULT TRUE
);

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id SERIAL PRIMARY KEY,
  application_number VARCHAR(50) UNIQUE NOT NULL,
  institution_id INTEGER NOT NULL REFERENCES public.institutions(id) ON DELETE RESTRICT,
  category_code VARCHAR(50) NOT NULL,
  academic_year VARCHAR(20) DEFAULT '2025-26',
  status public.application_status NOT NULL DEFAULT 'DRAFT',
  submission_date TIMESTAMPTZ,
  rule_set_version VARCHAR(50) NOT NULL DEFAULT 'v2025.1',
  approved_programmes JSONB DEFAULT '[]'::jsonb,
  ter_payment_status VARCHAR(50) DEFAULT 'PAID',
  ter_transaction_ref VARCHAR(100),
  overall_risk_score FLOAT DEFAULT 0.0,
  assigned_officer_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_applications_app_number ON public.applications(application_number);
CREATE INDEX IF NOT EXISTS idx_applications_institution_id ON public.applications(institution_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- 6. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  checklist_item_code VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  is_mandatory BOOLEAN DEFAULT TRUE,
  status public.document_status DEFAULT 'PENDING_UPLOAD',
  current_version_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_documents_app_id ON public.documents(application_id);

-- 7. Document Versions Table
CREATE TABLE IF NOT EXISTS public.document_versions (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  sha256_hash VARCHAR(64) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  uploaded_by_user_id INTEGER NOT NULL REFERENCES public.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  is_duplicate_detected BOOLEAN DEFAULT FALSE,
  malware_scan_status VARCHAR(50) DEFAULT 'CLEAN',
  scan_engine VARCHAR(100) DEFAULT 'Heuristic Signature Engine v2.4',
  metadata_json JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_doc_versions_doc_id ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_versions_sha256 ON public.document_versions(sha256_hash);

-- Link document current version
ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS fk_documents_current_version;
ALTER TABLE public.documents
  ADD CONSTRAINT fk_documents_current_version
  FOREIGN KEY (current_version_id) REFERENCES public.document_versions(id) ON DELETE SET NULL;

-- 8. Extracted Fields Table
CREATE TABLE IF NOT EXISTS public.extracted_fields (
  id SERIAL PRIMARY KEY,
  document_version_id INTEGER NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  original_value TEXT,
  corrected_value TEXT,
  confidence_score FLOAT DEFAULT 1.0,
  is_low_confidence BOOLEAN DEFAULT FALSE,
  page_number INTEGER DEFAULT 1,
  bounding_box JSONB,
  raw_text_excerpt TEXT,
  extraction_method VARCHAR(100) DEFAULT 'ocr-heuristic-v1',
  is_corrected BOOLEAN DEFAULT FALSE,
  corrected_by_user_id INTEGER REFERENCES public.users(id),
  corrected_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_extracted_fields_version_id ON public.extracted_fields(document_version_id);

-- 9. Field Corrections Table
CREATE TABLE IF NOT EXISTS public.field_corrections (
  id SERIAL PRIMARY KEY,
  extracted_field_id INTEGER NOT NULL REFERENCES public.extracted_fields(id) ON DELETE CASCADE,
  old_value TEXT,
  new_value TEXT,
  reason TEXT NOT NULL,
  corrected_by_user_id INTEGER NOT NULL REFERENCES public.users(id),
  timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 10. Rule Sets Table
CREATE TABLE IF NOT EXISTS public.rule_sets (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  status public.ruleset_status DEFAULT 'DRAFT',
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to TIMESTAMPTZ,
  handbook_edition VARCHAR(150) DEFAULT 'AICTE Approval Process Handbook',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 11. Checklist Items Table
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id SERIAL PRIMARY KEY,
  rule_set_version VARCHAR(50) NOT NULL REFERENCES public.rule_sets(version) ON DELETE CASCADE,
  category_code VARCHAR(50) NOT NULL,
  item_code VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT TRUE,
  required_fields JSONB DEFAULT '[]'::jsonb,
  accepted_mime_types JSONB DEFAULT '["application/pdf", "image/png", "image/jpeg"]'::jsonb
);

-- 12. Rules Table
CREATE TABLE IF NOT EXISTS public.rules (
  id SERIAL PRIMARY KEY,
  rule_set_version VARCHAR(50) NOT NULL REFERENCES public.rule_sets(version) ON DELETE CASCADE,
  rule_code VARCHAR(50) NOT NULL,
  category_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  condition_type VARCHAR(100) NOT NULL,
  condition_config JSONB DEFAULT '{}'::jsonb,
  severity public.finding_severity DEFAULT 'MAJOR',
  source_handbook_ref VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_rules_code ON public.rules(rule_code);

-- 13. Validation Runs Table
CREATE TABLE IF NOT EXISTS public.validation_runs (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  rule_set_version VARCHAR(50) NOT NULL,
  triggered_by_user_id INTEGER NOT NULL REFERENCES public.users(id),
  total_rules_evaluated INTEGER DEFAULT 0,
  findings_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'SUCCESS',
  summary TEXT,
  run_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 14. Findings Table
CREATE TABLE IF NOT EXISTS public.findings (
  id SERIAL PRIMARY KEY,
  validation_run_id INTEGER NOT NULL REFERENCES public.validation_runs(id) ON DELETE CASCADE,
  application_id INTEGER NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_version_id INTEGER REFERENCES public.document_versions(id) ON DELETE SET NULL,
  rule_code VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  severity public.finding_severity NOT NULL,
  explanation TEXT NOT NULL,
  expected_value TEXT,
  observed_value TEXT,
  rule_citation VARCHAR(255),
  page_number INTEGER,
  bounding_box JSONB,
  excerpt TEXT,
  detection_method VARCHAR(100) DEFAULT 'deterministic-rule-engine',
  confidence_score FLOAT,
  status public.finding_status DEFAULT 'OPEN',
  officer_notes TEXT,
  reviewed_by_user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_findings_app_id ON public.findings(application_id);
CREATE INDEX IF NOT EXISTS idx_findings_status ON public.findings(status);

-- 15. Verification Requests Table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_version_id INTEGER NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
  authority_type public.authority_source_type NOT NULL,
  request_reference VARCHAR(100) UNIQUE NOT NULL,
  status public.verification_status DEFAULT 'VERIFICATION_PENDING',
  source_endpoint VARCHAR(255) NOT NULL,
  matched_fields JSONB DEFAULT '{}'::jsonb,
  mismatched_fields JSONB DEFAULT '{}'::jsonb,
  response_summary TEXT,
  latency_ms INTEGER DEFAULT 150,
  simulated_demo BOOLEAN DEFAULT TRUE,
  confirmed_by_user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  supporting_evidence_ref VARCHAR(255),
  timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_verif_requests_app_id ON public.verification_requests(application_id);

-- 16. Infrastructure Evidence Table
CREATE TABLE IF NOT EXISTS public.infrastructure_evidence (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  facility_type VARCHAR(100) NOT NULL,
  caption VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  reported_area_sqm FLOAT NOT NULL,
  required_area_sqm FLOAT NOT NULL,
  reported_equipment_count INTEGER DEFAULT 0,
  cv_detected_count INTEGER DEFAULT 0,
  cv_tags JSONB DEFAULT '[]'::jsonb,
  geo_lat FLOAT,
  geo_long FLOAT,
  inspection_recommended BOOLEAN DEFAULT FALSE,
  officer_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 17. Clarification Requests Table
CREATE TABLE IF NOT EXISTS public.clarification_requests (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  finding_id INTEGER REFERENCES public.findings(id) ON DELETE SET NULL,
  officer_user_id INTEGER NOT NULL REFERENCES public.users(id),
  question TEXT NOT NULL,
  applicant_response TEXT,
  response_document_version_id INTEGER REFERENCES public.document_versions(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_clarifications_app_id ON public.clarification_requests(application_id);

-- 18. Review Actions Table
CREATE TABLE IF NOT EXISTS public.review_actions (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  officer_user_id INTEGER NOT NULL REFERENCES public.users(id),
  action_type VARCHAR(100) NOT NULL,
  comments TEXT NOT NULL,
  statutory_decision VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 19. Audit Logs Table (Tamper-Evident SHA-256 Chained)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  actor_user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  actor_username VARCHAR(100) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  action VARCHAR(150) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(50) DEFAULT '127.0.0.1',
  timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  previous_record_hash VARCHAR(64),
  record_hash VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);

-- 20. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
  target_role VARCHAR(50),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'INFO',
  link_url VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 21. Automatic Auth Sync Trigger: New Supabase Auth User -> public.users
-- Security Rule: Public registration default role is ALWAYS 'applicant'.
-- Officer, Authority, Admin, and Auditor roles CANNOT be self-assigned.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_institution_id INTEGER;
BEGIN
  -- If institution permanent ID provided in metadata, associate with institution
  IF NEW.raw_user_meta_data->>'aicte_permanent_id' IS NOT NULL THEN
    SELECT id INTO v_institution_id 
    FROM public.institutions 
    WHERE aicte_permanent_id = NEW.raw_user_meta_data->>'aicte_permanent_id'
    LIMIT 1;
  END IF;

  INSERT INTO public.users (
    auth_user_id,
    username,
    email,
    full_name,
    role,
    institution_id,
    designation,
    is_active
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Institutional Applicant'),
    'applicant'::public.user_role, -- Strict unprivileged default
    v_institution_id,
    COALESCE(NEW.raw_user_meta_data->>'designation', 'Authorized Institutional Representative'),
    TRUE
  ) ON CONFLICT (email) DO UPDATE SET
    auth_user_id = EXCLUDED.auth_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
