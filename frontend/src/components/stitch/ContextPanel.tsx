"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

interface ContextPanelProps {
  title?: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  badge?: string;
  children?: React.ReactNode;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  title = "Institutional Application Review",
  subtitle = "AICTE Regulation Bureau administrative workspace for statutory compliance, credential verification, and official scrutiny.",
  actionText,
  actionHref,
  onActionClick,
  badge,
  children,
}) => {
  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs mb-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Action Button or custom controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {children}

          {actionText && actionHref && (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{actionText}</span>
            </Link>
          )}

          {actionText && !actionHref && onActionClick && (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
