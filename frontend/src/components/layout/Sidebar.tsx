"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckSquare,
  ShieldAlert,
  SearchCode,
  Building,
  Sliders,
  History,
  BarChart3,
  Settings,
  Layers,
  Inbox,
  Users
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  // Common / Applicant
  {
    title: "Institution Dashboard",
    href: "/institution/dashboard",
    icon: LayoutDashboard,
    roles: ["applicant"],
  },
  {
    title: "New Application Wizard",
    href: "/institution/applications/new",
    icon: PlusCircle,
    roles: ["applicant"],
  },
  {
    title: "My Applications",
    href: "/applications",
    icon: FileText,
    roles: ["applicant"],
  },

  // Officer Queue & Scrutiny
  {
    title: "Officer Review Queue",
    href: "/officer/queue",
    icon: Inbox,
    roles: ["scrutiny_officer", "supervising_authority"],
    badge: "Active",
  },
  {
    title: "All Applications",
    href: "/applications",
    icon: Layers,
    roles: ["scrutiny_officer", "supervising_authority", "admin", "auditor"],
  },
  {
    title: "Document Review",
    href: "/review",
    icon: SearchCode,
    roles: ["scrutiny_officer", "supervising_authority"],
  },
  {
    title: "Compliance & Rectification",
    href: "/findings",
    icon: ShieldAlert,
    roles: ["applicant", "scrutiny_officer", "supervising_authority"],
  },
  {
    title: "Verification Queue & Sources",
    href: "/verification",
    icon: CheckSquare,
    roles: ["applicant", "scrutiny_officer", "supervising_authority", "admin", "auditor"],
  },
  {
    title: "Infrastructure Evidence",
    href: "/infrastructure",
    icon: Building,
    roles: ["applicant", "scrutiny_officer", "supervising_authority"],
  },

  // Authority & Admin
  {
    title: "Operational Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["scrutiny_officer", "supervising_authority", "admin", "auditor"],
  },
  {
    title: "Rule & Checklist Admin",
    href: "/admin/rules",
    icon: Sliders,
    roles: ["admin", "supervising_authority"],
  },
  {
    title: "Audit History",
    href: "/audit",
    icon: History,
    roles: ["auditor", "admin", "supervising_authority", "scrutiny_officer"],
  },
  {
    title: "User & Permissions Admin",
    href: "/admin/users",
    icon: Users,
    roles: ["admin", "supervising_authority"],
  },
  {
    title: "System & Integration Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const currentRole = user?.role || "scrutiny_officer";

  const allowedNav = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-850 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-navy-850">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace Navigation
        </div>
        <div className="text-xs text-slate-300 font-medium capitalize mt-0.5">
          {currentRole.replace(/_/g, " ")} Mode
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {allowedNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href) && item.href !== "/applications");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-navy-850"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Advisory Notice */}
      <div className="p-3 m-3 bg-navy-950/80 rounded border border-navy-850 text-[11px] text-slate-400 leading-relaxed">
        <p className="font-semibold text-slate-300 mb-1">Statutory Notice</p>
        AI flags advisory findings only. Competent AICTE authorities retain statutory scrutiny and final decision-making mandate.
      </div>
    </aside>
  );
};
