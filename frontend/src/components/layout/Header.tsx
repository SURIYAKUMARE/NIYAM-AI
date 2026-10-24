"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import {
  Shield,
  LogOut,
  ChevronDown,
  Check,
  Bell,
  Menu,
  X,
  Radio,
  CheckCircle2,
  Clock,
  User as UserIcon,
} from "lucide-react";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, switchRole, demoAccounts, logout, getRoleRedirect } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await fetchApi("/notifications");
      setNotifications(data || []);
    } catch {}
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Online status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id: number) => {
    try {
      await fetchApi(`/notifications/${id}/read`, { method: "PATCH" });
      loadNotifications();
    } catch {}
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "applicant":
        return "Institution Applicant";
      case "scrutiny_officer":
        return "Senior Scrutiny Officer";
      case "supervising_authority":
        return "Competent Authority";
      case "admin":
        return "System Administrator";
      case "auditor":
        return "Statutory Auditor";
      default:
        return "Authorized Officer";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "NY";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="no-print bg-white border-b border-[#E3E8EE] h-14 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)] text-[#14202B]">
      {/* Left: Mobile Drawer Trigger & Official Brand */}
      <div className="flex items-center gap-3 lg:gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-[#5B6B7A] hover:text-[#14202B] hover:bg-[#F7F9FB] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#0F6B6B] group-hover:bg-[#0a4f4f] transition-colors flex items-center justify-center text-white font-extrabold text-xs shadow-xs tracking-wider">
            NY
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-[#14202B] leading-none flex items-center gap-1.5">
              <span>NIYAM</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-50 text-[#0F6B6B] border border-teal-200">
                APH 2025-26
              </span>
            </div>
            <p className="text-[10px] text-[#5B6B7A] leading-none mt-1 hidden sm:block font-medium">
              AICTE Regulation Bureau • Gov of India
            </p>
          </div>
        </Link>
      </div>

      {/* Center: Quick Search Command Hint (Desktop) */}
      <div className="hidden xl:flex items-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E3E8EE] bg-[#F7F9FB] text-xs text-[#5B6B7A] w-72 cursor-pointer hover:border-[#0F6B6B]/40 transition-colors">
          <span className="text-[11px] truncate">Search application ID, permanent ID, or doc hash...</span>
          <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#E3E8EE] text-[#5B6B7A] shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: Connection Status, Notifications, Persona Switcher, User Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Actual Live Connection Status Indicator */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
            isOnline
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
          title={isOnline ? "Regulatory Engine Live · SHA-256 Ledger Synchronized" : "Connection Interrupted"}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
            }`}
          />
          <span>{isOnline ? "Online · Connected" : "Offline · Reconnecting"}</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-[#5B6B7A] hover:text-[#14202B] hover:bg-[#F7F9FB] transition-colors"
            title="Notifications"
            aria-label="In-App Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-xl bg-white border border-[#E3E8EE] py-2 text-xs z-50 text-[#14202B]">
              <div className="px-4 py-2 border-b border-[#E3E8EE] flex items-center justify-between">
                <span className="font-bold text-[#14202B] text-xs">Regulatory Alerts & Notifications</span>
                <span className="text-[10px] font-semibold text-[#5B6B7A] bg-[#F7F9FB] px-2 py-0.5 rounded border border-[#E3E8EE]">
                  {unreadCount} Unread
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E3E8EE]/60">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-[#5B6B7A] text-xs">No active alerts at this time.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-[#F7F9FB] transition flex items-start justify-between gap-2 ${
                        !n.is_read ? "bg-teal-50/40" : ""
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-[#14202B] block text-xs">
                          {n.title}
                        </span>
                        <p className="text-[11px] text-[#5B6B7A] leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-[#5B6B7A] block font-mono">
                          {new Date(n.created_at).toLocaleTimeString()}
                        </span>
                      </div>

                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="text-[10px] text-[#0F6B6B] hover:underline font-semibold flex-shrink-0"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Demo Persona Switcher (For evaluators and audit testing) */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-[#0F6B6B] border border-teal-200 hover:bg-teal-100 transition-colors shadow-xs"
            aria-label="Switch Evaluator Persona"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="capitalize">{user?.role?.replace(/_/g, " ") || "Persona"}</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white border border-[#E3E8EE] py-2 text-xs z-50 text-[#14202B]">
              <div className="px-4 py-2 border-b border-[#E3E8EE]">
                <div className="font-bold text-[#14202B] text-xs">Quick Role Switcher</div>
                <div className="text-[11px] text-[#5B6B7A]">Select an official persona for evaluation:</div>
              </div>

              <div className="py-1">
                {demoAccounts.map((account) => {
                  const isCurrent = user?.username === account.username;
                  return (
                    <button
                      key={account.username}
                      onClick={async () => {
                        setRoleMenuOpen(false);
                        await switchRole(account.username);
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-[#F7F9FB] transition ${
                        isCurrent ? "bg-teal-50/70 font-semibold text-[#0F6B6B]" : "text-[#14202B]"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-medium">{account.name}</div>
                        <div className="text-[10px] text-[#5B6B7A] capitalize">
                          {account.role_title}
                        </div>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-[#0F6B6B]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar, Name & Role */}
        {user ? (
          <div className="flex items-center gap-2 pl-1 border-l border-[#E3E8EE]">
            <div className="w-7 h-7 rounded-full bg-[#0F6B6B] text-white text-xs font-bold flex items-center justify-center shadow-xs select-none">
              {getInitials(user.full_name)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-[#14202B] leading-none truncate max-w-[140px]">
                {user.full_name || user.username}
              </div>
              <div className="text-[10px] text-[#5B6B7A] leading-none mt-0.5 truncate max-w-[140px]">
                {getRoleLabel(user.role)}
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-[#5B6B7A] hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#0F6B6B] hover:bg-[#0a4f4f] rounded-lg transition-colors shadow-sm"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
