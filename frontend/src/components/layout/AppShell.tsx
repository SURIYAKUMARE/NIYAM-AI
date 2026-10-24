"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { DemoScenarioBar } from "../common/DemoScenarioBar";
import { X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth pages render clean full-screen layout without header or sidebar
  const isAuthPage =
    pathname === "/login" ||
    pathname.startsWith("/auth/");

  if (isAuthPage) {
    return <main className="min-h-screen bg-[#F7F9FB]">{children}</main>;
  }

  // Hide sidebar on the landing hero page when not logged in for full-bleed hero view
  const showDesktopSidebar = !!user || pathname !== "/";

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col antialiased text-[#14202B]">
      {/* Test Scenario Strip */}
      <DemoScenarioBar />

      {/* Top Header */}
      <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {showDesktopSidebar && (
          <div className="hidden lg:block shrink-0 min-h-[calc(100vh-3.5rem)]">
            <Sidebar />
          </div>
        )}

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
        <main
          className={`flex-1 min-w-0 overflow-y-auto bg-[#F7F9FB] ${
            pathname === "/" ? "p-0" : "p-4 sm:p-6"
          } w-full max-w-full`}
        >
          <div className={`${pathname === "/" ? "w-full" : "max-w-7xl mx-auto w-full"}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
