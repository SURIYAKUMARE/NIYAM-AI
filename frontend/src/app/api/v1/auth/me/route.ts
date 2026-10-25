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
  },
  auditor: {
    id: 5,
    username: "auditor",
    email: "auditor.ext@cag-oversight.gov.in",
    full_name: "Smt. Meenakshi Iyer",
    role: "auditor",
    designation: "Senior Comptroller & Regulatory Auditor",
    mfa_enrolled: false,
  },
};

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  let matchedUser = SEEDED_USERS.admin;

  for (const [key, user] of Object.entries(SEEDED_USERS)) {
    if (token.includes(key)) {
      matchedUser = user;
      break;
    }
  }

  return NextResponse.json(matchedUser);
}
