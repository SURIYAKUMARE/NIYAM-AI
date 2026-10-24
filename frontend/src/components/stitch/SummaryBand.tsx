"use client";

import React from "react";
import { FileText, Clock, AlertTriangle, CheckCircle2, ShieldCheck, Activity } from "lucide-react";

export interface MetricCard {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
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
  const getToneStyle = (tone?: MetricCard["tone"]) => {
    switch (tone) {
      case "amber":
        return {
          iconBg: "bg-amber-50 text-amber-700 border-amber-200",
          valColor: "text-amber-700",
        };
      case "rose":
        return {
          iconBg: "bg-rose-50 text-rose-700 border-rose-200",
          valColor: "text-rose-700",
        };
      case "emerald":
        return {
          iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          valColor: "text-emerald-700",
        };
      case "teal":
      default:
        return {
          iconBg: "bg-teal-50 text-[#0F6B6B] border-teal-200",
          valColor: "text-[#0F6B6B]",
        };
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${className}`}>
      {metrics.map((m, idx) => {
        const toneStyle = getToneStyle(m.tone);
        const Icon = m.icon || Activity;

        return (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-[#E3E8EE] shadow-xs hover:border-[#0F6B6B]/40 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-[#5B6B7A] truncate">
                {m.label}
              </span>
              <div className={`p-1.5 rounded-lg border text-xs shrink-0 ${toneStyle.iconBg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className={`text-2xl font-bold tabular-nums tracking-tight ${toneStyle.valColor}`}>
                {m.value}
              </div>
              {m.subtext && (
                <div className="text-[11px] text-[#5B6B7A] mt-1 flex items-center gap-1.5 truncate">
                  <span>{m.subtext}</span>
                  {m.trend && (
                    <span className="font-semibold text-[#14202B]">· {m.trend}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
