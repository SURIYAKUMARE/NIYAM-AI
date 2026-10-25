"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isRouteAllowedForRole, getRoleHome } from "@/lib/roles";
import { ShieldAlert, X } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [deniedToast, setDeniedToast] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (deniedToast) {
      const timer = setTimeout(() => setDeniedToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [deniedToast]);

  useEffect(() => {
    if (isLoading) return;

    // Public route: /login
    const isLogin = pathname === "/login";
    const isRoot = pathname === "/";

    if (!user) {
      if (!isLogin) {
        router.replace("/login");
      }
      return;
    }

    // Authenticated user
    if (isLogin || isRoot) {
      const home = getRoleHome(user.role);
      router.replace(home);
      return;
    }

    // Check if the current route is allowed for the user's role
    const allowed = isRouteAllowedForRole(user.role, pathname);
    if (!allowed) {
      const home = getRoleHome(user.role);
      setDeniedToast("You don't have access to that page.");
      router.replace(home);
    }
  }, [user, isLoading, pathname, router]);

  // While checking credentials, show full-screen authoritative spinner on protected pages
  if (isLoading && pathname !== "/login") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-extrabold shadow-md animate-pulse">
          <span>NY</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying security credentials...</span>
        </div>
      </div>
    );
  }

  // Not authenticated and not on /login: do not flash protected content
  if (!user && pathname !== "/login") {
    return null;
  }

  // Authenticated but on forbidden route: do not flash forbidden content while redirecting
  if (user && pathname !== "/login" && pathname !== "/" && !isRouteAllowedForRole(user.role, pathname)) {
    return null;
  }

  return (
    <>
      {deniedToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-rose-900/95 text-white rounded-xl shadow-2xl border border-rose-700/50 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <ShieldAlert className="w-5 h-5 text-rose-300 shrink-0" />
          <span className="text-xs font-bold">{deniedToast}</span>
          <button
            onClick={() => setDeniedToast(null)}
            className="p-1 text-white/70 hover:text-white rounded-lg transition"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {children}
    </>
  );
};
