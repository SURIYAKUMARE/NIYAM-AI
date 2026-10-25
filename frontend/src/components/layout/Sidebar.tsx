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

  // If no user, render nothing
  if (!user || !(user.role in ROLE_ROUTES)) {
    return null;
  }

  const roleConfig = ROLE_ROUTES[user.role as UserRole];
  const navItems = roleConfig.navItems;

  return (
    <aside className="no-print bg-white dark:bg-[#0B101D] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col h-full select-none shrink-0 w-64 shadow-xs transition-colors">
      {/* Workspace Role Header with AICTE Logo */}
      <div className="px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3 bg-slate-50/70 dark:bg-slate-900/60">
        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
          <img
            src="/images/aicte-logo.png"
            alt="AICTE Official Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            AICTE Council
          </div>
          <div className="text-xs text-slate-900 dark:text-white font-bold capitalize mt-0.5 flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
            <span className="truncate">{roleConfig.badge}</span>
          </div>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shrink-0">
          APH 2025
        </span>
      </div>

      {/* Navigation Links directly from ROLE_ROUTES */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Command Modules
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
                  ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-l-[3px] border-blue-600 dark:border-blue-500 shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
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
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5 bg-slate-50/60 dark:bg-slate-900/40">
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.username}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate capitalize font-medium">
                {roleConfig.badge}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Advisory Legal Footnote */}
        <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Statutory Decision Support</span>
          </p>
          AI advisory findings assist review. Final statutory approval decisions remain with competent AICTE authorities.
        </div>
      </div>
    </aside>
  );
};
