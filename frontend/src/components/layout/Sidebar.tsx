"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLE_ROUTES, UserRole } from "@/lib/roles";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  FileText,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Landmark,
  ListFilter,
  FileCheck2,
  Server,
  BarChart3,
  History,
  ShieldAlert,
  Sliders,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  GraduationCap,
  FileSearch,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Building2,
  PlusCircle,
  FileText,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Landmark,
  ListFilter,
  FileCheck2,
  Server,
  BarChart3,
  History,
  ShieldAlert,
  Sliders,
  Users,
  Settings,
  GraduationCap,
  FileSearch,
};

interface SidebarProps {
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobileMenu }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Task 3: If no user, render nothing (no fallback to scrutiny_officer)
  if (!user || !(user.role in ROLE_ROUTES)) {
    return null;
  }

  const roleConfig = ROLE_ROUTES[user.role as UserRole];
  const navItems = roleConfig.navItems;

  return (
    <aside className="no-print bg-white dark:bg-[#111A24] border-r border-[#E3E8EE] dark:border-slate-800 flex flex-col h-full select-none shrink-0 w-64 shadow-xs transition-colors">
      {/* Workspace Role Header */}
      <div className="px-5 py-4 border-b border-[#E3E8EE] dark:border-slate-800 flex items-center justify-between bg-[#F7F9FB]/50 dark:bg-slate-900/50">
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold text-[#5B6B7A] dark:text-slate-400 uppercase tracking-wider">
            Active Workspace
          </div>
          <div className="text-xs text-[#14202B] dark:text-white font-bold capitalize mt-1 flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-[#0F6B6B] dark:bg-teal-400 ring-2 ring-teal-200 dark:ring-teal-900 shrink-0" />
            <span className="truncate">{roleConfig.badge}</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-[#0F6B6B] dark:text-teal-400 border border-[#E3E8EE] dark:border-slate-700 shrink-0">
          APH 2025
        </span>
      </div>

      {/* Navigation Links directly from ROLE_ROUTES */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5B6B7A]/80 dark:text-slate-400">
          Navigation
        </div>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" &&
              pathname.startsWith(item.href) &&
              item.href !== "/applications");
          const Icon = ICON_MAP[item.iconName] || FileText;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobileMenu}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#0F6B6B] text-white shadow-xs"
                  : "text-[#14202B] dark:text-slate-200 hover:bg-[#F7F9FB] dark:hover:bg-slate-800 hover:text-[#0F6B6B] dark:hover:text-teal-400"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-[#5B6B7A] dark:text-slate-400"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-teal-50 dark:bg-teal-950/60 text-[#0F6B6B] dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session & Statutory Legal Advisory Footer */}
      <div className="p-3 border-t border-[#E3E8EE] dark:border-slate-800 space-y-2.5 bg-[#F7F9FB]/60 dark:bg-slate-900/40">
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-[#E3E8EE] dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div className="min-w-0 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0F6B6B] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#14202B] dark:text-white truncate">{user.username}</p>
              <p className="text-[10px] text-[#5B6B7A] dark:text-slate-400 truncate capitalize font-medium">
                {roleConfig.badge}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-[#5B6B7A] dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Advisory Legal Footnote */}
        <div className="p-2.5 rounded-xl bg-[#F7F9FB] dark:bg-slate-800/40 border border-[#E3E8EE] dark:border-slate-800 text-[10px] text-[#5B6B7A] dark:text-slate-400 leading-relaxed">
          <p className="font-bold text-[#14202B] dark:text-white mb-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#0F6B6B] dark:text-teal-400" />
            <span>Statutory Decision Support</span>
          </p>
          AI advisory findings assist review. Final statutory approval decisions remain with competent AICTE authorities.
        </div>
      </div>
    </aside>
  );
};
