"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Building2,
  PlusCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

export default function InstitutionDashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsData, findingsData] = await Promise.all([
        fetchApi("/applications"),
        fetchApi("/validation/findings"),
      ]);
      setApplications(appsData);
      setFindings(findingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDeficiencies = findings.filter((f) => f.status === "OPEN" && f.severity === "CRITICAL");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
              Institution Portal
            </span>
            <span className="text-xs text-slate-500">
              AICTE Permanent ID: <strong className="text-slate-800">1-492048123</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Apex Institute of Technology & Science
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered Trust | Pune, Maharashtra | Established 2008 | NAAC A+ Grade
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/institution/applications/new"
            className="px-4 py-2 bg-navy-900 hover:bg-navy-850 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Application</span>
          </Link>
        </div>
      </div>

      {/* Early Deficiencies Alert Banner */}
      {openDeficiencies.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-rose-900">
                Action Required: {openDeficiencies.length} Critical Compliance Deficiencies Detected
              </h3>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                Early validation identified statutory checklist deficiencies or expired certificates. Resolve these permitted issues prior to formal scrutiny submission to prevent processing delays.
              </p>
            </div>
          </div>
          <Link
            href="/findings"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold flex-shrink-0 transition"
          >
            Rectify Deficiencies
          </Link>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Total Applications</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{applications.length}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Session 2025-26</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Open Deficiencies</span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">
            {openDeficiencies.length}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Actionable early</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Preliminary Verified</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {applications.filter((a) => a.status === "PRELIMINARY_CHECK_PASSED" || a.status === "RESUBMITTED").length}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Statutory checklists complete</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">TER Fee Status</span>
          <span className="text-2xl font-bold text-blue-600 mt-1 block">Reconciled</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Bharatkosh Gateway Confirmed</span>
        </div>
      </div>

      {/* Application Submissions Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Institutional Applications Workspace
          </h2>
          <span className="text-xs text-slate-500">
            Rule Version: <strong className="text-slate-800">v2025.1</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Application Number</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Academic Session</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">AI Advisory Risk</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Loading institutional applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No applications found for your institution. Click &quot;Create New Application&quot; to begin.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">
                      <Link href={`/applications/${app.id}`} className="hover:text-blue-600 flex items-center space-x-1">
                        <span>{app.application_number}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 capitalize">
                      {app.category_code.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 font-mono">
                      {app.academic_year}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={app.status} type="application" />
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              app.overall_risk_score > 50
                                ? "bg-rose-500"
                                : app.overall_risk_score > 20
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, app.overall_risk_score))}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-600">
                          {app.overall_risk_score.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <Link
                        href={`/applications/${app.id}`}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                      >
                        Open Workspace
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
