"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Plus, ExternalLink } from "lucide-react";

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
    <div className="bg-white rounded-xl border border-[#E3E8EE] p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#14202B]">
              {title}
            </h1>
            {badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#0F6B6B] border border-teal-200">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-[#5B6B7A] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Action Button or custom controls */}
        <div className="flex items-center gap-2 shrink-0">
          {children}

          {actionText && actionHref && (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F6B6B] hover:bg-[#0a4f4f] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{actionText}</span>
            </Link>
          )}

          {actionText && !actionHref && onActionClick && (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F6B6B] hover:bg-[#0a4f4f] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
