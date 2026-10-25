import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SEEDED_USERS: Record<string, any> = {
  admin: {
    id: 4,
    username: "admin",
    email: "admin.sys@aicte-india.org",
    full_name: "Vikramjit Singh",
    role: "admin",
    designation: "Director IT & Infrastructure Administration",
    mfa_enrolled: true,
    mfa_required: true,
  },
  officer: {
    id: 2,
    username: "officer",
    email: "officer.scrutiny@aicte-india.org",
    full_name: "Er. Anand Mohan Verma",
    role: "scrutiny_officer",
    designation: "Senior Scrutiny Officer",
    mfa_enrolled: true,
    mfa_required: true,
  },
  authority: {
    id: 3,
    username: "authority",
    email: "authority.bureau@aicte-india.org",
    full_name: "Prof. (Dr.) Sudhir K. Sen",
    role: "supervising_authority",
    designation: "Bureau Head & Supervising Authority",
    mfa_enrolled: true,
    mfa_required: true,
  },
  applicant: {
    id: 1,
    username: "applicant",
    email: "applicant@apexinstitute.edu.in",
    full_name: "Dr. Rajeshwari Sharma",
    role: "applicant",
    designation: "Principal & Authorized Signatory",
    institution_id: 101,
    institution_name: "Apex Institute of Technology & Science",
    mfa_enrolled: false,
    mfa_required: false,
  },
  auditor: {
    id: 5,
    username: "auditor",
    email: "auditor.ext@cag-oversight.gov.in",
    full_name: "Smt. Meenakshi Iyer",
    role: "auditor",
    designation: "Senior Comptroller & Regulatory Auditor",
    mfa_enrolled: false,
    mfa_required: false,
  },
};

// Aliases for convenience
SEEDED_USERS["officer_rajesh"] = SEEDED_USERS.officer;
SEEDED_USERS["applicant_apex"] = SEEDED_USERS.applicant;
SEEDED_USERS["authority_sharma"] = SEEDED_USERS.authority;
SEEDED_USERS["admin_super"] = SEEDED_USERS.admin;
SEEDED_USERS["auditor_verma"] = SEEDED_USERS.auditor;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = (body.username || "").trim().toLowerCase();
    const password = body.password || "";

    const userRecord = SEEDED_USERS[username];

    // Check credentials (password123 for all seeded demo accounts)
    if (!userRecord || (password !== "password123" && password !== "admin123")) {
      return NextResponse.json(
        { detail: "Incorrect username or password. Demo password is: password123" },
        { status: 401 }
      );
    }

    // If official role, challenge with MFA
    if (userRecord.mfa_required) {
      const mfaSessionToken = `mfa_sess_${userRecord.username}_${Date.now()}`;
      return NextResponse.json({
        access_token: null,
        token_type: "bearer",
        mfa_required: true,
        mfa_session_token: mfaSessionToken,
        user: {
          id: userRecord.id,
          username: userRecord.username,
          email: userRecord.email,
          full_name: userRecord.full_name,
          role: userRecord.role,
          designation: userRecord.designation,
          institution_id: userRecord.institution_id || null,
          institution_name: userRecord.institution_name || null,
          mfa_enrolled: true,
        },
      });
    }

    // Direct access for applicant and auditor
    const accessToken = `jwt_aicte_${userRecord.username}_${Date.now()}`;
    return NextResponse.json({
      access_token: accessToken,
      token_type: "bearer",
      mfa_required: false,
      user: {
        id: userRecord.id,
        username: userRecord.username,
        email: userRecord.email,
        full_name: userRecord.full_name,
        role: userRecord.role,
        designation: userRecord.designation,
        institution_id: userRecord.institution_id || null,
        institution_name: userRecord.institution_name || null,
        mfa_enrolled: false,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Authentication service unavailable" },
      { status: 500 }
    );
  }
}
