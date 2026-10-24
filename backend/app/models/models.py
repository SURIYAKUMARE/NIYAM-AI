import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, Enum, JSON
)
from sqlalchemy.orm import relationship
from ..core.database import Base

class UserRole(str, enum.Enum):
    APPLICANT = "applicant"
    SCRUTINY_OFFICER = "scrutiny_officer"
    SUPERVISING_AUTHORITY = "supervising_authority"
    ADMIN = "admin"
    AUDITOR = "auditor"

class ApplicationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PRELIMINARY_CHECK_PASSED = "PRELIMINARY_CHECK_PASSED"
    DEFICIENCIES_DETECTED = "DEFICIENCIES_DETECTED"
    SUBMITTED_FOR_SCRUTINY = "SUBMITTED_FOR_SCRUTINY"
    UNDER_SCRUTINY = "UNDER_SCRUTINY"
    CLARIFICATION_REQUESTED = "CLARIFICATION_REQUESTED"
    RESUBMITTED = "RESUBMITTED"
    RECOMMENDED_FOR_APPROVAL = "RECOMMENDED_FOR_APPROVAL"
    RECOMMENDED_FOR_INSPECTION = "RECOMMENDED_FOR_INSPECTION"
    REJECTED_BY_AUTHORITY = "REJECTED_BY_AUTHORITY"
    APPROVED_BY_AUTHORITY = "APPROVED_BY_AUTHORITY"

class DocumentStatus(str, enum.Enum):
    PENDING_UPLOAD = "PENDING_UPLOAD"
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    VALIDATED = "VALIDATED"
    DEFICIENT = "DEFICIENT"
    VERIFIED = "VERIFIED"
    RECTIFIED = "RECTIFIED"

class FindingSeverity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    MAJOR = "MAJOR"
    MINOR = "MINOR"
    ADVISORY = "ADVISORY"

class FindingStatus(str, enum.Enum):
    OPEN = "OPEN"
    RECTIFIED_BY_APPLICANT = "RECTIFIED_BY_APPLICANT"
    DISMISSED_BY_OFFICER = "DISMISSED_BY_OFFICER"
    CONFIRMED_BY_OFFICER = "CONFIRMED_BY_OFFICER"
    WAIVED_BY_AUTHORITY = "WAIVED_BY_AUTHORITY"

class VerificationStatus(str, enum.Enum):
    VERIFIED = "VERIFIED"
    MISMATCH_DETECTED = "MISMATCH_DETECTED"
    EXPIRED = "EXPIRED"
    VERIFICATION_PENDING = "VERIFICATION_PENDING"
    SOURCE_UNAVAILABLE = "SOURCE_UNAVAILABLE"
    MANUAL_REVIEW_REQUIRED = "MANUAL_REVIEW_REQUIRED"
    NOT_SUPPORTED = "NOT_SUPPORTED"

class AuthoritySourceType(str, enum.Enum):
    DIGILOCKER = "DIGILOCKER"
    UNIVERSITY_AFFILIATION = "UNIVERSITY_AFFILIATION"
    LAND_REVENUE_PORTAL = "LAND_REVENUE_PORTAL"
    BANK_TER_GATEWAY = "BANK_TER_GATEWAY"
    QR_SIGNATURE_SERVICE = "QR_SIGNATURE_SERVICE"
    MANUAL_CONFIRMATION = "MANUAL_CONFIRMATION"

class RuleSetStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    RETIRED = "RETIRED"


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    aicte_permanent_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    legal_entity_type = Column(String(100), default="Registered Trust / Society")
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    pin_code = Column(String(20), nullable=False)
    contact_email = Column(String(150), nullable=False)
    contact_phone = Column(String(50), nullable=False)
    established_year = Column(Integer, default=2010)
    accreditation_grade = Column(String(20), default="NAAC A+")
    has_prior_deficiencies = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="institution")
    applications = relationship("Application", back_populates="institution")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.APPLICANT)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    designation = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Server-enforced TOTP Multi-Factor Authentication
    mfa_secret = Column(String(64), nullable=True)
    mfa_enrolled = Column(Boolean, default=False)
    mfa_last_verified_counter = Column(Integer, nullable=True)
    mfa_failed_attempts = Column(Integer, default=0)
    mfa_locked_until = Column(DateTime, nullable=True)
    recovery_codes_hash = Column(String(512), nullable=True)

    institution = relationship("Institution", back_populates="users")


class ApplicationCategory(Base):
    __tablename__ = "application_categories"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)  # e.g., EXTENSION_OF_APPROVAL
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    academic_year = Column(String(20), default="2025-26")
    is_active = Column(Boolean, default=True)


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    application_number = Column(String(50), unique=True, index=True, nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    category_code = Column(String(50), nullable=False)
    academic_year = Column(String(20), default="2025-26")
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.DRAFT, nullable=False)
    submission_date = Column(DateTime, nullable=True)
    rule_set_version = Column(String(50), default="v2025.1", nullable=False)
    approved_programmes = Column(JSON, default=list)  # e.g. [{"name": "B.Tech Computer Science", "intake": 120}]
    ter_payment_status = Column(String(50), default="PAID")
    ter_transaction_ref = Column(String(100), nullable=True)
    overall_risk_score = Column(Float, default=0.0)
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    institution = relationship("Institution", back_populates="applications")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id])
    documents = relationship("Document", back_populates="application", cascade="all, delete-orphan")
    validation_runs = relationship("ValidationRun", back_populates="application", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="application", cascade="all, delete-orphan")
    review_actions = relationship("ReviewAction", back_populates="application", cascade="all, delete-orphan")
    clarifications = relationship("ClarificationRequest", back_populates="application", cascade="all, delete-orphan")
    infrastructure_items = relationship("InfrastructureEvidence", back_populates="application", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    checklist_item_code = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    document_type = Column(String(100), nullable=False)
    is_mandatory = Column(Boolean, default=True)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.PENDING_UPLOAD)
    current_version_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    application = relationship("Application", back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")


class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    version_number = Column(Integer, default=1, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    sha256_hash = Column(String(64), index=True, nullable=False)
    storage_path = Column(String(500), nullable=False)
    uploaded_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_duplicate_detected = Column(Boolean, default=False)
    malware_scan_status = Column(String(50), default="CLEAN")
    scan_engine = Column(String(100), default="Heuristic Signature Engine v2.4")
    metadata_json = Column(JSON, default=dict)

    document = relationship("Document", back_populates="versions")
    uploaded_by = relationship("User")
    extracted_fields = relationship("ExtractedField", back_populates="document_version", cascade="all, delete-orphan")
    verification_requests = relationship("VerificationRequest", back_populates="document_version")


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(Integer, primary_key=True, index=True)
    document_version_id = Column(Integer, ForeignKey("document_versions.id"), nullable=False)
    field_name = Column(String(100), nullable=False)
    original_value = Column(Text, nullable=True)
    corrected_value = Column(Text, nullable=True)
    confidence_score = Column(Float, default=1.0)
    is_low_confidence = Column(Boolean, default=False)
    page_number = Column(Integer, default=1)
    bounding_box = Column(JSON, nullable=True)  # [ymin, xmin, ymax, xmax] normalized
    raw_text_excerpt = Column(Text, nullable=True)
    extraction_method = Column(String(100), default="ocr-heuristic-v1")
    is_corrected = Column(Boolean, default=False)
    corrected_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    corrected_at = Column(DateTime, nullable=True)

    document_version = relationship("DocumentVersion", back_populates="extracted_fields")
    corrections = relationship("FieldCorrection", back_populates="extracted_field", cascade="all, delete-orphan")


class FieldCorrection(Base):
    __tablename__ = "field_corrections"

    id = Column(Integer, primary_key=True, index=True)
    extracted_field_id = Column(Integer, ForeignKey("extracted_fields.id"), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    reason = Column(Text, nullable=False)
    corrected_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    extracted_field = relationship("ExtractedField", back_populates="corrections")
    corrected_by = relationship("User")


class RuleSet(Base):
    __tablename__ = "rule_sets"

    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(50), unique=True, index=True, nullable=False)  # e.g. v2025.1
    title = Column(String(200), nullable=False)
    status = Column(Enum(RuleSetStatus), default=RuleSetStatus.DRAFT)
    effective_from = Column(DateTime, nullable=False)
    effective_to = Column(DateTime, nullable=True)
    handbook_edition = Column(String(150), default="AICTE Approval Process Handbook (Illustrative Demo)")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    checklist_items = relationship("ChecklistItem", back_populates="rule_set", cascade="all, delete-orphan")
    rules = relationship("Rule", back_populates="rule_set", cascade="all, delete-orphan")


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    rule_set_version = Column(String(50), ForeignKey("rule_sets.version"), nullable=False)
    category_code = Column(String(50), nullable=False)
    item_code = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    is_mandatory = Column(Boolean, default=True)
    required_fields = Column(JSON, default=list)  # ["institution_name", "approval_year", ...]
    accepted_mime_types = Column(JSON, default=lambda: ["application/pdf", "image/png", "image/jpeg"])

    rule_set = relationship("RuleSet", back_populates="checklist_items")


class Rule(Base):
    __tablename__ = "rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_set_version = Column(String(50), ForeignKey("rule_sets.version"), nullable=False)
    rule_code = Column(String(50), nullable=False, index=True)
    category_code = Column(String(50), nullable=False)  # or 'ALL'
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    condition_type = Column(String(100), nullable=False)
    condition_config = Column(JSON, default=dict)
    severity = Column(Enum(FindingSeverity), default=FindingSeverity.MAJOR)
    source_handbook_ref = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

    rule_set = relationship("RuleSet", back_populates="rules")


class ValidationRun(Base):
    __tablename__ = "validation_runs"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    rule_set_version = Column(String(50), nullable=False)
    triggered_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_rules_evaluated = Column(Integer, default=0)
    findings_count = Column(Integer, default=0)
    status = Column(String(50), default="SUCCESS")
    summary = Column(Text, nullable=True)
    run_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    application = relationship("Application", back_populates="validation_runs")
    findings = relationship("Finding", back_populates="validation_run", cascade="all, delete-orphan")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    validation_run_id = Column(Integer, ForeignKey("validation_runs.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    document_version_id = Column(Integer, ForeignKey("document_versions.id"), nullable=True)
    rule_code = Column(String(50), nullable=False)
    category = Column(String(100), nullable=False)
    severity = Column(Enum(FindingSeverity), nullable=False)
    explanation = Column(Text, nullable=False)
    expected_value = Column(Text, nullable=True)
    observed_value = Column(Text, nullable=True)
    rule_citation = Column(String(255), nullable=True)
    page_number = Column(Integer, nullable=True)
    bounding_box = Column(JSON, nullable=True)
    excerpt = Column(Text, nullable=True)
    detection_method = Column(String(100), default="deterministic-rule-engine")
    confidence_score = Column(Float, nullable=True)
    status = Column(Enum(FindingStatus), default=FindingStatus.OPEN)
    officer_notes = Column(Text, nullable=True)
    reviewed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    validation_run = relationship("ValidationRun", back_populates="findings")
    application = relationship("Application", back_populates="findings")
    document_version = relationship("DocumentVersion")
    reviewed_by = relationship("User")


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    document_version_id = Column(Integer, ForeignKey("document_versions.id"), nullable=False)
    authority_type = Column(Enum(AuthoritySourceType), nullable=False)
    request_reference = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(Enum(VerificationStatus), default=VerificationStatus.VERIFICATION_PENDING)
    source_endpoint = Column(String(255), nullable=False)
    matched_fields = Column(JSON, default=dict)
    mismatched_fields = Column(JSON, default=dict)
    response_summary = Column(Text, nullable=True)
    latency_ms = Column(Integer, default=150)
    simulated_demo = Column(Boolean, default=True)
    confirmed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    supporting_evidence_ref = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document_version = relationship("DocumentVersion", back_populates="verification_requests")
    confirmed_by = relationship("User", foreign_keys=[confirmed_by_user_id])


class InfrastructureEvidence(Base):
    __tablename__ = "infrastructure_evidence"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    facility_type = Column(String(100), nullable=False)  # e.g., COMPUTER_CENTER, LIBRARY
    caption = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    storage_path = Column(String(500), nullable=False)
    reported_area_sqm = Column(Float, nullable=False)
    required_area_sqm = Column(Float, nullable=False)
    reported_equipment_count = Column(Integer, default=0)
    cv_detected_count = Column(Integer, default=0)
    cv_tags = Column(JSON, default=list)  # ["computers", "desks", "monitors"]
    geo_lat = Column(Float, nullable=True)
    geo_long = Column(Float, nullable=True)
    inspection_recommended = Column(Boolean, default=False)
    officer_comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    application = relationship("Application", back_populates="infrastructure_items")


class ClarificationRequest(Base):
    __tablename__ = "clarification_requests"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    finding_id = Column(Integer, ForeignKey("findings.id"), nullable=True)
    officer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    applicant_response = Column(Text, nullable=True)
    response_document_version_id = Column(Integer, ForeignKey("document_versions.id"), nullable=True)
    status = Column(String(50), default="PENDING")  # PENDING, RESPONDED, RESOLVED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    responded_at = Column(DateTime, nullable=True)

    application = relationship("Application", back_populates="clarifications")
    officer = relationship("User", foreign_keys=[officer_user_id])
    finding = relationship("Finding")


class ReviewAction(Base):
    __tablename__ = "review_actions"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    officer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(String(100), nullable=False)
    comments = Column(Text, nullable=False)
    statutory_decision = Column(String(100), nullable=True)  # APPROVE, REJECT, INSPECTION
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    application = relationship("Application", back_populates="review_actions")
    officer = relationship("User")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    actor_username = Column(String(100), nullable=False)
    actor_role = Column(String(50), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=False)
    action = Column(String(150), nullable=False)
    details = Column(JSON, default=dict)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    previous_record_hash = Column(String(64), nullable=True)
    record_hash = Column(String(64), nullable=False)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_role = Column(String(50), nullable=True)  # or 'applicant', 'scrutiny_officer', etc.
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="INFO")  # MISSING_INFO, EXPIRING_DOC, COMPLETED_PROCESSING, SOURCE_FAILURE, CLARIFICATION, NEW_ASSIGNMENT
    link_url = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")

