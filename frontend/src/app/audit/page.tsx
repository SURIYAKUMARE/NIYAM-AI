"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  History,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Lock,
  ExternalLink
} from "lucide-react";

export default function AuditHistoryPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [chainStatus, setChainStatus] = useState<any>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventTypeFilter) params.append("event_type", eventTypeFilter);
      if (searchQuery) params.append("search", searchQuery);

      const [logsData, chainData] = await Promise.all([
        fetchApi(`/audit?${params.toString()}`),
        fetchApi("/audit/verify-chain"),
      ]);
      setLogs(logsData);
      setChainStatus(chainData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, [eventTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAuditData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Statutory Oversight & Traceability
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Append-Only Audit History & Provenance Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically chained SHA-256 historical log of all uploads, OCR extractions, rule runs, corrections, and authority decisions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `Audit_Ledger_Export_${new Date().toISOString().slice(0, 10)}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-sm"
          >
            Export JSON
          </button>
          <button
            onClick={() => {
              const headers = "ID,Timestamp,Actor,Role,EventType,Action,Entity,RecordHash\n";
              const rows = logs
                .map(
                  (l) =>
                    `"${l.id}","${l.timestamp}","${l.actor_username}","${l.actor_role}","${l.event_type}","${l.action?.replace(/"/g, '""')}","${l.entity_type}","${l.record_hash}"`
                )
                .join("\n");
              const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `Audit_Ledger_Export_${new Date().toISOString().slice(0, 10)}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
            }}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-sm"
          >
            Export CSV
          </button>
          <button
            onClick={loadAuditData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition self-start md:self-auto"
            title="Refresh Audit Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Cryptographic Chain Integrity Verification Banner */}
      {chainStatus && (
        <div className="p-4 rounded-lg bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-slate-800 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-emerald-400">
                  {chainStatus.status === "VERIFIED_TAMPER_EVIDENT" ? "Cryptographic Chain Verified Intact" : "Chain Integrity Anomaly"}
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                  {chainStatus.verified_records} Blocks Verified
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Every record is hashed and salted with the preceding record block. Tamper-evident chaining active.
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] font-mono text-slate-400">
            <div>Latest Block Hash: <span className="text-slate-200">{chainStatus.latest_block_hash?.slice(0, 16)}...</span></div>
            <div>Genesis Block: <span className="text-slate-400">GENESIS_BLOCK_2025</span></div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-80">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, actor, or entity..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Event Category:</span>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
          >
            <option value="">All Event Categories ({logs.length})</option>
            <option value="APPLICATION_SUBMISSION">Application Submissions</option>
            <option value="DOCUMENT_UPLOAD">Document Uploads & Versions</option>
            <option value="COMPLIANCE_EVALUATION_RUN">Rule Evaluations</option>
            <option value="EXTRACTION_FIELD_CORRECTION">Extraction Field Corrections</option>
            <option value="FINDING_DISPOSITION_UPDATE">Finding Review Dispositions</option>
            <option value="AUTHORITY_SOURCE_VERIFICATION">Source Verification Invocations</option>
            <option value="CLARIFICATION_REQUESTED">Clarification Notices</option>
            <option value="STATUTORY_REVIEW_ACTION">Statutory Review Actions</option>
            <option value="SENSITIVE_RECORD_ACCESS">Sensitive Record Access</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Timestamp (UTC)</th>
              <th className="px-6 py-3">Actor & Role</th>
              <th className="px-6 py-3">Event Type</th>
              <th className="px-6 py-3">Action Description & Target</th>
              <th className="px-6 py-3 text-right">Cryptographic SHA-256 Block</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  No audit log entries found matching criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{log.actor_username}</div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{log.actor_role}</span>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {log.event_type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-700">
                    <div className="font-medium text-slate-900">{log.action}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Target: {log.entity_type} ({log.entity_id}) | IP: {log.ip_address}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {log.record_hash?.slice(0, 16)}...
                    </span>
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
