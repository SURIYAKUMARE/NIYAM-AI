import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "NIYAM — AI-Powered Regulatory Validation & Document Authentication",
  description: "AICTE Problem Statement 26261: AI-powered decision support platform for institutional application review, cryptographic document authentication, and statutory compliance verification.",
  icons: {
    icon: "/images/aicte-logo.png",
    apple: "/images/aicte-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-slate-100 flex flex-col antialiased transition-colors">
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
