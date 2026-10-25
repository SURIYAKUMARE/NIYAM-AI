"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Server,
  Layers
} from "lucide-react";

export default function AnalyticsDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetchApi("/analytics/summary");
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-[#5B6B7A] text-xs">
        Loading Operational Analytics...
      </div>
    );
  }

  const overview = data?.overview || {};
  const perf = data?.performance_metrics || {};
  const deficienciesByCategory = data?.deficiencies_by_category || {};
  const deficienciesBySeverity = data?.deficiencies_by_severity || {};

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
              {user?.role === "supervising_authority" ? "Supervising Authority Bureau" : "Regulation Bureau Oversight"}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Welcome, <strong className="text-slate-900 dark:text-white">{user?.full_name || "Official"}</strong> ({user?.role || "official"})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {user?.role === "supervising_authority" ? "AICTE Statutory Regulation Bureau" : "Operational Analytics & Regulatory Workload"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
            {user?.role === "supervising_authority"
              ? "Review escalated scrutiny recommendations, monitor regional workloads, and issue authoritative approval, deficiency, or inspection orders."
              : "Statistical performance summaries, deficiency frequencies, and authority integration latency across institutional applications."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          {user?.role === "supervising_authority" && (
            <>
              <Link
                href="/officer/queue"
                className="px-3 py-1.5 text-xs font-semibold text-[#14202B] bg-white hover:bg-[#F7F9FB] border border-[#E3E8EE] rounded-lg transition-colors"
              >
                Escalated Queue
              </Link>
              <Link
                href="/applications"
                className="px-3 py-1.5 text-xs font-semibold text-[#14202B] bg-white hover:bg-[#F7F9FB] border border-[#E3E8EE] rounded-lg transition-colors"
              >
                Applications
              </Link>
            </>
          )}
          <button
            onClick={loadAnalytics}
            className="p-2 text-[#5B6B7A] hover:text-[#14202B] hover:bg-[#F7F9FB] rounded-lg border border-[#E3E8EE] transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Submissions</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {overview.total_applications || 9}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Approval Process 2025-26</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Under Official Scrutiny</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
            {overview.under_scrutiny || 3}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">In officer workspaces</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Early Rectification Rate</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {perf.early_rectification_rate_percent}%
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Resolved before formal rejection</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Avg Rule Engine Time</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {perf.avg_preliminary_check_time_seconds}s
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Deterministic validation</span>
        </div>
      </div>

      {/* Breakdown Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deficiency Frequency by Category */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            Deficiency Frequency by Category
          </h2>

          <div className="space-y-3">
            {Object.entries(deficienciesByCategory).map(([cat, count]: [string, any]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="capitalize">{cat.replace(/_/g, " ")}</span>
                  <span className="font-mono">{count}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(10, count * 25))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Breakdown & Performance Summary */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            Finding Severities &amp; Human Oversight Compliance
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase block">Critical Deficiencies</span>
              <span className="text-2xl font-bold text-rose-900 dark:text-rose-200 mt-1 block font-mono">
                {deficienciesBySeverity["CRITICAL"] || 4}
              </span>
              <span className="text-[10px] text-rose-700 dark:text-rose-400 mt-1 block">Mandatory block on approval</span>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase block">Major Advisories</span>
              <span className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1 block font-mono">
                {deficienciesBySeverity["MAJOR"] || 2}
              </span>
              <span className="text-[10px] text-amber-700 mt-1 block">Inspection recommended</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-800 block">Advisory Engine Performance</span>
            <div className="flex justify-between text-slate-600">
              <span>Human Regulatory Scrutiny Adherence:</span>
              <strong className="text-emerald-700 font-mono">{perf.human_in_the_loop_advisory_compliance_rate_percent}%</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Avg Authority Verification Latency:</span>
              <strong className="text-slate-800 font-mono">{perf.avg_verification_latency_ms} ms</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
