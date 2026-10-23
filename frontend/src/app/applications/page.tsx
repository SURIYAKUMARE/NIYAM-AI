"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Search, Filter, RefreshCw, ExternalLink, ShieldCheck, Building2 } from "lucide-react";

export default function ApplicationsCatalogPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadApps = async () => {
    setLoading(true);
    try {
      let endpoint = "/applications";
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      if (params.toString()) endpoint += `?${params.toString()}`;

      const data = await fetchApi(endpoint);
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadApps();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Regulatory Applications Catalog
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Applications Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.role === "applicant"
              ? "Showing applications for your authenticated institution."
              : "Reviewing statutory applications across regional institutional jurisdictions."}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadApps}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {user?.role === "applicant" && (
            <Link
              href="/institution/applications/new"
              className="px-4 py-2 bg-navy-900 hover:bg-navy-850 text-white rounded text-xs font-semibold shadow-sm transition"
            >
              New Application
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-80">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by app # or institution..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded transition"
          >
            Filter
          </button>
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
          >
            <option value="">All Statuses ({applications.length})</option>
            <option value="PRELIMINARY_CHECK_PASSED">Preliminary Check Passed</option>
            <option value="DEFICIENCIES_DETECTED">Deficiencies Detected</option>
            <option value="SUBMITTED_FOR_SCRUTINY">Submitted for Scrutiny</option>
            <option value="UNDER_SCRUTINY">Under Scrutiny</option>
            <option value="CLARIFICATION_REQUESTED">Clarification Requested</option>
            <option value="RESUBMITTED">Resubmitted (Rectified)</option>
            <option value="RECOMMENDED_FOR_APPROVAL">Recommended for Approval</option>
            <option value="RECOMMENDED_FOR_INSPECTION">Recommended for Inspection</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Application Number</th>
              <th className="px-6 py-3">Institution Name & State</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Advisory Risk</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Loading applications...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No applications matched your filter criteria.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3.5 font-bold text-slate-900 font-mono">
                    <Link href={`/applications/${app.id}`} className="hover:text-blue-600 flex items-center space-x-1">
                      <span>{app.application_number}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="font-semibold text-slate-900">
                      {app.institution?.name || `Institution #${app.institution_id}`}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ID: {app.institution?.aicte_permanent_id || "N/A"} | {app.institution?.state || "India"}
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
                      <div className="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden">
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
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="px-3 py-1 bg-navy-900 hover:bg-navy-850 text-white rounded text-xs font-medium transition shadow-sm"
                    >
                      Workspace
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
