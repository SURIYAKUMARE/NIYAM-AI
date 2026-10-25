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
  },
  officer: {
    id: 2,
    username: "officer",
    email: "officer.scrutiny@aicte-india.org",
    full_name: "Er. Anand Mohan Verma",
    role: "scrutiny_officer",
    designation: "Senior Scrutiny Officer",
    mfa_enrolled: true,
  },
  authority: {
    id: 3,
    username: "authority",
    email: "authority.bureau@aicte-india.org",
    full_name: "Prof. (Dr.) Sudhir K. Sen",
    role: "supervising_authority",
    designation: "Bureau Head & Supervising Authority",
    mfa_enrolled: true,
  },
};

SEEDED_USERS["officer_rajesh"] = SEEDED_USERS.officer;
SEEDED_USERS["authority_sharma"] = SEEDED_USERS.authority;
SEEDED_USERS["admin_super"] = SEEDED_USERS.admin;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body.mfa_session_token || "";
    const code = (body.code || "").trim();

    // Parse username from session token: e.g. "mfa_sess_officer_12345"
    let matchedUsername = "admin";
    if (token.includes("officer")) matchedUsername = "officer";
    else if (token.includes("authority")) matchedUsername = "authority";
    else if (token.includes("admin")) matchedUsername = "admin";

    const userRecord = SEEDED_USERS[matchedUsername] || SEEDED_USERS.admin;

    // Validate code: must be 6 digits or recovery code
    if (!code || (code.length !== 6 && !code.startsWith("REC-"))) {
      return NextResponse.json(
        { detail: "Invalid MFA verification code or expired session. Demo PIN is: 123456" },
        { status: 400 }
      );
    }

    const accessToken = `jwt_aicte_${userRecord.username}_${Date.now()}`;

    return NextResponse.json({
      access_token: accessToken,
      token_type: "bearer",
      user: {
        id: userRecord.id,
        username: userRecord.username,
        email: userRecord.email,
        full_name: userRecord.full_name,
        role: userRecord.role,
        designation: userRecord.designation,
        institution_id: null,
        institution_name: null,
        mfa_enrolled: true,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "MFA validation service unavailable" },
      { status: 500 }
    );
  }
}
