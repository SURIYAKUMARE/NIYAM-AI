"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/common/StatusBadge";
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
  Radio
} from "lucide-react";

export default function VerificationQueuePage() {
  const [sources, setSources] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Issuing Authority Integration Hub
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Verification Queue & Source Adapters
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of pluggable government APIs, digital repositories, Land registries, and fee gateways
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition self-start md:self-auto"
          title="Refresh Verification Records"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Issuing Authority Adapters Status Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Configured Issuing Authority Adapters (Demo Simulated)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {sources.map((src) => (
            <div key={src.authority_type} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 line-clamp-1">{src.name}</span>
                <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                  <span>{src.status}</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate">
                {src.endpoint}
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Latency: {src.avg_latency_ms}ms</span>
                <span>Success: {src.success_rate_24h}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
          >
            <option value="">All Verification Results ({queue.length})</option>
            <option value="VERIFIED">Verified Authentic</option>
            <option value="MISMATCH_DETECTED">Mismatch Detected</option>
            <option value="EXPIRED">Certificate Expired</option>
            <option value="SOURCE_UNAVAILABLE">Source Unavailable (Non-Adverse)</option>
            <option value="MANUAL_REVIEW_REQUIRED">Manual Review Required</option>
          </select>
        </div>
        <span className="text-slate-400 text-[11px]">
          Statutory Rule: An unavailable source is never treated as an invalid document.
        </span>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Request Reference</th>
              <th className="px-6 py-3">Authority Adapter</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Latency</th>
              <th className="px-6 py-3">Provenance / Authority Summary</th>
              <th className="px-6 py-3 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Loading verification records...
                </td>
              </tr>
            ) : queue.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No verification requests recorded matching filter.
                </td>
              </tr>
            ) : (
              queue.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3.5 font-mono font-bold text-slate-800">
                    {req.request_reference}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-semibold text-slate-900 block">
                      {req.authority_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[200px] block">
                      {req.source_endpoint}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={req.status} type="verification" />
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-600">
                    {req.latency_ms} ms
                  </td>
                  <td className="px-6 py-3.5 text-slate-700 max-w-md">
                    <p className="text-xs line-clamp-2 leading-relaxed">
                      {req.response_summary}
                    </p>
                    {req.status === "MISMATCH_DETECTED" && req.mismatched_fields && (
                      <div className="mt-1 text-[11px] font-mono text-rose-700 bg-rose-50 p-1 rounded border border-rose-200">
                        Mismatch: {JSON.stringify(req.mismatched_fields)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-slate-400 text-[11px]">
                    {new Date(req.timestamp).toLocaleTimeString()}
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
