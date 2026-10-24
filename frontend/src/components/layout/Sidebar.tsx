"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  ShieldAlert,
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
  FileCheck2,
  HelpCircle,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  // Applicant Items
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

  // Scrutiny Officer Items
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

  // Supervising Authority Items
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
    badge: "Decisions",
  },
  {
    title: "Source Verification Dossiers",
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

  // Admin Items
  {
    title: "Regulatory Rules Engine",
    href: "/admin/rules",
    icon: Sliders,
    roles: ["admin"],
  },
  {
    title: "User & Permissions Admin",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "System & Integration Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
  },
  {
    title: "Audit History",
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

  // Auditor Items
  {
    title: "Tamper-Evident Audit Ledger",
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
];

interface SidebarProps {
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobileMenu }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const currentRole = user?.role || "scrutiny_officer";

  const allowedNav = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="no-print bg-white border-r border-[#E3E8EE] flex flex-col h-full select-none shrink-0 w-64">
      {/* Compact Brand / Role Area */}
      <div className="p-4 border-b border-[#E3E8EE] flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-[#5B6B7A] uppercase tracking-wider">
            Workspace
          </div>
          <div className="text-xs text-[#14202B] font-bold capitalize mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0F6B6B]" />
            <span>{currentRole.replace(/_/g, " ")}</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {allowedNav.map((item) => {
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#0F6B6B] text-white shadow-sm"
                  : "text-[#14202B] hover:bg-[#F7F9FB] hover:text-[#0F6B6B]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-white" : "text-[#5B6B7A]"
                  }`}
                />
                <span className="truncate">{item.title}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
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
      </nav>

      {/* Bottom Session / Status Area */}
      <div className="p-3 border-t border-[#E3E8EE] space-y-2.5 bg-[#F7F9FB]/60">
        {user && (
          <div className="p-2.5 rounded-lg bg-white border border-[#E3E8EE] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0F6B6B] text-white text-xs font-bold flex items-center justify-center shrink-0">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#14202B] truncate">{user.username}</p>
                <p className="text-[10px] text-[#5B6B7A] truncate capitalize">{user.role.replace(/_/g, " ")}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 rounded text-[#5B6B7A] hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Advisory Legal Footnote */}
        <div className="p-2.5 rounded-lg bg-[#F7F9FB] border border-[#E3E8EE] text-[10px] text-[#5B6B7A] leading-relaxed">
          <p className="font-semibold text-[#14202B] mb-0.5">Statutory Decision Support</p>
          AI advisory findings assist review. Final approval decisions remain with competent AICTE authorities.
        </div>
      </div>
    </aside>
  );
};
