"use client";

import React from "react";
import { Activity, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export interface MetricCard {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon?: React.ElementType;
  tone?: "blue" | "teal" | "amber" | "rose" | "emerald" | "slate";
}

interface SummaryBandProps {
  metrics: MetricCard[];
  className?: string;
}

export const SummaryBand: React.FC<SummaryBandProps> = ({
  metrics,
  className = "",
}) => {
  const getToneIndicator = (tone?: MetricCard["tone"]) => {
    switch (tone) {
      case "amber":
        return {
          dot: "bg-amber-500 ring-amber-200 dark:ring-amber-900",
          val: "text-slate-900 dark:text-white",
          badge: "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
      case "rose":
        return {
          dot: "bg-rose-500 ring-rose-200 dark:ring-rose-900",
          val: "text-rose-600 dark:text-rose-400",
          badge: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        };
      case "emerald":
        return {
          dot: "bg-emerald-500 ring-emerald-200 dark:ring-emerald-900",
          val: "text-slate-900 dark:text-white",
          badge: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "blue":
      case "teal":
      default:
        return {
          dot: "bg-blue-600 ring-blue-200 dark:ring-blue-900",
          val: "text-slate-900 dark:text-white",
          badge: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        };
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${className}`}>
      {metrics.map((m, idx) => {
        const toneStyle = getToneIndicator(m.tone);

        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between group"
          >
            {/* Header: Label + Status Dot */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {m.label}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`w-2 h-2 rounded-full ring-2 ${toneStyle.dot}`}
                />
              </div>
            </div>

            {/* Main Value: Large Tabular Typography */}
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <div
                  className={`text-3xl font-extrabold font-mono tracking-tight tabular-nums ${toneStyle.val}`}
                >
                  {m.value}
                </div>
                {m.trend && (
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${toneStyle.badge}`}
                  >
                    {m.trendDirection === "up" && <ArrowUpRight className="w-3 h-3" />}
                    {m.trendDirection === "down" && <ArrowDownRight className="w-3 h-3" />}
                    {m.trendDirection === "neutral" && <Minus className="w-3 h-3" />}
                    <span>{m.trend}</span>
                  </span>
                )}
              </div>

              {/* Context Footer */}
              {m.subtext && (
                <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 truncate pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="truncate">{m.subtext}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
