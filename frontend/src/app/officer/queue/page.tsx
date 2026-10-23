"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Inbox,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  Building,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

export default function OfficerReviewQueuePage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("");

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await fetchApi("/applications");
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const filteredApps = filterCategory
    ? applications.filter((a) => a.category_code === filterCategory)
    : applications;

  // Officer metrics
  const pendingScrutinyCount = applications.filter((a) => a.status === "SUBMITTED_FOR_SCRUTINY" || a.status === "UNDER_SCRUTINY").length;
  const criticalDeficiencyCount = applications.filter((a) => a.overall_risk_score > 40).length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Scrutiny Division
            </span>
            <span className="text-xs text-slate-500">
              Assigned Official: <strong className="text-slate-800">{user?.full_name || "Er. Anand Mohan Verma"}</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Officer Scrutiny & Evaluation Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review assigned institutional submissions, inspect extracted evidence, and record official scrutiny observations
          </p>
        </div>

        <button
          onClick={loadQueue}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition self-start md:self-auto"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Total In Queue</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{applications.length}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Active across Western Region</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Pending Official Scrutiny</span>
          <span className="text-2xl font-bold text-blue-600 mt-1 block">
            {pendingScrutinyCount}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Ready for evidence check</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">High Risk / Deficient</span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">
            {criticalDeficiencyCount}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Requires manual confirmation / inspection</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Application Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
          >
            <option value="">All Categories ({applications.length})</option>
            <option value="EXTENSION_OF_APPROVAL">Extension of Approval (EoA)</option>
            <option value="INCREASE_IN_INTAKE">Increase in Intake</option>
            <option value="NEW_INSTITUTION">New Institution</option>
            <option value="CHANGE_OF_SITE">Change of Site</option>
          </select>
        </div>
        <span className="text-slate-400 text-[11px]">
          Rule Set: <strong>v2025.1 Active</strong>
        </span>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Application Number</th>
              <th className="px-6 py-3">Institution & AICTE ID</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Processing Status</th>
              <th className="px-6 py-3">AI Advisory Risk</th>
              <th className="px-6 py-3 text-right">Scrutiny Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Loading scrutiny queue...
                </td>
              </tr>
            ) : filteredApps.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No applications found in scrutiny queue.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3.5 font-bold text-slate-900 font-mono">
                    <Link href={`/applications/${app.id}`} className="hover:text-blue-600 flex items-center space-x-1">
                      <span>{app.application_number}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="font-semibold text-slate-900">
                      {app.institution?.name || "Institution"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      AICTE ID: {app.institution?.aicte_permanent_id} | {app.institution?.state}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-700 capitalize">
                    {app.category_code.replace(/_/g, " ")}
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
                      <span className="font-mono text-slate-700 font-semibold">
                        {app.overall_risk_score.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="px-3 py-1 bg-navy-900 hover:bg-navy-850 text-white rounded text-xs font-medium transition shadow-sm"
                    >
                      Inspect & Scrutinize
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
