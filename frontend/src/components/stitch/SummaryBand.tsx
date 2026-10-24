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
  tone?: "teal" | "amber" | "rose" | "emerald" | "slate";
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
          dot: "bg-amber-500 ring-amber-200",
          val: "text-[#14202B]",
          badge: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "rose":
        return {
          dot: "bg-rose-500 ring-rose-200",
          val: "text-rose-700",
          badge: "bg-rose-50 text-rose-700 border-rose-200",
        };
      case "emerald":
        return {
          dot: "bg-emerald-500 ring-emerald-200",
          val: "text-[#14202B]",
          badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "teal":
      default:
        return {
          dot: "bg-[#0F6B6B] ring-teal-200",
          val: "text-[#14202B]",
          badge: "bg-teal-50 text-[#0F6B6B] border-teal-200",
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
            className="bg-white p-5 rounded-xl border border-[#E3E8EE] shadow-xs hover:border-[#0F6B6B]/50 transition-all flex flex-col justify-between group"
          >
            {/* Header: Label + Status Dot */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B7A] truncate">
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
                <div className="text-[11px] text-[#5B6B7A] flex items-center gap-1 truncate pt-1 border-t border-[#E3E8EE]/50">
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
