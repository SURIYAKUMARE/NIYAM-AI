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
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Server,
  RefreshCw,
  ExternalLink,
  Filter,
  Check,
  XCircle,
  Radio,
  ServerCrash,
  UserCheck,
  FileText,
  Info,
} from "lucide-react";

export default function VerificationQueuePage() {
  const { user } = useAuth();
  const [sources, setSources] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Manual Confirmation Modal State
  const [manualModalItem, setManualModalItem] = useState<any | null>(null);
  const [evidenceRef, setEvidenceRef] = useState("");
  const [confirmationReason, setConfirmationReason] = useState("");
  const [submittingConfirmation, setSubmittingConfirmation] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sourcesData, queueData] = await Promise.all([
        fetchApi("/verification/sources/health"),
        fetchApi(`/verification/queue${statusFilter ? `?status=${statusFilter}` : ""}`),
      ]);
      setSources(sourcesData);
      setQueue(queueData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleManualConfirmationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualModalItem || !evidenceRef.trim() || !confirmationReason.trim()) return;

    setSubmittingConfirmation(true);
    try {
      await fetchApi(`/verification/${manualModalItem.id}/manual-confirm`, {
        method: "POST",
        body: JSON.stringify({
          supporting_evidence_ref: evidenceRef,
          confirmation_reason: confirmationReason,
        }),
      });
      setManualModalItem(null);
      setEvidenceRef("");
      setConfirmationReason("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Error recording manual confirmation");
    } finally {
      setSubmittingConfirmation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-niyam-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-niyam-accentLight text-niyam-accent border border-niyam-accentMuted">
              Screen 11 • Authoritative Issuing Registries
            </span>
            <span className="text-xs text-niyam-secondary font-mono">Simulated Adapters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-niyam-text tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-niyam-accent" />
            <span>Issuing-Source Verification & Manual Confirmation</span>
          </h1>
          <p className="text-sm text-niyam-secondary mt-1 max-w-2xl">
            Real-time verification queue across DigiLocker, State Land Revenue Portals, Affiliating Universities, TER Fee Gateways, and Cryptographic QR Decoders.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadData}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
        >
          Refresh Verification Records
        </Button>
      </div>

      {/* Critical Statutory Notice Banner */}
      <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-subtle">
        <ServerCrash className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-amber-950 block">
            Statutory Principle on External Service Outages:
          </strong>
          <p className="text-amber-900/90 leading-relaxed text-xs">
            A timeout or temporary unavailability of an external registry (e.g. State Land Revenue or University portal) is strictly classified as <span className="font-semibold text-amber-950 underline">Source Unavailable</span>. It is <strong>never</strong> treated as an adverse finding, invalid document, or failed authenticity check. Scrutiny officers are empowered to proceed with manual evidence confirmation.
          </p>
        </div>
      </div>

      {/* Configured Source Adapters Live Grid */}
      <div>
        <h2 className="text-xs font-bold text-niyam-secondary uppercase tracking-wider mb-3">
          Configured Issuing Authority Adapters (Demo Simulated)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {sources.map((src) => (
            <Card key={src.authority_type} padding="sm" className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-niyam-text line-clamp-1">{src.name}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-semantic-success bg-semantic-successBg px-1.5 py-0.5 rounded border border-semantic-successBorder">
                  <Radio className="w-2.5 h-2.5 text-semantic-success animate-pulse" />
                  <span>{src.status}</span>
                </span>
              </div>
              <div className="text-[11px] text-niyam-secondary font-mono truncate">
                {src.endpoint}
              </div>
              <div className="pt-2 border-t border-niyam-border flex items-center justify-between text-[11px] text-niyam-secondary">
                <span>Latency: {src.avg_latency_ms}ms</span>
                <span>Success: {src.success_rate_24h}%</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <Card padding="sm" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-niyam-secondary" />
          <span className="text-niyam-secondary font-medium">Filter by Result:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-xs bg-white text-niyam-text"
          >
            <option value="">All Verification Records ({queue.length})</option>
            <option value="VERIFIED">Verified Authentic (Authoritative)</option>
            <option value="MISMATCH_DETECTED">Mismatch Detected</option>
            <option value="SOURCE_UNAVAILABLE">Source Unavailable (Non-Adverse)</option>
            <option value="MANUAL_REVIEW_REQUIRED">Manual Review Required</option>
            <option value="MANUAL_CONFIRMED">Manual Confirmation Recorded</option>
          </select>
        </div>
        <span className="text-niyam-secondary text-[11px]">
          Showing {queue.length} asynchronous verification jobs
        </span>
      </Card>

      {/* Verification Queue Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-niyam-secondary font-semibold border-b border-niyam-border">
              <tr>
                <th className="px-4 py-3">Reference / Target</th>
                <th className="px-4 py-3">Authority Adapter</th>
                <th className="px-4 py-3">Result Dimension</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Provenance / Authority Summary</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-niyam-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-niyam-secondary">
                    Loading verification records...
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <StateFeedback
                      state="empty"
                      title="No Verification Records"
                      description="No external verification requests match the active filter criteria."
                    />
                  </td>
                </tr>
              ) : (
                queue.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-niyam-text block">
                        {req.request_reference}
                      </span>
                      <span className="text-xs text-niyam-secondary font-mono">
                        Application: {req.application_id || "app-001"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-niyam-text block">
                        {req.authority_type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-niyam-secondary truncate max-w-[180px] block font-mono">
                        {req.source_endpoint}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge dimension="source_verification" value={req.status} />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-niyam-secondary">
                      {req.latency_ms} ms
                    </td>
                    <td className="px-4 py-3.5 text-niyam-text max-w-sm">
                      <p className="text-xs line-clamp-2 leading-relaxed">
                        {req.response_summary}
                      </p>
                      {req.status === "MISMATCH_DETECTED" && req.mismatched_fields && (
                        <div className="mt-1 text-[11px] font-mono text-semantic-error bg-semantic-errorBg p-1.5 rounded border border-semantic-errorBorder">
                          Mismatch: {JSON.stringify(req.mismatched_fields)}
                        </div>
                      )}
                      {req.status === "MANUAL_CONFIRMED" && req.supporting_evidence_ref && (
                        <div className="mt-1 text-[11px] font-mono text-sky-800 bg-sky-50 p-1.5 rounded border border-sky-200">
                          Evidence Ref: {req.supporting_evidence_ref}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {["SOURCE_UNAVAILABLE", "MANUAL_REVIEW_REQUIRED", "PENDING"].includes(req.status) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                          onClick={() => setManualModalItem(req)}
                        >
                          Confirm Manually
                        </Button>
                      ) : (
                        <span className="text-xs text-niyam-secondary font-mono">
                          {new Date(req.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Confirmation Modal */}
      {manualModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-niyam-border max-w-lg w-full p-6 shadow-dialog space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-5 h-5 text-niyam-accent" />
                <h3 className="text-base sm:text-lg font-bold text-niyam-text">
                  Statutory Manual Confirmation
                </h3>
              </div>
              <p className="text-xs text-niyam-secondary">
                Record an authorized scrutiny confirmation when an external issuing registry is offline or requires human inspection.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-niyam-border text-xs space-y-1">
              <div>
                <strong>Authority Target:</strong> {manualModalItem.authority_type.replace(/_/g, " ")}
              </div>
              <div>
                <strong>Reference ID:</strong> <span className="font-mono">{manualModalItem.request_reference}</span>
              </div>
              <div>
                <strong>Reason for Manual Path:</strong> {manualModalItem.response_summary}
              </div>
            </div>

            <form onSubmit={handleManualConfirmationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-niyam-text block mb-1">
                  Supporting Physical / Document Evidence Reference <span className="text-semantic-error">*</span>
                </label>
                <input
                  type="text"
                  value={evidenceRef}
                  onChange={(e) => setEvidenceRef(e.target.value)}
                  placeholder="e.g. Physical Stamped Register Folio #492 or Direct Email Confirmation from Tehsildar"
                  required
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-niyam-text block mb-1">
                  Official Confirmation Justification <span className="text-semantic-error">*</span>
                </label>
                <textarea
                  rows={3}
                  value={confirmationReason}
                  onChange={(e) => setConfirmationReason(e.target.value)}
                  placeholder="State the regulatory grounds under which this document validity was established..."
                  required
                  className="w-full text-xs sm:text-sm p-3 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
                />
              </div>

              <div className="p-2.5 bg-blue-50/70 rounded border border-blue-200 text-blue-900 text-xs">
                <strong>Statutory Traceability:</strong> This action will be cryptographically signed with your officer credentials and permanently logged to the SHA-256 audit ledger.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-niyam-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setManualModalItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submittingConfirmation}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Record Statutory Confirmation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
