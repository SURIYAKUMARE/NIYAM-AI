"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Filter,
  RefreshCw,
  Search,
  FileCheck2,
  Sliders
} from "lucide-react";

export default function FindingsTrackerPage() {
  const { user } = useAuth();
  const [findings, setFindings] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadFindings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (severityFilter) params.append("severity", severityFilter);
      if (statusFilter) params.append("status", statusFilter);
      const data = await fetchApi(`/validation/findings?${params.toString()}`);
      setFindings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [severityFilter, statusFilter]);

  const isOfficerOrAuthority = user?.role === "scrutiny_officer" || user?.role === "supervising_authority" || user?.role === "admin";

  const handleUpdateDisposition = async (findingId: number, status: string) => {
    const notes = prompt(`Enter officer notes for marking finding as '${status}':`, "Reviewed and verified");
    if (!notes) return;

    try {
      await fetchApi(`/validation/findings/${findingId}/disposition`, {
        method: "PATCH",
        body: JSON.stringify({ status, officer_notes: notes }),
      });
      alert(`Finding #${findingId} updated to ${status}.`);
      loadFindings();
    } catch (err: any) {
      alert(`Error updating finding: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            Advisory Findings Intelligence
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Compliance Findings & Rectification Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Traceable regulatory discrepancies linked to statutory handbook clauses, bounding box evidence, and rectification audit logs
          </p>
        </div>

        <button
          onClick={loadFindings}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition self-start md:self-auto"
          title="Refresh Findings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical Deficiencies</option>
              <option value="MAJOR">Major Advisories</option>
              <option value="MINOR">Minor Discrepancies</option>
              <option value="ADVISORY">Informational</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Review Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
            >
              <option value="">All Review Statuses</option>
              <option value="OPEN">Open (Actionable)</option>
              <option value="RECTIFIED_BY_APPLICANT">Rectified by Applicant</option>
              <option value="CONFIRMED_BY_OFFICER">Confirmed by Officer</option>
              <option value="DISMISSED_BY_OFFICER">Dismissed by Officer</option>
              <option value="WAIVED_BY_AUTHORITY">Waived by Authority</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400 text-[11px]">
          Showing {findings.length} evidence-linked findings
        </span>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-lg border border-slate-200">
            Loading compliance findings...
          </div>
        ) : findings.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-lg border border-slate-200">
            No findings match the selected filter criteria.
          </div>
        ) : (
          findings.map((f) => (
            <div key={f.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {f.rule_code}
                  </span>
                  <StatusBadge status={f.severity} type="finding" />
                  <StatusBadge status={f.status} type="finding" />
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <Link
                    href={`/applications/${f.application_id}`}
                    className="font-mono font-bold text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <span>Application #{f.application_id}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                  <span className="text-slate-400 text-[11px]">
                    Citation: <strong className="text-slate-600">{f.rule_citation}</strong>
                  </span>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-900 leading-snug">
                {f.explanation}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5 uppercase">
                    Statutory Expected Norm
                  </span>
                  <p className="text-slate-800 font-mono text-[11px]">{f.expected_value || "Conforming Record"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5 uppercase">
                    Observed Value / Evidence
                  </span>
                  <p className="text-rose-700 font-mono text-[11px] font-semibold">{f.observed_value || "Deficient"}</p>
                </div>
              </div>

              {f.excerpt && (
                <div className="text-[11px] text-slate-600 font-mono bg-blue-50/50 p-2 rounded border border-blue-100">
                  <strong>Evidence Excerpt:</strong> &quot;{f.excerpt}&quot;
                </div>
              )}

              {f.officer_notes && (
                <div className="text-[11px] text-slate-700 bg-amber-50/60 p-2.5 rounded border border-amber-200">
                  <strong>Official Observation:</strong> {f.officer_notes}
                </div>
              )}

              {/* Disposition Action Buttons for Scrutiny Officer */}
              {isOfficerOrAuthority && (
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  {f.status !== "CONFIRMED_BY_OFFICER" && (
                    <button
                      onClick={() => handleUpdateDisposition(f.id, "CONFIRMED_BY_OFFICER")}
                      className="px-2.5 py-1 text-[11px] bg-red-50 text-red-700 hover:bg-red-100 rounded font-medium border border-red-200"
                    >
                      Confirm Deficiency
                    </button>
                  )}
                  {f.status !== "DISMISSED_BY_OFFICER" && (
                    <button
                      onClick={() => handleUpdateDisposition(f.id, "DISMISSED_BY_OFFICER")}
                      className="px-2.5 py-1 text-[11px] bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium border border-slate-300"
                    >
                      Dismiss Finding
                    </button>
                  )}
                  {user?.role === "supervising_authority" && f.status !== "WAIVED_BY_AUTHORITY" && (
                    <button
                      onClick={() => handleUpdateDisposition(f.id, "WAIVED_BY_AUTHORITY")}
                      className="px-2.5 py-1 text-[11px] bg-purple-50 text-purple-700 hover:bg-purple-100 rounded font-medium border border-purple-200"
                    >
                      Waive by Statutory Authority
                    </button>
                  )}
                  <Link
                    href={`/applications/${f.application_id}`}
                    className="px-2.5 py-1 text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium border border-blue-200"
                  >
                    Open Application Workspace
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
