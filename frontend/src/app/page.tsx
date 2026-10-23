"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  Sliders,
  History,
  BarChart3,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // If user is loaded, optionally direct to role primary screen
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "applicant") {
        router.push("/institution/dashboard");
      } else if (user.role === "scrutiny_officer") {
        router.push("/officer/queue");
      } else if (user.role === "supervising_authority") {
        router.push("/analytics");
      } else if (user.role === "admin") {
        router.push("/admin/rules");
      } else if (user.role === "auditor") {
        router.push("/audit");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              AICTE Regulation Bureau Prototype
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Niyam — Institutional Application Review Platform
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              An integrated decision-support workspace that supports preliminary validation of institutional applications,
              document authentication, regulatory compliance checking, and evidence-based human review.
            </p>
          </div>
          <div className="p-3 bg-navy-50 rounded-lg border border-navy-100 text-right hidden sm:block">
            <span className="text-xs text-slate-500 font-medium block">Approval Handbook Session</span>
            <span className="text-sm font-bold text-navy-900">2025-26 (v2025.1)</span>
          </div>
        </div>

        {/* Core Regulatory Principle Notice */}
        <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-900 font-semibold block mb-0.5">Core Statutory Principle:</strong>
            AI provides advisory risk flags and structured evidence extraction. Competent AICTE authorities retain statutory scrutiny, physical inspection, and final regulatory decision-making mandates.
          </div>
        </div>
      </div>

      {/* Role Navigation Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/institution/dashboard"
          className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold mb-4 group-hover:bg-cyan-600 group-hover:text-white transition">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
            Institution Applicant Portal
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Create applications, upload statutory documents, run preliminary validation, review evidence-linked deficiencies, and submit rectified versions.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600">
            <span>Enter Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          href="/officer/queue"
          className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-4 group-hover:bg-amber-600 group-hover:text-white transition">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
            Scrutiny Officer Workspace
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Inspect assigned applications, verify OCR extracted fields against visual evidence, review authority matches, and record official observations.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600">
            <span>Open Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          href="/analytics"
          className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-4 group-hover:bg-purple-600 group-hover:text-white transition">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
            Supervising Authority & Analytics
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Review escalations and officer recommendations, record authorized statutory decisions with written reasons, and inspect workload summaries.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600">
            <span>View Executive Analytics</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
