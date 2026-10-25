export type UserRole =
  | "applicant"
  | "scrutiny_officer"
  | "supervising_authority"
  | "admin"
  | "auditor";

export interface NavItemConfig {
  label: string;
  href: string;
  iconName: string;
  badge?: string;
}

export interface RoleConfig {
  name: string;
  badge: string;
  home: string;
  allowedPrefixes: string[];
  navItems: NavItemConfig[];
  welcomeTitle: string;
  welcomeDescription: string;
}

export const ROLE_ROUTES: Record<UserRole, RoleConfig> = {
  applicant: {
    name: "Institution Applicant",
    badge: "Applicant",
    home: "/institution/dashboard",
    allowedPrefixes: [
      "/institution/dashboard",
      "/institution/profile",
      "/institution/applications/new",
      "/applications",
      "/findings",
      "/clarifications",
      "/verification",
      "/infrastructure",
      "/colleges",
      "/verify",
    ],
    navItems: [
      { label: "Dashboard", href: "/institution/dashboard", iconName: "LayoutDashboard" },
      { label: "Synthetic Colleges", href: "/colleges", iconName: "GraduationCap", badge: "12" },
      { label: "AI Verification Studio", href: "/verify", iconName: "FileSearch", badge: "AI" },
      { label: "Institution Profile", href: "/institution/profile", iconName: "Building2" },
      { label: "New Application", href: "/institution/applications/new", iconName: "PlusCircle" },
      { label: "My Applications", href: "/applications", iconName: "FileText" },
      { label: "Compliance Findings", href: "/findings", iconName: "AlertTriangle" },
      { label: "Clarifications", href: "/clarifications", iconName: "MessageSquare" },
      { label: "Verification Status", href: "/verification", iconName: "CheckCircle2" },
      { label: "Infrastructure Evidence", href: "/infrastructure", iconName: "Landmark" },
    ],
    welcomeTitle: "Apex Institute of Technology & Science Portal",
    welcomeDescription: "Manage statutory approval dossiers, upload verified documents, and rectify compliance observations.",
  },
  scrutiny_officer: {
    name: "Senior Scrutiny Officer",
    badge: "Scrutiny Officer",
    home: "/officer/queue",
    allowedPrefixes: [
      "/officer/queue",
      "/applications",
      "/review",
      "/findings",
      "/verification",
      "/infrastructure",
      "/clarifications",
      "/analytics",
      "/audit",
      "/colleges",
      "/verify",
    ],
    navItems: [
      { label: "Scrutiny Queue", href: "/officer/queue", iconName: "ListFilter" },
      { label: "Synthetic Colleges", href: "/colleges", iconName: "GraduationCap", badge: "12" },
      { label: "AI Verification Studio", href: "/verify", iconName: "FileSearch", badge: "AI" },
      { label: "All Applications", href: "/applications", iconName: "FileText" },
      { label: "Review Workspace", href: "/review", iconName: "FileCheck2" },
      { label: "Findings & Dispositions", href: "/findings", iconName: "AlertTriangle" },
      { label: "Source Verification", href: "/verification", iconName: "CheckCircle2" },
      { label: "Infrastructure Review", href: "/infrastructure", iconName: "Server" },
      { label: "Clarifications", href: "/clarifications", iconName: "MessageSquare" },
      { label: "Analytics Overview", href: "/analytics", iconName: "BarChart3" },
      { label: "Audit Ledger", href: "/audit", iconName: "History" },
    ],
    welcomeTitle: "Technical Scrutiny Division — Review Desk",
    welcomeDescription: "Examine institutional evidence dossiers, evaluate extracted bounding boxes, and confirm compliance observations.",
  },
  supervising_authority: {
    name: "Competent Supervising Authority",
    badge: "Supervising Authority",
    home: "/analytics",
    allowedPrefixes: [
      "/analytics",
      "/applications",
      "/officer/queue",
      "/findings",
      "/clarifications",
      "/verification",
      "/infrastructure",
      "/admin/rules",
      "/admin/users",
      "/audit",
      "/colleges",
      "/verify",
    ],
    navItems: [
      { label: "Executive Analytics", href: "/analytics", iconName: "BarChart3" },
      { label: "Synthetic Colleges", href: "/colleges", iconName: "GraduationCap", badge: "12" },
      { label: "AI Verification Studio", href: "/verify", iconName: "FileSearch", badge: "AI" },
      { label: "Institutional Applications", href: "/applications", iconName: "FileText" },
      { label: "Escalated Queue", href: "/officer/queue", iconName: "ShieldAlert" },
      { label: "Compliance Findings", href: "/findings", iconName: "AlertTriangle" },
      { label: "Regulatory Rules", href: "/admin/rules", iconName: "Sliders" },
      { label: "Authorized Users", href: "/admin/users", iconName: "Users" },
      { label: "Statutory Audit Ledger", href: "/audit", iconName: "History" },
    ],
    welcomeTitle: "AICTE Statutory Regulation Bureau",
    welcomeDescription: "Review escalated scrutiny recommendations and issue authoritative approval, deficiency, or inspection orders.",
  },
  admin: {
    name: "System Administrator",
    badge: "Administrator",
    home: "/admin/users",
    allowedPrefixes: [
      "/admin/users",
      "/admin/rules",
      "/admin/settings",
      "/analytics",
      "/audit",
      "/colleges",
      "/verify",
    ],
    navItems: [
      { label: "User Management", href: "/admin/users", iconName: "Users" },
      { label: "Synthetic Colleges", href: "/colleges", iconName: "GraduationCap", badge: "12" },
      { label: "AI Verification Studio", href: "/verify", iconName: "FileSearch", badge: "AI" },
      { label: "Rules & Checklists", href: "/admin/rules", iconName: "Sliders" },
      { label: "System Settings", href: "/admin/settings", iconName: "Settings" },
      { label: "System Analytics", href: "/analytics", iconName: "BarChart3" },
      { label: "Audit Ledger", href: "/audit", iconName: "History" },
    ],
    welcomeTitle: "National Informatics & Infrastructure Administration",
    welcomeDescription: "Manage institutional user accounts, APH compliance rule engines, system parameters, and infrastructure health.",
  },
  auditor: {
    name: "Statutory Regulatory Auditor",
    badge: "Auditor",
    home: "/audit",
    allowedPrefixes: [
      "/audit",
      "/analytics",
      "/applications",
      "/colleges",
      "/verify",
    ],
    navItems: [
      { label: "Audit Ledger", href: "/audit", iconName: "History" },
      { label: "Synthetic Colleges", href: "/colleges", iconName: "GraduationCap", badge: "12" },
      { label: "AI Verification Studio", href: "/verify", iconName: "FileSearch", badge: "AI" },
      { label: "Compliance Analytics", href: "/analytics", iconName: "BarChart3" },
    ],
    welcomeTitle: "Independent Regulatory Oversight Desk",
    welcomeDescription: "Inspect tamper-evident SHA-256 cryptographic ledgers, verify provenance chains, and export oversight reports.",
  },
};

export function getRoleHome(role?: string | null): string {
  if (!role || !(role in ROLE_ROUTES)) {
    return "/login";
  }
  return ROLE_ROUTES[role as UserRole].home;
}

export function isRouteAllowedForRole(role: string, pathname: string): boolean {
  if (!role || !(role in ROLE_ROUTES)) {
    return false;
  }
  const config = ROLE_ROUTES[role as UserRole];
  // Check if pathname starts with any allowed prefix
  return config.allowedPrefixes.some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}
