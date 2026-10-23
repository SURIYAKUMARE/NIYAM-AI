"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
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
      <div className="p-12 text-center text-slate-400 text-xs">
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
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            Regulation Bureau Oversight
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Operational Analytics & Regulatory Workload
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical performance summaries, deficiency frequencies, and authority integration latency
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition self-start md:self-auto"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Total Submissions</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {overview.total_applications || 9}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Approval Process 2025-26</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Under Official Scrutiny</span>
          <span className="text-2xl font-bold text-blue-600 mt-1 block">
            {overview.under_scrutiny || 3}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">In officer workspaces</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Early Rectification Rate</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {perf.early_rectification_rate_percent}%
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Resolved before formal rejection</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Avg Rule Engine Time</span>
          <span className="text-2xl font-bold text-navy-900 mt-1 block">
            {perf.avg_preliminary_check_time_seconds}s
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Deterministic validation</span>
        </div>
      </div>

      {/* Breakdown Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deficiency Frequency by Category */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Deficiency Frequency by Category
          </h2>

          <div className="space-y-3">
            {Object.entries(deficienciesByCategory).map(([cat, count]: [string, any]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="capitalize">{cat.replace(/_/g, " ")}</span>
                  <span className="font-mono">{count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(10, count * 25))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Breakdown & Performance Summary */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Finding Severities & Human Oversight Compliance
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-rose-50 rounded border border-rose-200">
              <span className="text-[11px] font-bold text-rose-800 uppercase block">Critical Deficiencies</span>
              <span className="text-2xl font-bold text-rose-900 mt-1 block font-mono">
                {deficienciesBySeverity["CRITICAL"] || 4}
              </span>
              <span className="text-[10px] text-rose-700 mt-1 block">Mandatory block on approval</span>
            </div>

            <div className="p-4 bg-amber-50 rounded border border-amber-200">
              <span className="text-[11px] font-bold text-amber-800 uppercase block">Major Advisories</span>
              <span className="text-2xl font-bold text-amber-900 mt-1 block font-mono">
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
