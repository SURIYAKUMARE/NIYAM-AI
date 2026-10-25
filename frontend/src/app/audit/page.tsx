"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ContextPanel } from "@/components/stitch/ContextPanel";
import {
  History,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Lock,
  Download,
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
      setLogs(logsData || []);
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
      <ContextPanel
        title="Independent Regulatory Oversight Desk"
        subtitle={`Welcome, ${user?.full_name || "Statutory Auditor"} (${user?.role || "auditor"}) — Inspect tamper-evident SHA-256 cryptographic ledgers, verify provenance chains, and export oversight reports.`}
        badge="Auditor Oversight"
      >
        <div className="flex items-center gap-2">
          <Link
            href="/analytics"
            className="px-3 py-1.5 bg-white border border-[#E3E8EE] hover:bg-[#F7F9FB] text-[#14202B] text-xs font-semibold rounded-lg shadow-xs transition"
          >
            Analytics
          </Link>
          <button
            onClick={() => {
              const dataStr =
                "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(logs, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute(
                "download",
                `Audit_Ledger_Export_${new Date().toISOString().slice(0, 10)}.json`
              );
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-3 py-1.5 bg-white border border-[#E3E8EE] hover:bg-[#F7F9FB] text-[#14202B] text-xs font-semibold rounded-lg shadow-xs transition"
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
            className="px-3 py-1.5 bg-white border border-[#E3E8EE] hover:bg-[#F7F9FB] text-[#14202B] text-xs font-semibold rounded-lg shadow-xs transition"
          >
            Export CSV
          </button>
          <button
            onClick={loadAuditData}
            className="p-2 text-[#5B6B7A] hover:text-[#14202B] hover:bg-[#F7F9FB] rounded-lg border border-[#E3E8EE] transition"
            title="Refresh Audit Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </ContextPanel>

      {/* Cryptographic Chain Integrity Verification Banner */}
      {chainStatus && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#090D16] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-300 text-xs">
                  {chainStatus.status === "VERIFIED_TAMPER_EVIDENT"
                    ? "Cryptographic Chain Verified Intact"
                    : "Chain Integrity Anomaly"}
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono text-white">
                  {chainStatus.verified_records} Blocks Verified
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Every record is hashed and chained with the preceding block. Tamper-evident verification active.
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] font-mono text-slate-400 shrink-0">
            <div>
              Latest Block: <span className="text-white font-bold">{chainStatus.latest_block_hash?.slice(0, 16)}...</span>
            </div>
            <div>
              Genesis Block: <span className="text-slate-400">GENESIS_BLOCK_2025</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, actor, or entity..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition border border-slate-200 dark:border-slate-700"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400 font-semibold">Event Category:</span>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none text-xs"
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
      <div className="bg-white rounded-xl border border-[#E3E8EE] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FB] text-[#5B6B7A] font-bold text-[10px] uppercase tracking-wider border-b border-[#E3E8EE]">
              <tr>
                <th className="px-5 py-3">Timestamp (UTC)</th>
                <th className="px-5 py-3">Actor & Role</th>
                <th className="px-5 py-3">Event Type</th>
                <th className="px-5 py-3">Action Description & Target</th>
                <th className="px-5 py-3 text-right">Cryptographic SHA-256 Block</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]/70">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#5B6B7A]">
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#5B6B7A]">
                    No audit log entries found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F7F9FB]/60 transition">
                    <td className="px-5 py-3.5 font-mono text-[#5B6B7A] text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-[#14202B]">{log.actor_username}</div>
                      <span className="text-[10px] text-[#5B6B7A] uppercase font-mono">{log.actor_role}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-[10px] bg-[#F7F9FB] text-[#14202B] px-2 py-0.5 rounded border border-[#E3E8EE]">
                        {log.event_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#14202B]">
                      <div className="font-semibold text-[#14202B]">{log.action}</div>
                      <div className="text-[11px] text-[#5B6B7A] mt-0.5">
                        Target: {log.entity_type} ({log.entity_id}) · IP: {log.ip_address}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
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
    </div>
  );
}
