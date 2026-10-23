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
  ExternalLink,
  X,
  AlertTriangle,
  Clock
} from "lucide-react";

export const Header: React.FC = () => {
  const { user, switchRole, demoAccounts, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = async () => {
    try {
      const data = await fetchApi("/notifications");
      setNotifications(data);
    } catch {}
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

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
        return "Scrutiny Officer";
      case "supervising_authority":
        return "Competent Authority";
      case "admin":
        return "System Administrator";
      case "auditor":
        return "Statutory Auditor";
      default:
        return "Authorized User";
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case "applicant":
        return "bg-cyan-900/60 text-cyan-200 border-cyan-700";
      case "scrutiny_officer":
        return "bg-amber-900/60 text-amber-200 border-amber-700";
      case "supervising_authority":
        return "bg-purple-900/60 text-purple-200 border-purple-700";
      case "admin":
        return "bg-rose-900/60 text-rose-200 border-rose-700";
      case "auditor":
        return "bg-emerald-900/60 text-emerald-200 border-emerald-700";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <header className="bg-navy-950 border-b border-navy-850 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded bg-navy-850 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold tracking-wider text-lg shadow-sm">
                NY
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base tracking-tight text-white">
                    Niyam
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700/50">
                    Prototype
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal leading-none mt-0.5">
                  Institutional Application Review Platform | AICTE Regulation Bureau
                </p>
              </div>
            </Link>
          </div>

          {/* Right side: Role Switcher, Notification Drawer & User Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded text-slate-300 hover:text-white hover:bg-navy-850 transition"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-navy-950" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-md shadow-2xl bg-white border border-slate-200 py-2 text-xs z-50 text-slate-900">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">In-App Notifications</span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {unreadCount} Unread
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-slate-400 text-xs">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 hover:bg-slate-50 transition flex items-start justify-between gap-2 ${
                            !n.is_read ? "bg-blue-50/40" : ""
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 block text-xs">
                              {n.title}
                            </span>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {new Date(n.created_at).toLocaleTimeString()}
                            </span>
                          </div>

                          {!n.is_read && (
                            <button
                              onClick={() => handleMarkRead(n.id)}
                              className="text-[10px] text-blue-600 hover:underline flex-shrink-0"
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

            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium border transition ${getRoleBadgeStyle(
                  user?.role
                )}`}
                aria-label="Switch Demo User Role"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Role: {getRoleLabel(user?.role)}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-md shadow-xl bg-navy-900 border border-slate-700 py-1 text-xs z-50">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Demo Persona
                  </div>
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.username}
                      onClick={() => {
                        switchRole(acc.username);
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-navy-850 flex items-start justify-between border-b border-slate-800/40 last:border-0"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">
                          {acc.role_title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {acc.organization}
                        </div>
                      </div>
                      {user?.username === acc.username && (
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Details */}
            {user && (
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-medium text-slate-200">
                  {user.full_name}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                  {user.institution_name || user.designation || "AICTE Official"}
                </span>
              </div>
            )}

            <button
              onClick={logout}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-navy-850 transition"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
