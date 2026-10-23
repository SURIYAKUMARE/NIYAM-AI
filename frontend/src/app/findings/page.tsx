"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StateFeedback } from "@/components/ui/StateFeedback";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Filter,
  RefreshCw,
  Search,
  FileCheck2,
  Sliders,
  HelpCircle,
  ArrowRight,
  Upload,
  Check,
  X,
} from "lucide-react";

export default function FindingsTrackerPage() {
  const { user } = useAuth();
  const [findings, setFindings] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Disposition Modal State
  const [dispositionItem, setDispositionItem] = useState<{ id: number; action: string; rule: string } | null>(null);
  const [officerNotes, setOfficerNotes] = useState("");
  const [submittingDisposition, setSubmittingDisposition] = useState(false);

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

  const isOfficerOrAuthority =
    user?.role === "scrutiny_officer" || user?.role === "supervising_authority" || user?.role === "admin";

  const handleConfirmDisposition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispositionItem || !officerNotes.trim()) return;

    setSubmittingDisposition(true);
    try {
      await fetchApi(`/validation/findings/${dispositionItem.id}/disposition`, {
        method: "PATCH",
        body: JSON.stringify({
          status: dispositionItem.action,
          officer_notes: officerNotes.trim(),
        }),
      });
      setDispositionItem(null);
      setOfficerNotes("");
      loadFindings();
    } catch (err: any) {
      alert(`Error updating finding: ${err.message}`);
    } finally {
      setSubmittingDisposition(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-niyam-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-900 border border-red-200">
              Screen 7 • Explainable AI Advisory Findings
            </span>
            <span className="text-xs text-niyam-secondary font-mono">Rule Set v2025.1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-niyam-text tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-semantic-error" />
            <span>Compliance Findings & Rectification Tracker</span>
          </h1>
          <p className="text-sm text-niyam-secondary mt-1 max-w-2xl">
            Traceable regulatory discrepancies linked to statutory handbook clauses, bounding box evidence coordinates, and human-in-the-loop rectification workflows.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadFindings}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
        >
          Refresh Findings
        </Button>
      </div>

      {/* Filter Bar */}
      <Card padding="sm" className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-niyam-secondary" />
            <span className="text-niyam-secondary font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-xs bg-white text-niyam-text"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical Deficiencies</option>
              <option value="MAJOR">Major Non-Compliances</option>
              <option value="ADVISORY">Advisory Notices</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-niyam-secondary font-medium">Review Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-xs bg-white text-niyam-text"
            >
              <option value="">All Review Statuses</option>
              <option value="OPEN">Open (Action Required)</option>
              <option value="RECTIFIED_BY_APPLICANT">Rectified by Applicant</option>
              <option value="CONFIRMED_BY_OFFICER">Confirmed by Officer</option>
              <option value="DISMISSED_BY_OFFICER">Dismissed by Officer</option>
              <option value="WAIVED_BY_AUTHORITY">Waived by Authority</option>
            </select>
          </div>
        </div>

        <span className="text-niyam-secondary text-[11px] font-mono">
          Showing {findings.length} evidence-linked findings
        </span>
      </Card>

      {/* Findings List */}
      <div className="space-y-4">
        {loading ? (
          <StateFeedback state="loading" title="Analyzing Regulatory Findings..." />
        ) : findings.length === 0 ? (
          <StateFeedback
            state="empty"
            title="No Compliance Deficiencies"
            description="All evaluated records satisfy active regulatory thresholds."
          />
        ) : (
          findings.map((f) => (
            <Card key={f.id} padding="none">
              <div className="p-4 sm:p-6 space-y-4">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-niyam-border">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-niyam-text bg-slate-100 px-2 py-0.5 rounded border border-niyam-border">
                      {f.rule_code}
                    </span>
                    <StatusBadge dimension="finding" value={f.severity} />
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize bg-slate-100 text-slate-700 border border-slate-200">
                      Status: {f.status?.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <Link
                      href={`/applications/${f.application_id}`}
                      className="font-mono font-bold text-niyam-accent hover:underline flex items-center gap-1"
                    >
                      <span>App #{f.application_id}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <span className="text-niyam-secondary">
                      Statutory Clause: <strong className="text-niyam-text">{f.rule_citation}</strong>
                    </span>
                  </div>
                </div>

                {/* 3-Part Mandatory Explanation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                  {/* Part 1: What needs attention */}
                  <div className="p-3.5 rounded-md bg-red-50/50 border border-red-200 space-y-1">
                    <span className="text-[11px] font-bold text-red-900 uppercase tracking-wider block">
                      1. What Needs Attention
                    </span>
                    <p className="text-xs text-red-950 font-semibold leading-relaxed">
                      {f.explanation}
                    </p>
                  </div>

                  {/* Part 2: Evidence / Requirement */}
                  <div className="p-3.5 rounded-md bg-slate-50 border border-niyam-border space-y-1.5">
                    <span className="text-[11px] font-bold text-niyam-secondary uppercase tracking-wider block">
                      2. Evidence / Regulatory Clause
                    </span>
                    <div className="text-xs text-niyam-text space-y-1">
                      <div>
                        <span className="text-niyam-secondary">Mandatory Norm:</span>{" "}
                        <strong className="font-mono">{f.expected_value || "Full Compliance"}</strong>
                      </div>
                      <div>
                        <span className="text-niyam-secondary">Observed Extract:</span>{" "}
                        <span className="font-mono text-semantic-error font-semibold">
                          {f.observed_value || "Deficient Value"}
                        </span>
                      </div>
                      {f.excerpt && (
                        <div className="text-[11px] text-slate-600 font-mono bg-white p-1.5 rounded border border-slate-200 mt-1 line-clamp-2">
                          &quot;{f.excerpt}&quot;
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Part 3: What the user can do next */}
                  <div className="p-3.5 rounded-md bg-emerald-50/50 border border-emerald-200 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                      3. What You Can Do Next
                    </span>
                    <p className="text-xs text-emerald-950 leading-relaxed">
                      {f.severity === "CRITICAL"
                        ? "Upload renewed certificate or valid statutory NOC through the Document Checklist tab before formal submission."
                        : "Correct extracted field value in the Document Viewer or submit an explanatory response in the Clarifications tab."}
                    </p>
                  </div>
                </div>

                {/* Officer Notes if present */}
                {f.officer_notes && (
                  <div className="p-3 rounded-md bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
                    <strong>Scrutiny Officer Observation:</strong> {f.officer_notes}
                  </div>
                )}

                {/* Official Action Controls */}
                {isOfficerOrAuthority && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-niyam-border">
                    {f.status !== "CONFIRMED_BY_OFFICER" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          setDispositionItem({
                            id: f.id,
                            action: "CONFIRMED_BY_OFFICER",
                            rule: f.rule_code,
                          })
                        }
                      >
                        Confirm Deficiency
                      </Button>
                    )}
                    {f.status !== "DISMISSED_BY_OFFICER" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setDispositionItem({
                            id: f.id,
                            action: "DISMISSED_BY_OFFICER",
                            rule: f.rule_code,
                          })
                        }
                      >
                        Dismiss Finding
                      </Button>
                    )}
                    {user?.role === "supervising_authority" && f.status !== "WAIVED_BY_AUTHORITY" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setDispositionItem({
                            id: f.id,
                            action: "WAIVED_BY_AUTHORITY",
                            rule: f.rule_code,
                          })
                        }
                      >
                        Waive by Authority
                      </Button>
                    )}
                    <Link href={`/applications/${f.application_id}`}>
                      <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Open Case Dossier
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Official Disposition Modal */}
      {dispositionItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-niyam-border max-w-md w-full p-6 shadow-dialog space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-niyam-text">
                Record Official Disposition: {dispositionItem.rule}
              </h3>
              <p className="text-xs text-niyam-secondary mt-0.5">
                Target Action: <strong className="capitalize">{dispositionItem.action.replace(/_/g, " ")}</strong>
              </p>
            </div>

            <form onSubmit={handleConfirmDisposition} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-niyam-text block mb-1">
                  Official Scrutiny Justification <span className="text-semantic-error">*</span>
                </label>
                <textarea
                  rows={3}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Record regulatory reasoning for confirming or dismissing this advisory finding..."
                  required
                  className="w-full text-xs sm:text-sm p-3 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-niyam-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDispositionItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submittingDisposition}
                >
                  Save Disposition
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
