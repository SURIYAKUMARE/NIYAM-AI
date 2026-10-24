"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  SearchCode,
  Building,
  Sliders,
  History,
  BarChart3,
  Settings,
  Layers,
  Inbox,
  Users,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
}

interface NavSection {
  title: string;
  roles: string[];
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  // APPLICANT SECTIONS
  {
    title: "Institutional Workspace",
    roles: ["applicant"],
    items: [
      {
        title: "Overview",
        href: "/institution/dashboard",
        icon: LayoutDashboard,
        roles: ["applicant"],
      },
      {
        title: "New Application",
        href: "/institution/applications/new",
        icon: PlusCircle,
        roles: ["applicant"],
      },
      {
        title: "Applications Dossier",
        href: "/applications",
        icon: FileText,
        roles: ["applicant"],
      },
    ],
  },
  {
    title: "Regulatory Dialogue",
    roles: ["applicant"],
    items: [
      {
        title: "Clarifications & Queries",
        href: "/clarifications",
        icon: Inbox,
        roles: ["applicant"],
      },
      {
        title: "Institution Profile",
        href: "/institution/profile",
        icon: Building,
        roles: ["applicant"],
      },
    ],
  },

  // SCRUTINY OFFICER SECTIONS
  {
    title: "Scrutiny Workflow",
    roles: ["scrutiny_officer"],
    items: [
      {
        title: "Review Queue",
        href: "/officer/queue",
        icon: Layers,
        roles: ["scrutiny_officer"],
        badge: "Active",
      },
      {
        title: "All Applications",
        href: "/applications",
        icon: FileText,
        roles: ["scrutiny_officer"],
      },
    ],
  },
  {
    title: "Evidence & Sources",
    roles: ["scrutiny_officer"],
    items: [
      {
        title: "Source Verification",
        href: "/verification",
        icon: SearchCode,
        roles: ["scrutiny_officer"],
      },
      {
        title: "Clarification Requests",
        href: "/clarifications",
        icon: Inbox,
        roles: ["scrutiny_officer"],
      },
    ],
  },
  {
    title: "Rules & Audit",
    roles: ["scrutiny_officer"],
    items: [
      {
        title: "Regulatory Rules",
        href: "/admin/rules",
        icon: Sliders,
        roles: ["scrutiny_officer"],
      },
      {
        title: "Audit History",
        href: "/audit",
        icon: History,
        roles: ["scrutiny_officer"],
      },
    ],
  },

  // SUPERVISING AUTHORITY SECTIONS
  {
    title: "Executive Oversight",
    roles: ["supervising_authority"],
    items: [
      {
        title: "Authority Dashboard",
        href: "/authority/dashboard",
        icon: LayoutDashboard,
        roles: ["supervising_authority"],
      },
      {
        title: "Review & Decision Queue",
        href: "/officer/queue",
        icon: Layers,
        roles: ["supervising_authority"],
        badge: "Statutory",
      },
    ],
  },
  {
    title: "Verification & Analytics",
    roles: ["supervising_authority"],
    items: [
      {
        title: "Source Verifications",
        href: "/verification",
        icon: SearchCode,
        roles: ["supervising_authority"],
      },
      {
        title: "Compliance Analytics",
        href: "/analytics",
        icon: BarChart3,
        roles: ["supervising_authority"],
      },
      {
        title: "Audit Ledger",
        href: "/audit",
        icon: History,
        roles: ["supervising_authority"],
      },
    ],
  },

  // ADMIN SECTIONS
  {
    title: "Administration",
    roles: ["admin"],
    items: [
      {
        title: "Rules Engine",
        href: "/admin/rules",
        icon: Sliders,
        roles: ["admin"],
      },
      {
        title: "User Management",
        href: "/admin/users",
        icon: Users,
        roles: ["admin"],
      },
      {
        title: "System Settings",
        href: "/admin/settings",
        icon: Settings,
        roles: ["admin"],
      },
    ],
  },
  {
    title: "Oversight & Views",
    roles: ["admin"],
    items: [
      {
        title: "Audit Ledger",
        href: "/audit",
        icon: History,
        roles: ["admin"],
      },
      {
        title: "Applicant View",
        href: "/institution/dashboard",
        icon: LayoutDashboard,
        roles: ["admin"],
      },
    ],
  },

  // AUDITOR SECTIONS
  {
    title: "Cryptographic Audit",
    roles: ["auditor"],
    items: [
      {
        title: "Tamper-Evident Ledger",
        href: "/audit",
        icon: History,
        roles: ["auditor"],
        badge: "SHA-256",
      },
      {
        title: "Verification Logs",
        href: "/verification",
        icon: SearchCode,
        roles: ["auditor"],
      },
      {
        title: "Compliance Overview",
        href: "/analytics",
        icon: BarChart3,
        roles: ["auditor"],
      },
    ],
  },
];

interface SidebarProps {
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobileMenu }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const currentRole = user?.role || "scrutiny_officer";

  // Filter sections visible to current role
  const allowedSections = NAV_SECTIONS.filter((sec) =>
    sec.roles.includes(currentRole)
  );

  return (
    <aside className="no-print bg-white border-r border-[#E3E8EE] flex flex-col h-full select-none shrink-0 w-64 shadow-xs">
      {/* Workspace Banner */}
      <div className="px-5 py-4 border-b border-[#E3E8EE] flex items-center justify-between bg-[#F7F9FB]/50">
        <div>
          <div className="text-[10px] font-extrabold text-[#5B6B7A] uppercase tracking-wider">
            Active Workspace
          </div>
          <div className="text-xs text-[#14202B] font-bold capitalize mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F6B6B] ring-2 ring-teal-200" />
            <span className="truncate">{currentRole.replace(/_/g, " ")}</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-[#0F6B6B] border border-[#E3E8EE]">
          APH 2025
        </span>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {allowedSections.map((section, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5B6B7A]/80">
              {section.title}
            </div>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" &&
                    pathname.startsWith(item.href) &&
                    item.href !== "/applications");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobileMenu}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#0F6B6B] text-white shadow-xs"
                        : "text-[#14202B] hover:bg-[#F7F9FB] hover:text-[#0F6B6B]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-white" : "text-[#5B6B7A]"
                        }`}
                      />
                      <span className="truncate">{item.title}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-teal-50 text-[#0F6B6B] border border-teal-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Session & Statutory Legal Advisory Footer */}
      <div className="p-3 border-t border-[#E3E8EE] space-y-2.5 bg-[#F7F9FB]/60">
        {user && (
          <div className="p-2.5 rounded-xl bg-white border border-[#E3E8EE] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0F6B6B] text-white text-xs font-bold flex items-center justify-center shrink-0">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#14202B] truncate">{user.username}</p>
                <p className="text-[10px] text-[#5B6B7A] truncate capitalize font-medium">
                  {user.role.replace(/_/g, " ")}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#5B6B7A] hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Advisory Legal Footnote */}
        <div className="p-2.5 rounded-xl bg-[#F7F9FB] border border-[#E3E8EE] text-[10px] text-[#5B6B7A] leading-relaxed">
          <p className="font-bold text-[#14202B] mb-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#0F6B6B]" />
            <span>Statutory Decision Support</span>
          </p>
          AI advisory findings assist review. Final statutory approval decisions remain with competent AICTE authorities.
        </div>
      </div>
    </aside>
  );
};
