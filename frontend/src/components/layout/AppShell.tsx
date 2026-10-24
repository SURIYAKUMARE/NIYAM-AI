"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { RouteGuard } from "../auth/RouteGuard";
import { X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Clean full-screen view for /login without Header or Sidebar
  const isLoginPage = pathname === "/login";

  if (isLoginPage || !user) {
    return (
      <RouteGuard>
        <main className="min-h-screen bg-[#F7F9FB]">{children}</main>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard>
      <div className="min-h-screen bg-[#F7F9FB] flex flex-col antialiased text-[#14202B]">
        {/* Top Header */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block shrink-0 min-h-[calc(100vh-3.5rem)]">
            <Sidebar />
          </div>

          {/* Mobile Slide-Over Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Drawer */}
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10">
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[#5B6B7A] hover:bg-[#F7F9FB] transition"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <Sidebar onCloseMobileMenu={() => setMobileMenuOpen(false)} />
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 overflow-y-auto bg-[#F7F9FB] p-4 sm:p-6 w-full max-w-full">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
};
