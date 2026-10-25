import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Niyam (NIYAM) — Institutional Application Review & Compliance Verification",
  description: "Administrative workspace for institutional application validation, document authentication, APH regulatory checking, and evidence-based review | AICTE Regulation Bureau.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F7F9FB] dark:bg-[#0B111A] text-[#14202B] dark:text-slate-100 flex flex-col antialiased transition-colors">
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
