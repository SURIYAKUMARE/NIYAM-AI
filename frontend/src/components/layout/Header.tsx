"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { ROLE_ROUTES, UserRole } from "@/lib/roles";
import {
  Shield,
  LogOut,
  Bell,
  Menu,
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

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0F6B6B] flex items-center justify-center text-white font-extrabold text-sm shadow-xs tracking-tighter">
            <span>NY</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#14202B] text-sm tracking-tight">
                NIYAM
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 bg-[#F7F9FB] text-[#5B6B7A] rounded border border-[#E3E8EE]">
                AICTE APH 2025-26
              </span>
            </div>
            <span className="hidden md:inline-block text-[10px] text-[#5B6B7A] leading-tight font-medium">
              Institutional Regulatory Review &amp; Compliance Verification
            </span>
          </div>
        </div>
      </div>

      {/* Right: Regulatory Status, Role Badge, User Info, Notifications & Logout */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* System Online Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#5B6B7A] px-2.5 py-1 rounded-full bg-[#F7F9FB] border border-[#E3E8EE]">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
            }`}
          />
          <span className="text-[11px] font-medium font-mono">
            {isOnline ? "REGULATORY SYNC: ACTIVE" : "OFFLINE"}
          </span>
        </div>

        {/* Notifications Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-1.5 rounded-lg text-[#5B6B7A] hover:text-[#14202B] hover:bg-[#F7F9FB] transition-colors relative"
              aria-label="Notifications"
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
                  <span className="font-bold text-[#14202B] text-xs">Regulatory Alerts &amp; Notifications</span>
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
        )}

        {/* Clean Official Role Badge */}
        {user && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-[#0F6B6B] border border-teal-200 shadow-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>{getRoleBadge(user.role)}</span>
          </div>
        )}

        {/* User Avatar, Name & Logout Button */}
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
