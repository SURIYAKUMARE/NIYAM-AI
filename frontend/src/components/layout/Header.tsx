"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { ROLE_ROUTES, UserRole } from "@/lib/roles";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Shield,
  LogOut,
  Bell,
  Menu,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
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

  const getRoleBadge = (role?: string) => {
    if (role && role in ROLE_ROUTES) {
      return ROLE_ROUTES[role as UserRole].badge;
    }
    return "Authorized Officer";
  };

  const getRoleLabel = (role?: string) => {
    if (role && role in ROLE_ROUTES) {
      return ROLE_ROUTES[role as UserRole].name;
    }
    return "Authorized Officer";
  };

  const getInitials = (name?: string) => {
    if (!name) return "NY";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="no-print bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 h-14 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(15,23,42,0.03)] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Left: Mobile Drawer Trigger & Official Brand */}
      <div className="flex items-center gap-3 lg:gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* NIYAM Executive Seal / Official AICTE Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-lg bg-white dark:bg-slate-800 p-0.5 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/images/aicte-logo.png"
                alt="AICTE Official Logo"
                className="w-full h-full object-contain"
              />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#090D16]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                  NIYAM
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800/60 font-semibold">
                  AICTE APH 2025-26
                </span>
              </div>
              <span className="hidden md:inline-block text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-medium">
                Regulatory Decision-Support &amp; Document Authentication
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Right: Regulatory Status, Role Badge, Theme Toggle, User Info, Notifications & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* System Online Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
            }`}
          />
          <span className="text-[11px] font-medium font-mono">
            {isOnline ? "REGULATORY SYNC: ACTIVE" : "OFFLINE"}
          </span>
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative border border-slate-200 dark:border-slate-700 shadow-2xs"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 py-2 text-xs z-50 text-slate-900 dark:text-slate-100">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">Regulatory Alerts &amp; Directives</span>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {unreadCount} Unread
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-slate-500 dark:text-slate-400 text-xs">No active alerts at this time.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-start justify-between gap-2 ${
                          !n.is_read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 dark:text-white block text-xs">
                            {n.title}
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono">
                            {new Date(n.created_at).toLocaleTimeString()}
                          </span>
                        </div>

                        {!n.is_read && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex-shrink-0"
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
        )}

        {/* Clean Official Role Badge */}
        {user && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{getRoleBadge(user.role)}</span>
          </div>
        )}

        {/* User Avatar, Name & Logout Button */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-xs select-none">
              {getInitials(user.full_name)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-[140px]">
                {user.full_name || user.username}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5 truncate max-w-[140px]">
                {getRoleLabel(user.role)}
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-1"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
