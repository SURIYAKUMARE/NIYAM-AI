from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.models import UserRole, ApplicationStatus, DocumentStatus, FindingSeverity, FindingStatus, VerificationStatus, AuthoritySourceType, RuleSetStatus

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: UserRole
    institution_id: Optional[int] = None
    designation: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

# Institution
class InstitutionBase(BaseModel):
    aicte_permanent_id: str
    name: str
    legal_entity_type: str
    state: str
    district: str
    pin_code: str
    contact_email: EmailStr
    contact_phone: str
    established_year: int
    accreditation_grade: str
    has_prior_deficiencies: bool = False

class InstitutionResponse(InstitutionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Extracted Fields & Corrections
class ExtractedFieldResponse(BaseModel):
    id: int
    document_version_id: int
    field_name: str
    original_value: Optional[str] = None
    corrected_value: Optional[str] = None
    confidence_score: float
    is_low_confidence: bool
    page_number: int
    bounding_box: Optional[List[float]] = None
    raw_text_excerpt: Optional[str] = None
    extraction_method: str
    is_corrected: bool
    corrected_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class FieldCorrectionRequest(BaseModel):
    new_value: str
    reason: str

# Document & Version
class DocumentVersionResponse(BaseModel):
    id: int
    document_id: int
    version_number: int
    file_name: str
    file_size: int
    mime_type: str
    sha256_hash: str
    uploaded_at: datetime
    is_duplicate_detected: bool
    metadata_json: Dict[str, Any]
    extracted_fields: List[ExtractedFieldResponse] = []

    model_config = ConfigDict(from_attributes=True)

class DocumentResponse(BaseModel):
    id: int
    application_id: int
    checklist_item_code: str
    title: str
    document_type: str
    is_mandatory: bool
    status: DocumentStatus
    current_version_id: Optional[int] = None
    versions: List[DocumentVersionResponse] = []

    model_config = ConfigDict(from_attributes=True)

# Verification
class VerificationRequestResponse(BaseModel):
    id: int
    application_id: int
    document_version_id: int
    authority_type: AuthoritySourceType
    request_reference: str
    status: VerificationStatus
    source_endpoint: str
    matched_fields: Dict[str, Any]
    mismatched_fields: Dict[str, Any]
    response_summary: Optional[str] = None
    latency_ms: int
    simulated_demo: bool
    confirmed_by_user_id: Optional[int] = None
    supporting_evidence_ref: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class TriggerVerificationRequest(BaseModel):
    authority_type: AuthoritySourceType
    document_version_id: int

class ManualConfirmationRequest(BaseModel):
    document_version_id: int
    supporting_evidence_ref: str
    observations: str

class NotificationResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    target_role: Optional[str] = None
    title: str
    message: str
    type: str
    link_url: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Findings
class FindingResponse(BaseModel):
    id: int
    validation_run_id: int
    application_id: int
    document_version_id: Optional[int] = None
    rule_code: str
    category: str
    severity: FindingSeverity
    explanation: str
    expected_value: Optional[str] = None
    observed_value: Optional[str] = None
    rule_citation: Optional[str] = None
    page_number: Optional[int] = None
    bounding_box: Optional[List[float]] = None
    excerpt: Optional[str] = None
    detection_method: str
    confidence_score: Optional[float] = None
    status: FindingStatus
    officer_notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UpdateFindingDispositionRequest(BaseModel):
    status: FindingStatus  # DISMISSED_BY_OFFICER, CONFIRMED_BY_OFFICER, WAIVED_BY_AUTHORITY
    officer_notes: str

# Application
class ApplicationCreateRequest(BaseModel):
    category_code: str
    academic_year: str = "2025-26"
    approved_programmes: List[Dict[str, Any]] = []
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    application_number: str
    institution_id: int
    category_code: str
    academic_year: str
    status: ApplicationStatus
    submission_date: Optional[datetime] = None
    rule_set_version: str
    approved_programmes: List[Dict[str, Any]] = []
    ter_payment_status: str
    ter_transaction_ref: Optional[str] = None
    overall_risk_score: float
    assigned_officer_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    institution: Optional[InstitutionResponse] = None
    documents: List[DocumentResponse] = []
    findings: List[FindingResponse] = []

    model_config = ConfigDict(from_attributes=True)

# Clarification
class CreateClarificationRequest(BaseModel):
    finding_id: Optional[int] = None
    question: str

class RespondClarificationRequest(BaseModel):
    applicant_response: str
    response_document_version_id: Optional[int] = None

class ClarificationResponse(BaseModel):
    id: int
    application_id: int
    finding_id: Optional[int] = None
    officer_user_id: int
    question: str
    applicant_response: Optional[str] = None
    status: str
    created_at: datetime
    responded_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Review & Statutory Decision
class RecordReviewActionRequest(BaseModel):
    action_type: str  # PRELIMINARY_SCRUTINY, CLARIFICATION_REQUESTED, PHYSICAL_INSPECTION_RECOMMENDED, APPROVAL_RECOMMENDED, REJECTION_RECOMMENDED, STATUTORY_DECISION_RECORDED
    comments: str
    statutory_decision: Optional[str] = None  # APPROVE, REJECT, INSPECT

class ReviewActionResponse(BaseModel):
    id: int
    application_id: int
    officer_user_id: int
    action_type: str
    comments: str
    statutory_decision: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Infrastructure Evidence
class InfrastructureEvidenceResponse(BaseModel):
    id: int
    application_id: int
    facility_type: str
    caption: str
    file_name: str
    reported_area_sqm: float
    required_area_sqm: float
    reported_equipment_count: int
    cv_detected_count: int
    cv_tags: List[str] = []
    geo_lat: Optional[float] = None
    geo_long: Optional[float] = None
    inspection_recommended: bool
    officer_comments: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UpdateInfrastructureComments(BaseModel):
    inspection_recommended: bool
    officer_comments: str

# Rules & Checklist Administration
class RuleResponse(BaseModel):
    id: int
    rule_set_version: str
    rule_code: str
    category_code: str
    title: str
    description: str
    condition_type: str
    condition_config: Dict[str, Any]
    severity: FindingSeverity
    source_handbook_ref: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class ChecklistItemResponse(BaseModel):
    id: int
    rule_set_version: str
    category_code: str
    item_code: str
    title: str
    description: Optional[str] = None
    is_mandatory: bool
    required_fields: List[str] = []
    accepted_mime_types: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class RuleSetResponse(BaseModel):
    id: int
    version: str
    title: str
    status: RuleSetStatus
    effective_from: datetime
    effective_to: Optional[datetime] = None
    handbook_edition: str
    notes: Optional[str] = None
    rules: List[RuleResponse] = []
    checklist_items: List[ChecklistItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

class CreateRuleSetRequest(BaseModel):
    version: str
    title: str
    effective_from: datetime
    effective_to: Optional[datetime] = None
    handbook_edition: str = "AICTE Approval Process Handbook (Illustrative Demo)"
    notes: Optional[str] = None

class CreateRuleRequest(BaseModel):
    rule_code: str
    category_code: str
    title: str
    description: str
    condition_type: str
    condition_config: Dict[str, Any]
    severity: FindingSeverity
    source_handbook_ref: str

# Audit
class AuditLogResponse(BaseModel):
    id: int
    event_type: str
    actor_user_id: Optional[int] = None
    actor_username: str
    actor_role: str
    entity_type: str
    entity_id: str
    action: str
    details: Dict[str, Any]
    ip_address: str
    timestamp: datetime
    record_hash: str

    model_config = ConfigDict(from_attributes=True)
