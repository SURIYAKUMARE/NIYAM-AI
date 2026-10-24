-- =============================================================================
-- NIYAM — Supabase PostgreSQL Schema Migration 000003
-- AICTE Problem Statement ID: 26261
-- Description: Private Storage Buckets, Storage RLS, and MFA AAL2 Enforcement
-- =============================================================================

-- 1. Create Private Document Storage Bucket in Supabase Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'niyam-documents-private',
  'niyam-documents-private',
  FALSE,
  26214400, -- 25 MB max file size
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'application/octet-stream']
)
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = 26214400;

-- 2. Storage RLS Policies on storage.objects
-- Note: Objects are organized as: "institution_<id>/app_<id>/<doc_version_id>_<filename>"

CREATE POLICY "Storage: Applicants read own institution documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'niyam-documents-private'
    AND (
      public.is_official() = TRUE
      OR (storage.foldername(name))[1] = ('institution_' || public.current_institution_id()::text)
    )
  );

CREATE POLICY "Storage: Applicants upload to own institution prefix"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'niyam-documents-private'
    AND (
      public.is_official() = TRUE
      OR (storage.foldername(name))[1] = ('institution_' || public.current_institution_id()::text)
    )
  );

-- No public delete policy: document version files are immutable for regulatory auditability

-- 3. MFA Authentication Assurance Level (AAL2) Verification Function
CREATE OR REPLACE FUNCTION public.is_mfa_aal2()
RETURNS BOOLEAN AS $$
BEGIN
  -- Checks Supabase Auth JWT claims for authentic assurance level 'aal2' (TOTP confirmed)
  RETURN COALESCE(
    (auth.jwt() ->> 'aal') = 'aal2',
    FALSE
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. Server-Enforce MFA on Competent Authority Statutory Decisions
-- Function and trigger to block final decisions if official session is only AAL1
CREATE OR REPLACE FUNCTION public.enforce_mfa_on_statutory_decision()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
BEGIN
  v_role := public.current_user_role();
  
  -- If action is taken by regulatory official, require AAL2 MFA verification
  IF v_role IN ('supervising_authority', 'admin') THEN
    IF NOT public.is_mfa_aal2() AND current_setting('request.jwt.claim.mfa_completed', true) IS DISTINCT FROM 'true' THEN
      RAISE EXCEPTION 'Regulatory Security Violation: Statutory decisions require completed Multi-Factor Authentication (AAL2).';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_mfa_decision ON public.review_actions;
CREATE TRIGGER trg_enforce_mfa_decision
  BEFORE INSERT OR UPDATE ON public.review_actions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_mfa_on_statutory_decision();
