"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export interface MismatchItem {
  fieldName: string;
  category: "Intake" | "Affiliation" | "Infrastructure" | "Mandatory Disclosure" | "Signature" | "Security";
  extractedValue: string;
  expectedValue: string;
  status: "MATCH" | "TAMPERED" | "EXPIRED" | "MISSING";
  severity: "CRITICAL" | "MAJOR" | "MODERATE" | "LOW" | "PASSED";
  ruleCitation?: string;
  explanation: string;
}

interface MismatchHighlighterProps {
  items: MismatchItem[];
}

export function MismatchHighlighter({ items }: MismatchHighlighterProps) {
  const getStatusBadge = (status: MismatchItem["status"]) => {
    switch (status) {
      case "MATCH":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            MATCH
          </span>
        );
      case "TAMPERED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            TAMPERED
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            EXPIRED
          </span>
        );
      case "MISSING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <XCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            MISSING
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: MismatchItem["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white shadow-2xs">
            CRITICAL
          </span>
        );
      case "MAJOR":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-600 text-white shadow-2xs">
            MAJOR
          </span>
        );
      case "MODERATE":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-500 text-slate-900 shadow-2xs">
            MODERATE
          </span>
        );
      case "LOW":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500 text-white shadow-2xs">
            LOW
          </span>
        );
      case "PASSED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white shadow-2xs">
            PASSED
          </span>
        );
    }
  };

  const anomaliesCount = items.filter((i) => i.status !== "MATCH").length;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>AICTE Cross-Check &amp; Mismatch Highlighter</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Side-by-side verification: Extracted document values vs Authoritative regulatory registry
          </p>
        </div>

        <div className="flex items-center gap-2">
          {anomaliesCount === 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Fields Verified Match (0 Anomalies)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              {anomaliesCount} Discrepanc{anomaliesCount === 1 ? "y" : "ies"} Flagged
            </span>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Field / Parameter</th>
              <th className="py-3 px-4">Document Value (OCR Extracted)</th>
              <th className="py-3 px-4">Registry Record (Expected)</th>
              <th className="py-3 px-4">Verification Status</th>
              <th className="py-3 px-4">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item, idx) => {
              const isAnomaly = item.status !== "MATCH";
              return (
                <React.Fragment key={idx}>
                  <tr
                    className={`transition-colors ${
                      isAnomaly
                        ? "bg-rose-50/30 dark:bg-rose-950/15 hover:bg-rose-50/50 dark:hover:bg-rose-950/25"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{item.fieldName}</div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium">
                      <span
                        className={`px-2 py-0.5 rounded text-xs inline-block ${
                          isAnomaly
                            ? "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 font-bold line-through"
                            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
                        }`}
                      >
                        {item.extractedValue}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium">
                      <span className="px-2 py-0.5 rounded text-xs inline-block bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">
                        {item.expectedValue}
                      </span>
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>

                    <td className="py-3 px-4">{getSeverityBadge(item.severity)}</td>
                  </tr>

                  {/* If anomaly, render explanatory row with citation */}
                  {isAnomaly && (
                    <tr className="bg-rose-50/40 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-900/30">
                      <td colSpan={5} className="py-2.5 px-4">
                        <div className="flex items-start gap-2 text-rose-900 dark:text-rose-200 text-xs">
                          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-semibold leading-relaxed">
                              {item.explanation}
                            </p>
                            {item.ruleCitation && (
                              <p className="text-[10px] font-mono text-rose-700 dark:text-rose-300">
                                Regulatory Basis: {item.ruleCitation}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
