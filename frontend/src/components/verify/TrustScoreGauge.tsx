"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, ShieldAlert, Award, CheckCircle2, XCircle } from "lucide-react";

interface PillarScore {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  passed: boolean;
}

interface TrustScoreGaugeProps {
  score: number;
  pillars?: PillarScore[];
  statusLabel?: string;
  showPillars?: boolean;
}

export function TrustScoreGauge({
  score,
  pillars = [
    {
      name: "Document Integrity & Hash",
      score: 25,
      maxScore: 25,
      description: "Cryptographic SHA-256 digest & tamper verification",
      passed: true,
    },
    {
      name: "Issuing Authority Ledger",
      score: 25,
      maxScore: 25,
      description: "Cross-checked with state registry & university portal",
      passed: true,
    },
    {
      name: "AICTE APH 2025 Norms",
      score: 25,
      maxScore: 25,
      description: "Faculty ratio 1:15, intake quotas & built-up area",
      passed: true,
    },
    {
      name: "Seal & Signature Provenance",
      score: 25,
      maxScore: 25,
      description: "Digital X.509 PKI certificate & ink stamp verification",
      passed: true,
    },
  ],
  statusLabel,
  showPillars = true,
}: TrustScoreGaugeProps) {
  const getTheme = (val: number) => {
    if (val >= 90) {
      return {
        stroke: "#10B981", // emerald-500
        text: "text-emerald-600 dark:text-emerald-400",
        badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
        badgeText: "text-emerald-700 dark:text-emerald-300",
        label: "Regulatory Compliant (Verified)",
        icon: ShieldCheck,
      };
    }
    if (val >= 70) {
      return {
        stroke: "#F59E0B", // amber-500
        text: "text-amber-600 dark:text-amber-400",
        badgeBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
        badgeText: "text-amber-700 dark:text-amber-300",
        label: "Discrepancies Observed (Review)",
        icon: AlertTriangle,
      };
    }
    return {
      stroke: "#EF4444", // rose-500
      text: "text-rose-600 dark:text-rose-400",
      badgeBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
      badgeText: "text-rose-700 dark:text-rose-300",
      label: "Tampered / High Risk (Rejected)",
      icon: ShieldAlert,
    };
  };

  const theme = getTheme(score);
  const StatusIcon = theme.icon;

  // SVG Circular calculation
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-xs space-y-6 transition-colors">
      {/* Header with Title and Overall Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>AICTE Statutory Trust Score</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Holistic compliance rating computed across cryptographic, registry, and APH norm vectors
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold self-start sm:self-auto ${theme.badgeBg} ${theme.badgeText}`}
        >
          <StatusIcon className="w-4 h-4" />
          <span>{statusLabel || theme.label}</span>
        </div>
      </div>

      {/* Main Circular Gauge & Summary */}
      <div className="flex flex-col md:flex-row items-center gap-6 justify-around">
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90 drop-shadow-xs" viewBox="0 0 140 140">
            {/* Background Track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Dynamic Progress Circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={theme.stroke}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Score Readout */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-4xl font-extrabold font-mono tracking-tight ${theme.text}`}>
              {score}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Out of 100
            </span>
          </div>
        </div>

        {/* Narrative Evaluation */}
        <div className="flex-1 max-w-md space-y-2 text-center md:text-left">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Confidence Assessment
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {score >= 90
              ? "All cryptographic digests, registry records, and infrastructure ratios fully align with AICTE Approval Process Handbook (APH 2025-26) requirements. No anomalies detected."
              : score >= 70
              ? "Minor discrepancies detected in statutory disclosures or pending affiliation renewal. Officer scrutiny recommended before final issuance."
              : "Critical anomalies identified: Document content contradicts authoritative database records or displays signatures with invalid cryptographic checksums."}
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-500 font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              SHA-256 Verified
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              DigiLocker Synced
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              APH Engine v2.4
            </span>
          </div>
        </div>
      </div>

      {/* 4 Pillars Breakdown */}
      {showPillars && (
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Four-Pillar Regulatory Score Breakdown
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pillars.map((pillar) => {
              const pct = (pillar.score / pillar.maxScore) * 100;
              return (
                <div
                  key={pillar.name}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {pillar.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      )}
                      <span>{pillar.name}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {pillar.score}/{pillar.maxScore}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct === 100
                          ? "bg-emerald-500"
                          : pct >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
