import os
from datetime import datetime, timezone, timedelta, date
from sqlalchemy.orm import Session
from ..core.security import hash_password
from ..core.totp import hash_recovery_code
from ..core.config import settings
from ..core.storage import storage_provider
from ..models.models import (
    User, UserRole, Institution, ApplicationCategory, Application, ApplicationStatus,
    Document, DocumentVersion, DocumentStatus, ExtractedField, RuleSet, RuleSetStatus,
    ChecklistItem, Rule, FindingSeverity, FindingStatus, VerificationStatus,
    AuthoritySourceType, VerificationRequest, InfrastructureEvidence, AuditLog, ValidationRun, Finding, Notification
)
from ..services.audit_service import audit_service

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).count() > 0:
        return

    print("--- Seeding AICTE Verify Database ---")

    # 1. Seed RuleSets
    ruleset_2025 = RuleSet(
        version="v2025.1",
        title="AICTE Approval Process Regulations 2025-26",
        status=RuleSetStatus.ACTIVE,
        effective_from=datetime(2025, 1, 1, tzinfo=timezone.utc),
        handbook_edition="AICTE Approval Process Handbook 2025-26 (Illustrative Demo Model)",
        notes="Standard statutory framework for Extension of Approval (EoA) and Increase in Intake."
    )
    ruleset_2024 = RuleSet(
        version="v2024.1",
        title="AICTE Approval Process Regulations 2024-25 (Historical)",
        status=RuleSetStatus.RETIRED,
        effective_from=datetime(2024, 1, 1, tzinfo=timezone.utc),
        effective_to=datetime(2024, 12, 31, tzinfo=timezone.utc),
        handbook_edition="AICTE Approval Process Handbook 2024-25 (Historical Demo)",
        notes="Archived regulatory version preserved for audit compliance."
    )
    db.add(ruleset_2025)
    db.add(ruleset_2024)
    db.flush()

    # Checklist Items for v2025.1
    checklists = [
        ChecklistItem(
            rule_set_version="v2025.1",
            category_code="ALL",
            item_code="DOC-EOA",
            title="Previous Year AICTE Extension of Approval (EoA)",
            description="Letter of Approval issued for the immediate preceding academic session.",
            is_mandatory=True,
            required_fields=["aicte_permanent_id", "institution_name", "approval_year", "issuing_authority"]
        ),
        ChecklistItem(
            rule_set_version="v2025.1",
            category_code="ALL",
            item_code="DOC-FIRE-NOC",
            title="Fire & Life Safety Clearance Certificate",
            description="Valid Fire Safety Certificate issued by State Fire Services or Municipal Authority.",
            is_mandatory=True,
            required_fields=["certificate_number", "valid_until_date", "issuing_authority"]
        ),
        ChecklistItem(
            rule_set_version="v2025.1",
            category_code="ALL",
            item_code="DOC-LAND-DEED",
            title="Registered Land Ownership Deed / Non-Encumbrance",
            description="Registered sale deed, lease deed (minimum 30 years), or gift deed in favor of the Society/Trust.",
            is_mandatory=True,
            required_fields=["title_holder_name", "survey_numbers", "total_land_area", "registration_number"]
        ),
        ChecklistItem(
            rule_set_version="v2025.1",
            category_code="ALL",
            item_code="DOC-BUILDING-PLAN",
            title="Approved Building & Architectural Plan",
            description="Structural safety & municipal sanctioned building floor plan for institutional instructional area.",
            is_mandatory=True,
            required_fields=["approval_authority", "sanctioned_built_up_area"]
        ),
        ChecklistItem(
            rule_set_version="v2025.1",
            category_code="ALL",
            item_code="DOC-AFFILIATION",
            title="Affiliating University NOC / Affiliation Order",
            description="Formal grant of provisional affiliation from the state affiliating technical university.",
            is_mandatory=True,
            required_fields=["university_name", "affiliation_academic_year"]
        ),
        ChecklistItem(
            rule_set_version="v2025.1",
            category_code="ALL",
            item_code="DOC-TER-RECEIPT",
            title="TER Payment Challan / Electronic Receipt",
            description="Payment confirmation for Technical Education Regulatory (TER) fee.",
            is_mandatory=True,
            required_fields=["transaction_reference", "amount_paid"]
        ),
    ]
    for c in checklists:
        db.add(c)

    # Deterministic Rules for v2025.1
    rules = [
        Rule(
            rule_set_version="v2025.1",
            rule_code="RULE-MANDATORY-DOC-01",
            category_code="ALL",
            title="Mandatory Checklist Document Submission",
            description="All statutory compliance documents marked mandatory in the applicable handbook checklist must be submitted.",
            condition_type="MANDATORY_EXISTS",
            condition_config={},
            severity=FindingSeverity.CRITICAL,
            source_handbook_ref="AICTE APH 2025-26, Chapter I, Clause 2.1 (Mandatory Documents)",
            is_active=True
        ),
        Rule(
            rule_set_version="v2025.1",
            rule_code="RULE-FIRE-EXP-02",
            category_code="ALL",
            title="Fire Safety Certificate Expiry Verification",
            description="The Fire Safety NOC must be legally valid throughout the active academic session.",
            condition_type="DATE_NOT_EXPIRED",
            condition_config={"document_code": "DOC-FIRE-NOC", "date_field": "valid_until_date"},
            severity=FindingSeverity.CRITICAL,
            source_handbook_ref="AICTE APH 2025-26, Chapter I, Clause 4.8 (Life Safety)",
            is_active=True
        ),
        Rule(
            rule_set_version="v2025.1",
            rule_code="RULE-LAND-TIT-03",
            category_code="ALL",
            title="Land Ownership Entity Consistency",
            description="Land deed title holder name must strictly match the sponsoring Society/Trust entity.",
            condition_type="CROSS_FIELD_MATCH",
            condition_config={"doc1": "DOC-LAND-DEED", "field1": "title_holder_name"},
            severity=FindingSeverity.CRITICAL,
            source_handbook_ref="AICTE APH 2025-26, Chapter I, Clause 3.4 (Title in favor of Trust/Society)",
            is_active=True
        ),
        Rule(
            rule_set_version="v2025.1",
            rule_code="RULE-DUPLICATE-HASH-01",
            category_code="ALL",
            title="Unique Document Cryptographic Integrity",
            description="Uploaded institutional documents must be genuine and unique to the applying institution; exact cryptographic collisions trigger scrutiny.",
            condition_type="SHA256_UNIQUENESS",
            condition_config={},
            severity=FindingSeverity.CRITICAL,
            source_handbook_ref="AICTE APH 2025-26, Chapter II, Clause 5.1 (Submission Authenticity)",
            is_active=True
        ),
        Rule(
            rule_set_version="v2025.1",
            rule_code="RULE-TER-PAY-04",
            category_code="ALL",
            title="TER Regulatory Fee Reconciliation",
            description="Electronic TER processing fee payment must be settled through Bharatkosh before scrutiny.",
            condition_type="TER_PAYMENT_VERIFIED",
            condition_config={},
            severity=FindingSeverity.CRITICAL,
            source_handbook_ref="AICTE APH 2025-26, Chapter I, Clause 1.6 (Processing Charges)",
            is_active=True
        ),
        Rule(
            rule_set_version="v2025.1",
            rule_code="RULE-EXTRACTION-CONF-01",
            category_code="ALL",
            title="Document Text Legibility and Confidence Check",
            description="Extracted key regulatory fields must meet minimum legibility thresholds (>70% confidence).",
            condition_type="FIELD_NON_EMPTY",
            condition_config={},
            severity=FindingSeverity.MINOR,
            source_handbook_ref="AICTE IT Directorate, Scrutiny Digitization Manual 2025, Sec 3.1",
            is_active=True
        )
    ]
    for r in rules:
        db.add(r)
    db.flush()

    # 2. Seed Application Categories
    categories = [
        ApplicationCategory(
            code="EXTENSION_OF_APPROVAL",
            name="Extension of Approval (EoA)",
            description="Annual renewal for currently approved technical and polytechnic institutes.",
            academic_year="2025-26"
        ),
        ApplicationCategory(
            code="INCREASE_IN_INTAKE",
            name="Increase in Intake / Additional Course",
            description="Addition of seats or courses in existing technical institutions.",
            academic_year="2025-26"
        ),
        ApplicationCategory(
            code="NEW_INSTITUTION",
            name="Establishment of New Technical Institution",
            description="Fresh application for starting a new degree or diploma engineering institute.",
            academic_year="2025-26"
        ),
        ApplicationCategory(
            code="CHANGE_OF_SITE",
            name="Change of Site / Location",
            description="Relocation of approved campus to new sanctioned land premises.",
            academic_year="2025-26"
        )
    ]
    for cat in categories:
        db.add(cat)
    db.flush()

    # 3. Seed Institutions
    inst1 = Institution(
        aicte_permanent_id="1-492048123",
        name="Apex Institute of Technology & Science",
        legal_entity_type="Registered Trust",
        state="Maharashtra",
        district="Pune",
        pin_code="411038",
        contact_email="registrar@apexinstitute.edu.in",
        contact_phone="+91-20-25890124",
        established_year=2008,
        accreditation_grade="NAAC A+",
        has_prior_deficiencies=False
    )
    inst2 = Institution(
        aicte_permanent_id="1-782190341",
        name="Shree Vidya Engineering College",
        legal_entity_type="Educational Society",
        state="Karnataka",
        district="Bengaluru Urban",
        pin_code="560064",
        contact_email="principal@shreevidya.ac.in",
        contact_phone="+91-80-28561900",
        established_year=2012,
        accreditation_grade="NBA Accredited (3 Courses)",
        has_prior_deficiencies=False
    )
    inst3 = Institution(
        aicte_permanent_id="1-331049281",
        name="Bharatiya Polytechnic Institute",
        legal_entity_type="Section 8 Non-Profit Company",
        state="Tamil Nadu",
        district="Coimbatore",
        pin_code="641014",
        contact_email="director@bharatiyapoly.org",
        contact_phone="+91-422-2698120",
        established_year=2015,
        accreditation_grade="Eligible for Accreditation",
        has_prior_deficiencies=True
    )
    db.add(inst1)
    db.add(inst2)
    db.add(inst3)
    db.flush()

    # 4. Seed Users (5 Demo Roles)
    # Password for all demo accounts: 'password123'
    hashed_pwd = hash_password("password123")
    demo_totp_secret = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP"
    demo_rec_hash = hash_recovery_code("REC-DEMO-2025")

    user_applicant = User(
        username="applicant",
        email="applicant@apexinstitute.edu.in",
        full_name="Dr. Rajeshwari Sharma",
        hashed_password=hashed_pwd,
        role=UserRole.APPLICANT,
        institution_id=inst1.id,
        designation="Principal / Authorized Institutional Representative",
        is_active=True,
        mfa_enrolled=False
    )
    user_officer = User(
        username="officer",
        email="officer.scrutiny@aicte-india.org",
        full_name="Er. Anand Mohan Verma",
        hashed_password=hashed_pwd,
        role=UserRole.SCRUTINY_OFFICER,
        institution_id=None,
        designation="Senior Scrutiny Officer, Western Regional Office",
        is_active=True,
        mfa_secret=demo_totp_secret,
        mfa_enrolled=True,
        recovery_codes_hash=demo_rec_hash
    )
    user_authority = User(
        username="authority",
        email="authority.bureau@aicte-india.org",
        full_name="Prof. (Dr.) Sudhir K. Sen",
        hashed_password=hashed_pwd,
        role=UserRole.SUPERVISING_AUTHORITY,
        institution_id=None,
        designation="Advisor / Competent Statutory Authority, Regulation Bureau",
        is_active=True,
        mfa_secret=demo_totp_secret,
        mfa_enrolled=True,
        recovery_codes_hash=demo_rec_hash
    )
    user_admin = User(
        username="admin",
        email="admin.sys@aicte-india.org",
        full_name="Vikramjit Singh",
        hashed_password=hashed_pwd,
        role=UserRole.ADMIN,
        institution_id=None,
        designation="Chief System & Compliance Administrator",
        is_active=True,
        mfa_secret=demo_totp_secret,
        mfa_enrolled=True,
        recovery_codes_hash=demo_rec_hash
    )
    user_auditor = User(
        username="auditor",
        email="auditor.ext@cag-oversight.gov.in",
        full_name="Smt. Meenakshi Iyer",
        hashed_password=hashed_pwd,
        role=UserRole.AUDITOR,
        institution_id=None,
        designation="Statutory Compliance & Regulatory Auditor",
        is_active=True,
        mfa_enrolled=False
    )
    db.add(user_applicant)
    db.add(user_officer)
    db.add(user_authority)
    db.add(user_admin)
    db.add(user_auditor)
    db.flush()

    # Helper function to generate simulated file content and store in storage provider
    def create_mock_doc(content_str: str, filename: str):
        content_bytes = content_str.encode("utf-8")
        # Prepend fake PDF magic for validation
        if filename.endswith(".pdf"):
            content_bytes = b"%PDF-1.4\n%AICTE-DOCUMENT-STORAGE\n" + content_bytes
        return storage_provider.store_file(content_bytes, filename)

    # 5. Seed the 9 Detailed Demonstration Scenarios
    scenarios_data = [
        # SCENARIO 1: Complete application with successful demo verification
        {
            "num": "AICTE-2025-APP-001",
            "inst": inst1,
            "category": "EXTENSION_OF_APPROVAL",
            "status": ApplicationStatus.PRELIMINARY_CHECK_PASSED,
            "title": "Complete Extension of Approval Application (Fully Verified)",
            "risk": 0.0,
            "docs": [
                {"code": "DOC-EOA", "title": "Previous EoA Letter 2024-25", "fn": "EOA_2024_Apex.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-FIRE-NOC", "title": "Fire & Life Safety NOC", "fn": "Fire_NOC_Apex_Valid.pdf", "exp": "2026-12-31", "low_conf": False},
                {"code": "DOC-LAND-DEED", "title": "Registered Land Sale Deed", "fn": "Land_Deed_Pune_Apex.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-BUILDING-PLAN", "title": "Approved Building Plan", "fn": "Sanctioned_Floor_Plan.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-AFFILIATION", "title": "University Affiliation NOC 2025-26", "fn": "SPPU_Affiliation_2025.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-TER-RECEIPT", "title": "TER Processing Fee Receipt", "fn": "TER_Bharatkosh_Payment.pdf", "exp": None, "low_conf": False},
            ],
            "infra": True,
            "verify_scenario": "NORMAL"
        },
        # SCENARIO 2: Missing mandatory document (e.g. Missing Building Plan)
        {
            "num": "AICTE-2025-APP-002",
            "inst": inst2,
            "category": "EXTENSION_OF_APPROVAL",
            "status": ApplicationStatus.DEFICIENCIES_DETECTED,
            "title": "Application with Missing Mandatory Building Plan",
            "risk": 45.0,
            "docs": [
                {"code": "DOC-EOA", "title": "Previous EoA Letter 2024-25", "fn": "EOA_2024_Vidya.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-FIRE-NOC", "title": "Fire & Safety Clearance", "fn": "Fire_NOC_Vidya.pdf", "exp": "2026-06-30", "low_conf": False},
                {"code": "DOC-LAND-DEED", "title": "Land Deed 10 Acres", "fn": "Land_Deed_Vidya.pdf", "exp": None, "low_conf": False},
                # DOC-BUILDING-PLAN is omitted intentionally
                {"code": "DOC-AFFILIATION", "title": "University Affiliation Letter", "fn": "VTU_Affiliation.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-TER-RECEIPT", "title": "TER Fee Receipt", "fn": "TER_Vidya_Paid.pdf", "exp": None, "low_conf": False},
            ],
            "infra": False,
            "verify_scenario": "NORMAL"
        },
        # SCENARIO 3: Expired certificate (Fire NOC expired in 2024)
        {
            "num": "AICTE-2025-APP-003",
            "inst": inst3,
            "category": "EXTENSION_OF_APPROVAL",
            "status": ApplicationStatus.DEFICIENCIES_DETECTED,
            "title": "Application with Expired Fire Safety Certificate",
            "risk": 55.0,
            "docs": [
                {"code": "DOC-EOA", "title": "Previous EoA 2024-25", "fn": "EOA_Bharatiya.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-FIRE-NOC", "title": "Fire NOC (Expired March 2024)", "fn": "Fire_NOC_Expired.pdf", "exp": "2024-03-31", "low_conf": False},
                {"code": "DOC-LAND-DEED", "title": "Registered Land Deed", "fn": "Land_Bharatiya.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-BUILDING-PLAN", "title": "Approved Building Plan", "fn": "Building_Plan_Bharatiya.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-AFFILIATION", "title": "Directorate of Technical Education NOC", "fn": "DOTE_Affiliation.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-TER-RECEIPT", "title": "TER Fee Receipt", "fn": "TER_Challan_Bharatiya.pdf", "exp": None, "low_conf": False},
            ],
            "infra": False,
            "verify_scenario": "EXPIRED"
        },
        # SCENARIO 4: Cross-document identifier mismatch (Land deed owner doesn't match sponsoring society)
        {
            "num": "AICTE-2025-APP-004",
            "inst": inst1,
            "category": "INCREASE_IN_INTAKE",
            "status": ApplicationStatus.DEFICIENCIES_DETECTED,
            "title": "Cross-Document Title Holder Mismatch (Land Deed vs Society)",
            "risk": 60.0,
            "docs": [
                {"code": "DOC-EOA", "title": "Previous EoA 2024-25", "fn": "EOA_Apex_2024.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-FIRE-NOC", "title": "Fire Safety NOC", "fn": "Fire_NOC_Apex.pdf", "exp": "2026-08-31", "low_conf": False},
                {"code": "DOC-LAND-DEED", "title": "Registered Land Deed", "fn": "Land_Deed_Mismatch.pdf", "exp": None, "low_conf": False, "mismatch": "Shree Balaji Commercial Developers Ltd"},
                {"code": "DOC-BUILDING-PLAN", "title": "Approved Building Plan", "fn": "Building_Plan_Apex.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-AFFILIATION", "title": "University Affiliation NOC", "fn": "Affiliation_Apex.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-TER-RECEIPT", "title": "TER Fee Receipt", "fn": "TER_Receipt_Apex.pdf", "exp": None, "low_conf": False},
            ],
            "infra": False,
            "verify_scenario": "MISMATCH"
        },
        # SCENARIO 5: Exact duplicate document (SHA-256 match with another institution's file)
        {
            "num": "AICTE-2025-APP-005",
            "inst": inst2,
            "category": "NEW_INSTITUTION",
            "status": ApplicationStatus.DEFICIENCIES_DETECTED,
            "title": "Exact Duplicate Document Upload (SHA-256 Collision)",
            "risk": 75.0,
            "docs": [
                {"code": "DOC-EOA", "title": "EoA Letter (Cloned)", "fn": "EOA_Duplicate_Cloned.pdf", "exp": None, "low_conf": False, "force_hash_of": "EOA_2024_Apex.pdf"},
                {"code": "DOC-FIRE-NOC", "title": "Fire Safety NOC", "fn": "Fire_NOC_Vidya_New.pdf", "exp": "2026-10-15", "low_conf": False},
                {"code": "DOC-LAND-DEED", "title": "Land Deed 5 Acres", "fn": "Land_Vidya_New.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-BUILDING-PLAN", "title": "Approved Building Plan", "fn": "Building_Plan_Vidya_New.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-AFFILIATION", "title": "University Affiliation Order", "fn": "Affiliation_Vidya_New.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-TER-RECEIPT", "title": "TER Fee Receipt", "fn": "TER_Vidya_New.pdf", "exp": None, "low_conf": False},
            ],
            "infra": False,
            "verify_scenario": "NORMAL"
        },
        # SCENARIO 6: Low-confidence OCR extraction (marked for manual review & human correction)
        {
            "num": "AICTE-2025-APP-006",
            "inst": inst3,
            "category": "EXTENSION_OF_APPROVAL",
            "status": ApplicationStatus.UNDER_SCRUTINY,
            "title": "Low-Confidence OCR Extraction (Review & Correction Required)",
            "risk": 20.0,
            "docs": [
                {"code": "DOC-EOA", "title": "Previous EoA 2024-25 (Scanned Fax)", "fn": "EOA_Fax_Scanned_Blur.pdf", "exp": None, "low_conf": True},
                {"code": "DOC-FIRE-NOC", "title": "Fire Safety Certificate", "fn": "Fire_NOC_Bharatiya_Valid.pdf", "exp": "2026-05-15", "low_conf": False},
                {"code": "DOC-LAND-DEED", "title": "Land Deed", "fn": "Land_Bharatiya_2.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-BUILDING-PLAN", "title": "Approved Building Plan", "fn": "Building_Bharatiya_2.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-AFFILIATION", "title": "University Affiliation Order", "fn": "Affiliation_Bharatiya_Blur.pdf", "exp": None, "low_conf": True},
                {"code": "DOC-TER-RECEIPT", "title": "TER Fee Receipt", "fn": "TER_Bharatiya_2.pdf", "exp": None, "low_conf": False},
            ],
            "infra": False,
            "verify_scenario": "NORMAL"
        },
        # SCENARIO 7: Unavailable verification source (Simulated 504 / timeout - not treated as invalid)
        {
            "num": "AICTE-2025-APP-007",
            "inst": inst1,
            "category": "EXTENSION_OF_APPROVAL",
            "status": ApplicationStatus.UNDER_SCRUTINY,
            "title": "External Authority Source Outage (DigiLocker / Gateway Unavailable)",
            "risk": 15.0,
            "docs": [
                {"code": "DOC-EOA", "title": "Previous EoA 2024-25", "fn": "EOA_Apex_Source_Outage.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-FIRE-NOC", "title": "Fire NOC", "fn": "Fire_NOC_Apex_7.pdf", "exp": "2026-09-30", "low_conf": False},
                {"code": "DOC-LAND-DEED", "title": "Land Deed", "fn": "Land_Deed_Apex_7.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-BUILDING-PLAN", "title": "Approved Building Plan", "fn": "Building_Apex_7.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-AFFILIATION", "title": "University Affiliation Order", "fn": "Affiliation_Apex_7.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-TER-RECEIPT", "title": "TER Fee Receipt", "fn": "TER_Apex_7.pdf", "exp": None, "low_conf": False},
            ],
            "infra": False,
            "verify_scenario": "SOURCE_UNAVAILABLE"
        },
        # SCENARIO 8: Infrastructure evidence requiring physical inspection
        {
            "num": "AICTE-2025-APP-008",
            "inst": inst2,
            "category": "INCREASE_IN_INTAKE",
            "status": ApplicationStatus.UNDER_SCRUTINY,
            "title": "Infrastructure Discrepancy (Physical Inspection Required)",
            "risk": 65.0,
            "docs": [
                {"code": "DOC-EOA", "title": "Previous EoA Letter", "fn": "EOA_Vidya_8.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-FIRE-NOC", "title": "Fire NOC", "fn": "Fire_NOC_Vidya_8.pdf", "exp": "2026-11-20", "low_conf": False},
                {"code": "DOC-LAND-DEED", "title": "Land Deed", "fn": "Land_Vidya_8.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-BUILDING-PLAN", "title": "Building Plan", "fn": "Building_Vidya_8.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-AFFILIATION", "title": "Affiliation Order", "fn": "Affiliation_Vidya_8.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-TER-RECEIPT", "title": "TER Fee Receipt", "fn": "TER_Vidya_8.pdf", "exp": None, "low_conf": False},
            ],
            "infra": True,
            "infra_discrepancy": True,
            "verify_scenario": "NORMAL"
        },
        # SCENARIO 9: Corrected and resubmitted application (Version 2 with resolved deficiency)
        {
            "num": "AICTE-2025-APP-009",
            "inst": inst1,
            "category": "EXTENSION_OF_APPROVAL",
            "status": ApplicationStatus.RESUBMITTED,
            "title": "Rectified & Resubmitted Application (Version 2 - Clear Audit Trail)",
            "risk": 5.0,
            "docs": [
                {"code": "DOC-EOA", "title": "Previous EoA Letter", "fn": "EOA_Apex_9.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-FIRE-NOC", "title": "Fire Safety NOC (Renewed & Rectified)", "fn": "Fire_NOC_Apex_Renewed_V2.pdf", "exp": "2027-03-31", "low_conf": False, "is_rectified": True},
                {"code": "DOC-LAND-DEED", "title": "Land Deed", "fn": "Land_Apex_9.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-BUILDING-PLAN", "title": "Building Plan", "fn": "Building_Apex_9.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-AFFILIATION", "title": "Affiliation Order", "fn": "Affiliation_Apex_9.pdf", "exp": None, "low_conf": False},
                {"code": "DOC-TER-RECEIPT", "title": "TER Fee Receipt", "fn": "TER_Apex_9.pdf", "exp": None, "low_conf": False},
            ],
            "infra": True,
            "verify_scenario": "NORMAL"
        }
    ]

    saved_hashes = {}

    for s in scenarios_data:
        app = Application(
            application_number=s["num"],
            institution_id=s["inst"].id,
            category_code=s["category"],
            academic_year="2025-26",
            status=s["status"],
            submission_date=datetime.now(timezone.utc) - timedelta(days=2),
            rule_set_version="v2025.1",
            approved_programmes=[
                {"name": "Computer Science & Engineering", "intake": 120, "faculty_count": 8},
                {"name": "Artificial Intelligence & Data Science", "intake": 60, "faculty_count": 4},
                {"name": "Mechanical Engineering", "intake": 60, "faculty_count": 4}
            ],
            ter_payment_status="PAID",
            ter_transaction_ref=f"TXN-TER-{s['num'][-3:]}-9982",
            overall_risk_score=s["risk"],
            assigned_officer_id=user_officer.id,
            notes=s["title"]
        )
        db.add(app)
        db.flush()

        # Seed Documents and Versions
        for doc_info in s["docs"]:
            doc = Document(
                application_id=app.id,
                checklist_item_code=doc_info["code"],
                title=doc_info["title"],
                document_type="STATUTORY_CERTIFICATE",
                is_mandatory=True,
                status=DocumentStatus.VALIDATED if not doc_info.get("is_rectified") else DocumentStatus.RECTIFIED
            )
            db.add(doc)
            db.flush()

            # Create file in mock storage
            raw_content = f"Official Document: {doc_info['title']}\nApplication: {app.application_number}\nInstitution: {s['inst'].name}\nAICTE ID: {s['inst'].aicte_permanent_id}\nCode: {doc_info['code']}"
            
            # Handle duplicate hash test
            if doc_info.get("force_hash_of") and doc_info["force_hash_of"] in saved_hashes:
                storage_path, sha256_hash, mime_type, file_size = saved_hashes[doc_info["force_hash_of"]]
            else:
                storage_path, sha256_hash, mime_type, file_size = create_mock_doc(raw_content, doc_info["fn"])
                saved_hashes[doc_info["fn"]] = (storage_path, sha256_hash, mime_type, file_size)

            doc_version = DocumentVersion(
                document_id=doc.id,
                version_number=2 if doc_info.get("is_rectified") else 1,
                file_name=doc_info["fn"],
                file_size=file_size,
                mime_type=mime_type,
                sha256_hash=sha256_hash,
                storage_path=storage_path,
                uploaded_by_user_id=user_applicant.id,
                uploaded_at=datetime.now(timezone.utc) - timedelta(days=1),
                is_duplicate_detected=bool(doc_info.get("force_hash_of"))
            )
            db.add(doc_version)
            db.flush()

            doc.current_version_id = doc_version.id

            # Seed Extracted Fields with realistic metadata & bounding boxes
            is_low_conf = doc_info.get("low_conf", False)
            fields_data = [
                {
                    "field_name": "institution_name",
                    "original_value": s["inst"].name if not is_low_conf else f"{s['inst'].name[:15]}... (Illegible Blur)",
                    "conf": 0.45 if is_low_conf else 0.96,
                    "is_low": is_low_conf,
                    "bbox": [120, 85, 145, 520],
                    "excerpt": f"Issued to: {s['inst'].name}"
                },
                {
                    "field_name": "aicte_permanent_id",
                    "original_value": s["inst"].aicte_permanent_id,
                    "conf": 0.98,
                    "is_low": False,
                    "bbox": [155, 85, 175, 340],
                    "excerpt": f"AICTE Permanent ID: {s['inst'].aicte_permanent_id}"
                }
            ]

            if doc_info["code"] == "DOC-FIRE-NOC":
                exp_val = doc_info.get("exp") or "2026-12-31"
                fields_data.append({
                    "field_name": "valid_until_date",
                    "original_value": exp_val,
                    "conf": 0.93,
                    "is_low": False,
                    "bbox": [220, 110, 245, 340],
                    "excerpt": f"Valid up to: {exp_val}"
                })
            elif doc_info["code"] == "DOC-LAND-DEED":
                owner_title = doc_info.get("mismatch") or "Vidyapeeth Education Trust"
                fields_data.append({
                    "field_name": "title_holder_name",
                    "original_value": owner_title,
                    "conf": 0.94,
                    "is_low": False,
                    "bbox": [140, 90, 165, 420],
                    "excerpt": f"Executed in favour of: {owner_title}"
                })
                fields_data.append({
                    "field_name": "total_land_area",
                    "original_value": "7.5 Acres Contiguous",
                    "conf": 0.91,
                    "is_low": False,
                    "bbox": [345, 80, 370, 290],
                    "excerpt": "Total land area: 7.5 Acres Contiguous"
                })

            for f_spec in fields_data:
                field_obj = ExtractedField(
                    document_version_id=doc_version.id,
                    field_name=f_spec["field_name"],
                    original_value=f_spec["original_value"],
                    confidence_score=f_spec["conf"],
                    is_low_confidence=f_spec["is_low"],
                    page_number=1,
                    bounding_box=f_spec["bbox"],
                    raw_text_excerpt=f_spec["excerpt"],
                    extraction_method="ocr-layout-parser-v2"
                )
                db.add(field_obj)

            # Seed Source Verification Request for this document
            v_status = VerificationStatus.VERIFIED
            summary = "[SIMULATED DEMO] Authenticated via official National Depository adapter."
            if s["verify_scenario"] == "SOURCE_UNAVAILABLE":
                v_status = VerificationStatus.SOURCE_UNAVAILABLE
                summary = "[SIMULATED DEMO] Gateway timeout (504). External issuing source unavailable. Document flagged for non-blocking retry."
            elif s["verify_scenario"] == "EXPIRED" and doc_info["code"] == "DOC-FIRE-NOC":
                v_status = VerificationStatus.EXPIRED
                summary = "[SIMULATED DEMO] Authority verified record exists, but certificate validity date has expired."
            elif s["verify_scenario"] == "MISMATCH" and doc_info.get("mismatch"):
                v_status = VerificationStatus.MISMATCH_DETECTED
                summary = f"[SIMULATED DEMO] Registry mismatch: Deed owner '{doc_info['mismatch']}' does not match Trust ledger."

            v_req = VerificationRequest(
                application_id=app.id,
                document_version_id=doc_version.id,
                authority_type=AuthoritySourceType.DIGILOCKER if doc_info["code"] != "DOC-LAND-DEED" else AuthoritySourceType.LAND_REVENUE_PORTAL,
                request_reference=f"REQ-VERIFY-{app.id}-{doc.id}-DEMO",
                status=v_status,
                source_endpoint="https://api.digitallocker.gov.in/public/oauth2/1/pull/uri",
                matched_fields={"institution": s["inst"].name, "aicte_id": s["inst"].aicte_permanent_id},
                mismatched_fields={} if v_status != VerificationStatus.MISMATCH_DETECTED else {"title_holder": {"expected": "Vidyapeeth Education Trust", "observed": doc_info.get("mismatch")}},
                response_summary=summary,
                latency_ms=135 if v_status != VerificationStatus.SOURCE_UNAVAILABLE else 3400,
                simulated_demo=True
            )
            db.add(v_req)

        # Seed Infrastructure Evidence
        if s.get("infra"):
            is_flagged = bool(s.get("infra_discrepancy"))
            infra1 = InfrastructureEvidence(
                application_id=app.id,
                facility_type="COMPUTER_CENTER",
                caption="Main Computer Center & AI Engineering Laboratory",
                file_name="Lab_Photo_North_Wing.jpg",
                storage_path="./uploads/demo_lab_photo.jpg",
                reported_area_sqm=180.0,
                required_area_sqm=150.0,
                reported_equipment_count=90,
                cv_detected_count=42 if is_flagged else 88,
                cv_tags=["computer_monitors", "office_chairs", "server_rack", "networking_switch"] if not is_flagged else ["monitors_partial", "empty_tables", "under_construction"],
                geo_lat=18.5204,
                geo_long=73.8567,
                inspection_recommended=is_flagged,
                officer_comments="Computer Vision detected 42 active terminals vs reported 90. Physical verification inspection recommended." if is_flagged else "Adequate workstation density and network infrastructure visible."
            )
            infra2 = InfrastructureEvidence(
                application_id=app.id,
                facility_type="CENTRAL_LIBRARY",
                caption="Central Reading Hall & Digital Reference Stacks",
                file_name="Library_Hall.jpg",
                storage_path="./uploads/demo_library.jpg",
                reported_area_sqm=420.0,
                required_area_sqm=400.0,
                reported_equipment_count=120,
                cv_detected_count=118,
                cv_tags=["book_stacks", "reading_desks", "catalog_terminal"],
                geo_lat=18.5205,
                geo_long=73.8569,
                inspection_recommended=False,
                officer_comments="Complies with prescribed seating and reading volume requirements."
            )
            db.add(infra1)
            db.add(infra2)

        # Seed ValidationRun & Evidence-Linked Findings
        val_run = ValidationRun(
            application_id=app.id,
            rule_set_version="v2025.1",
            triggered_by_user_id=user_applicant.id,
            total_rules_evaluated=12,
            findings_count=0,
            status="SUCCESS",
            run_at=datetime.now(timezone.utc) - timedelta(days=1)
        )
        db.add(val_run)
        db.flush()

        # Generate scenario-specific findings
        findings_list = []
        if s["num"] == "AICTE-2025-APP-002":  # Missing building plan
            findings_list.append(Finding(
                validation_run_id=val_run.id,
                application_id=app.id,
                document_version_id=None,
                rule_code="RULE-MANDATORY-DOC-01",
                category="MISSING_DOCUMENT",
                severity=FindingSeverity.CRITICAL,
                explanation="Mandatory requirement missing: Approved Building & Architectural Plan (DOC-BUILDING-PLAN) was not submitted.",
                expected_value="Municipal sanctioned building floor plan document",
                observed_value="Not uploaded",
                rule_citation="AICTE APH 2025-26, Checklist Item DOC-BUILDING-PLAN",
                detection_method="deterministic-checklist-verifier",
                confidence_score=1.0,
                status=FindingStatus.OPEN
            ))
        elif s["num"] == "AICTE-2025-APP-003":  # Expired fire noc
            doc_v = db.query(DocumentVersion).join(Document).filter(Document.application_id == app.id, Document.checklist_item_code == "DOC-FIRE-NOC").first()
            findings_list.append(Finding(
                validation_run_id=val_run.id,
                application_id=app.id,
                document_version_id=doc_v.id if doc_v else None,
                rule_code="RULE-FIRE-EXP-02",
                category="EXPIRY",
                severity=FindingSeverity.CRITICAL,
                explanation="Fire Safety Certificate expired on 31-Mar-2024. A valid, unexpired certificate covering academic session 2025-26 is mandatory.",
                expected_value="Valid through at least 30-Jun-2026",
                observed_value="2024-03-31",
                rule_citation="AICTE APH 2025-26, Chapter I, Clause 4.8",
                page_number=1,
                bounding_box=[220, 110, 245, 340],
                excerpt="This certificate is valid up to: 2024-03-31",
                detection_method="deterministic-date-comparator",
                confidence_score=1.0,
                status=FindingStatus.OPEN
            ))
        elif s["num"] == "AICTE-2025-APP-004":  # Mismatch land deed
            doc_v = db.query(DocumentVersion).join(Document).filter(Document.application_id == app.id, Document.checklist_item_code == "DOC-LAND-DEED").first()
            findings_list.append(Finding(
                validation_run_id=val_run.id,
                application_id=app.id,
                document_version_id=doc_v.id if doc_v else None,
                rule_code="RULE-LAND-TIT-03",
                category="CROSS_DOCUMENT_MISMATCH",
                severity=FindingSeverity.CRITICAL,
                explanation="Registered Land Deed title holder ('Shree Balaji Commercial Developers Ltd') does not match the sponsoring Trust/Society ('Vidyapeeth Education Trust').",
                expected_value="Vidyapeeth Education Trust",
                observed_value="Shree Balaji Commercial Developers Ltd",
                rule_citation="AICTE APH 2025-26, Chapter I, Clause 3.4",
                page_number=1,
                bounding_box=[140, 90, 165, 420],
                excerpt="Executed in favour of: Shree Balaji Commercial Developers Ltd",
                detection_method="deterministic-entity-matching",
                confidence_score=1.0,
                status=FindingStatus.OPEN
            ))
        elif s["num"] == "AICTE-2025-APP-005":  # Duplicate hash
            doc_v = db.query(DocumentVersion).join(Document).filter(Document.application_id == app.id, Document.checklist_item_code == "DOC-EOA").first()
            findings_list.append(Finding(
                validation_run_id=val_run.id,
                application_id=app.id,
                document_version_id=doc_v.id if doc_v else None,
                rule_code="RULE-DUPLICATE-HASH-01",
                category="DUPLICATE_ANOMALY",
                severity=FindingSeverity.CRITICAL,
                explanation="Exact Cryptographic Duplicate: The uploaded document has an identical SHA-256 hash to a document submitted in Application AICTE-2025-APP-001 by Apex Institute.",
                expected_value="Distinct genuine institutional document for Shree Vidya Engineering College",
                observed_value=f"Identical hash collision: {doc_v.sha256_hash[:16]}..." if doc_v else "Match found",
                rule_citation="AICTE APH 2025-26, Chapter II, Clause 5.1",
                detection_method="sha256-cryptographic-hash-matcher",
                confidence_score=1.0,
                status=FindingStatus.OPEN
            ))
        elif s["num"] == "AICTE-2025-APP-006":  # Low confidence OCR
            doc_v = db.query(DocumentVersion).join(Document).filter(Document.application_id == app.id, Document.checklist_item_code == "DOC-EOA").first()
            findings_list.append(Finding(
                validation_run_id=val_run.id,
                application_id=app.id,
                document_version_id=doc_v.id if doc_v else None,
                rule_code="RULE-EXTRACTION-CONF-01",
                category="EXTRACTION_UNCERTAINTY",
                severity=FindingSeverity.MINOR,
                explanation="Low OCR confidence (45%) on field 'institution_name' due to image blur/scan artifacts. Manual scrutiny or applicant correction recommended.",
                expected_value="Legible text >70% confidence",
                observed_value="Bharatiya Poly... (Illegible Blur)",
                rule_citation="AICTE Scrutiny Digitization Manual 2025, Section 3.1",
                page_number=1,
                bounding_box=[120, 85, 145, 520],
                excerpt="Issued to: Bharatiya Poly... (Illegible Blur)",
                detection_method="ocr-layout-parser-v2",
                confidence_score=0.45,
                status=FindingStatus.OPEN
            ))
        elif s["num"] == "AICTE-2025-APP-008":  # Infrastructure discrepancy
            findings_list.append(Finding(
                validation_run_id=val_run.id,
                application_id=app.id,
                document_version_id=None,
                rule_code="RULE-INFRA-CV-01",
                category="INFRASTRUCTURE_ANOMALY",
                severity=FindingSeverity.MAJOR,
                explanation="Visible Equipment Deficit: Computer Vision object detection identified 42 computer workstations, which is below the 90 reported terminals. Physical inspection may be required.",
                expected_value="90 functional workstations configured",
                observed_value="42 workstations detected via CV",
                rule_citation="AICTE APH 2025-26, Chapter VII, Norms for Computer Center",
                detection_method="computer-vision-object-detector",
                confidence_score=0.89,
                status=FindingStatus.OPEN
            ))
        elif s["num"] == "AICTE-2025-APP-009":  # Rectified
            doc_v = db.query(DocumentVersion).join(Document).filter(Document.application_id == app.id, Document.checklist_item_code == "DOC-FIRE-NOC").first()
            findings_list.append(Finding(
                validation_run_id=val_run.id,
                application_id=app.id,
                document_version_id=doc_v.id if doc_v else None,
                rule_code="RULE-FIRE-EXP-02",
                category="EXPIRY",
                severity=FindingSeverity.CRITICAL,
                explanation="Previous Fire NOC was expired. Applicant has uploaded Version 2 (Renewed Fire Safety Certificate valid until 31-Mar-2027). Deficiency resolved.",
                expected_value="Valid certificate submitted",
                observed_value="2027-03-31 (Valid)",
                rule_citation="AICTE APH 2025-26, Chapter I, Clause 4.8",
                detection_method="deterministic-date-comparator",
                confidence_score=1.0,
                status=FindingStatus.RECTIFIED_BY_APPLICANT,
                officer_notes="Applicant uploaded valid renewed certificate on 22-Oct-2026. Scrutiny verified."
            ))

        for f in findings_list:
            db.add(f)
        val_run.findings_count = len(findings_list)
        if any(f.severity == FindingSeverity.CRITICAL for f in findings_list):
            val_run.status = "ERRORS_FOUND"
        elif findings_list:
            val_run.status = "WARNINGS_FOUND"
        else:
            val_run.status = "SUCCESS"

        db.flush()

        # Seed initial audit log for application creation
        audit_service.log_event(
            db=db,
            event_type="APPLICATION_SUBMISSION",
            actor_username="applicant",
            actor_role="applicant",
            entity_type="Application",
            entity_id=app.application_number,
            action=f"Created and submitted application {app.application_number} ({s['title']})",
            details={"institution_id": s["inst"].id, "category": s["category"], "academic_year": "2025-26"},
            actor_user_id=user_applicant.id
        )

    # 6. Seed In-App Notifications for Demonstration
    sample_notifications = [
        Notification(
            target_role="applicant",
            title="Action Required: Expired Certificate Detected",
            message="Your Fire Safety NOC in Application AICTE-2025-APP-003 expired on 31-Mar-2024. Please upload renewed certificate.",
            type="EXPIRING_DOC",
            link_url="/applications/3",
            created_at=datetime.now(timezone.utc) - timedelta(hours=2)
        ),
        Notification(
            target_role="applicant",
            title="Clarification Requested by Scrutiny Officer",
            message="Officer Er. Anand Mohan Verma has requested clarification regarding structural floor plan for AICTE-2025-APP-004.",
            type="CLARIFICATION",
            link_url="/applications/4",
            created_at=datetime.now(timezone.utc) - timedelta(hours=5)
        ),
        Notification(
            target_role="scrutiny_officer",
            title="Newly Assigned Scrutiny Application",
            message="Application AICTE-2025-APP-001 (Apex Institute) has been assigned to your scrutiny queue.",
            type="NEW_ASSIGNMENT",
            link_url="/applications/1",
            created_at=datetime.now(timezone.utc) - timedelta(hours=1)
        ),
        Notification(
            target_role="scrutiny_officer",
            title="Physical Inspection Flagged on Computer Lab",
            message="Computer Vision detected 42 active terminals vs reported 90 on Application AICTE-2025-APP-008.",
            type="INSPECTION_FLAG",
            link_url="/infrastructure",
            created_at=datetime.now(timezone.utc) - timedelta(hours=6)
        ),
        Notification(
            target_role="admin",
            title="Issuing Authority Source Outage Alert",
            message="DigiLocker gateway returned 504 Gateway Timeout on recent pull requests. Non-blocking retry active.",
            type="SOURCE_FAILURE",
            link_url="/verification",
            created_at=datetime.now(timezone.utc) - timedelta(hours=3)
        ),
    ]
    for notif in sample_notifications:
        db.add(notif)

    db.commit()
    print("--- Database seeding complete: 5 demo accounts & 9 scenarios loaded successfully ---")
