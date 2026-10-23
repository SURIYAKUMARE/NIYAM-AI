import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { DemoScenarioBar } from "@/components/common/DemoScenarioBar";

export const metadata: Metadata = {
  title: "Niyam — Institutional Application Review Platform",
  description: "Decision-support workspace for preliminary application validation, document authentication, regulatory checking, and evidence-based review | AICTE Regulation Bureau Prototype.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col antialiased">
        <AuthProvider>
          <DemoScenarioBar />
          <Header />
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
