-- =============================================================================
-- NIYAM — Supabase PostgreSQL Schema Migration 000002
-- AICTE Problem Statement ID: 26261
-- Description: Complete Row Level Security (RLS) Policies and Helper Functions
-- =============================================================================

-- Helper Functions to extract current authenticated user identity & claims
CREATE OR REPLACE FUNCTION public.current_user_profile()
RETURNS public.users AS $$
  SELECT * FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_institution_id()
RETURNS INTEGER AS $$
  SELECT institution_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_official()
RETURNS BOOLEAN AS $$
  SELECT role IN ('scrutiny_officer', 'supervising_authority', 'admin', 'auditor') 
  FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clarification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 1. INSTITUTIONS RLS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Institutions: applicants read own, officials read all"
  ON public.institutions FOR SELECT
  USING (
    public.is_official() = TRUE 
    OR id = public.current_institution_id()
  );

CREATE POLICY "Institutions: admin can update"
  ON public.institutions FOR UPDATE
  USING (public.current_user_role() = 'admin');

-- -----------------------------------------------------------------------------
-- 2. USERS / PROFILES RLS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Users: read own profile or officials read all"
  ON public.users FOR SELECT
  USING (
    auth_user_id = auth.uid() 
    OR public.is_official() = TRUE
  );

CREATE POLICY "Users: update own basic profile (no role changes)"
  ON public.users FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (
    auth_user_id = auth.uid() 
    AND role = (SELECT role FROM public.users WHERE auth_user_id = auth.uid()) -- Prevents self-escalation
  );

-- -----------------------------------------------------------------------------
-- 3. APPLICATIONS RLS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Applications: applicants read own, officials read all"
  ON public.applications FOR SELECT
  USING (
    public.is_official() = TRUE 
    OR institution_id = public.current_institution_id()
  );

CREATE POLICY "Applications: applicants create for own institution"
  ON public.applications FOR INSERT
  WITH CHECK (
    institution_id = public.current_institution_id()
  );

CREATE POLICY "Applications: applicants update own drafts, officials update status"
  ON public.applications FOR UPDATE
  USING (
    (institution_id = public.current_institution_id() AND status = 'DRAFT')
    OR public.is_official() = TRUE
  );

-- -----------------------------------------------------------------------------
-- 4. DOCUMENTS & DOCUMENT VERSIONS RLS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Documents: select allowed by institution or official"
  ON public.documents FOR SELECT
  USING (
    public.is_official() = TRUE 
    OR application_id IN (
      SELECT id FROM public.applications WHERE institution_id = public.current_institution_id()
    )
  );

CREATE POLICY "Documents: insert allowed for own institution"
  ON public.documents FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT id FROM public.applications WHERE institution_id = public.current_institution_id()
    )
  );

CREATE POLICY "Document Versions: select allowed by institution or official"
  ON public.document_versions FOR SELECT
  USING (
    public.is_official() = TRUE 
    OR document_id IN (
      SELECT d.id FROM public.documents d
      JOIN public.applications a ON d.application_id = a.id
      WHERE a.institution_id = public.current_institution_id()
    )
  );

CREATE POLICY "Document Versions: insert allowed for own institution"
  ON public.document_versions FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT d.id FROM public.documents d
      JOIN public.applications a ON d.application_id = a.id
      WHERE a.institution_id = public.current_institution_id()
    )
  );

-- -----------------------------------------------------------------------------
-- 5. FINDINGS & VALIDATION RUNS RLS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Findings: read allowed by institution or official"
  ON public.findings FOR SELECT
  USING (
    public.is_official() = TRUE 
    OR application_id IN (
      SELECT id FROM public.applications WHERE institution_id = public.current_institution_id()
    )
  );

CREATE POLICY "Findings: official disposition updates"
  ON public.findings FOR UPDATE
  USING (
    public.current_user_role() IN ('scrutiny_officer', 'supervising_authority', 'admin')
  );

CREATE POLICY "Validation Runs: select allowed by institution or official"
  ON public.validation_runs FOR SELECT
  USING (
    public.is_official() = TRUE 
    OR application_id IN (
      SELECT id FROM public.applications WHERE institution_id = public.current_institution_id()
    )
  );

-- -----------------------------------------------------------------------------
-- 6. CLARIFICATION REQUESTS RLS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Clarifications: read allowed by institution or official"
  ON public.clarification_requests FOR SELECT
  USING (
    public.is_official() = TRUE 
    OR application_id IN (
      SELECT id FROM public.applications WHERE institution_id = public.current_institution_id()
    )
  );

CREATE POLICY "Clarifications: officers create queries"
  ON public.clarification_requests FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('scrutiny_officer', 'supervising_authority', 'admin')
  );

CREATE POLICY "Clarifications: applicants respond to queries"
  ON public.clarification_requests FOR UPDATE
  USING (
    application_id IN (
      SELECT id FROM public.applications WHERE institution_id = public.current_institution_id()
    )
    OR public.is_official() = TRUE
  );

-- -----------------------------------------------------------------------------
-- 7. STATUTORY REVIEW ACTIONS RLS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Review Actions: read allowed by institution or official"
  ON public.review_actions FOR SELECT
  USING (
    public.is_official() = TRUE 
    OR application_id IN (
      SELECT id FROM public.applications WHERE institution_id = public.current_institution_id()
    )
  );

CREATE POLICY "Review Actions: only competent authority can record final decisions"
  ON public.review_actions FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('supervising_authority', 'admin')
  );

-- -----------------------------------------------------------------------------
-- 8. AUDIT LOGS RLS POLICIES (Tamper-evident, Append-only)
-- -----------------------------------------------------------------------------
CREATE POLICY "Audit Logs: read by officials and auditors"
  ON public.audit_logs FOR SELECT
  USING (
    public.current_user_role() IN ('auditor', 'admin', 'supervising_authority', 'scrutiny_officer')
  );

CREATE POLICY "Audit Logs: insert allowed for system events"
  ON public.audit_logs FOR INSERT
  WITH CHECK (TRUE);

-- Explicitly NO UPDATE or DELETE on audit logs for any role
-- (PostgreSQL RLS blocks any action that lacks an explicit policy)

-- -----------------------------------------------------------------------------
-- 9. REGULATORY RULES & CHECKLISTS RLS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Rules: readable by all authenticated users"
  ON public.rules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Rules: modify restricted to system admin"
  ON public.rules FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Rule Sets: readable by all authenticated users"
  ON public.rule_sets FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Checklist Items: readable by all authenticated users"
  ON public.checklist_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Categories: readable by all authenticated users"
  ON public.application_categories FOR SELECT
  USING (auth.role() = 'authenticated');
