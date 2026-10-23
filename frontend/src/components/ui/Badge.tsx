import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  HelpCircle,
  ShieldAlert,
  ServerCrash,
  UserCheck,
  FileSearch,
  Lock,
} from "lucide-react";

export type StatusDimension =
  | "workflow"
  | "processing"
  | "extraction"
  | "source_verification"
  | "validity"
  | "finding"
  | "human_review"
  | "decision";

interface StatusBadgeProps {
  dimension: StatusDimension;
  value: string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  dimension,
  value,
  className = "",
  showIcon = true,
}) => {
  const norm = (value || "").toLowerCase().trim();

  // Dimension 1: Source Verification
  // Critical Rule: A source outage must NEVER look like a failed authenticity check!
  if (dimension === "source_verification") {
    if (norm === "verified" || norm === "confirmed") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
          <span>Verified (Authoritative)</span>
        </span>
      );
    }
    if (norm === "mismatch_detected" || norm === "mismatch") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-red-50 text-red-800 border border-red-300 ${className}`}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />}
          <span>Mismatch Detected</span>
        </span>
      );
    }
    if (norm === "source_unavailable" || norm === "unavailable" || norm === "timeout") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 ${className}`}
          title="Service outage: Authenticity remains undetermined, NOT a verification failure"
        >
          {showIcon && <ServerCrash className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />}
          <span>Source Unavailable (Retry/Manual)</span>
        </span>
      );
    }
    if (norm === "manual_review_required" || norm === "manual_confirmed") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-sky-50 text-sky-900 border border-sky-300 ${className}`}
        >
          {showIcon && <UserCheck className="w-3.5 h-3.5 text-sky-700 flex-shrink-0" />}
          <span>Manual Confirmation</span>
        </span>
      );
    }
    if (norm === "pending") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-slate-500 animate-spin flex-shrink-0" />}
          <span>Verification Pending</span>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
      >
        {showIcon && <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
        <span>Not Checked</span>
      </span>
    );
  }

  // Dimension 2: Regulatory Findings
  if (dimension === "finding") {
    if (norm === "critical" || norm === "critical_deficiency") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-red-50 text-red-900 border border-red-300 ${className}`}
        >
          {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />}
          <span>Critical Deficiency</span>
        </span>
      );
    }
    if (norm === "warning" || norm === "non_compliance") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
          <span>Non-Compliance</span>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200 ${className}`}
      >
        {showIcon && <HelpCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
        <span>Advisory Notice</span>
      </span>
    );
  }

  // Dimension 3: Document Validity & Expiry
  if (dimension === "validity") {
    if (norm === "valid") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />}
          <span>Valid Document</span>
        </span>
      );
    }
    if (norm === "expiring_soon") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300 ${className}`}
        >
          {showIcon && <Clock className="w-3 h-3 text-amber-600 flex-shrink-0" />}
          <span>Expiring Soon</span>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-800 border border-red-200 ${className}`}
      >
        {showIcon && <XCircle className="w-3 h-3 text-red-600 flex-shrink-0" />}
        <span>Expired Validity</span>
      </span>
    );
  }

  // Dimension 4: Extraction Uncertainty
  if (dimension === "extraction") {
    const num = parseFloat(value) || 0;
    if (num >= 0.85 || norm === "high") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />}
          <span>{(num * 100).toFixed(0)}% High Conf.</span>
        </span>
      );
    }
    if (num >= 0.7 || norm === "medium") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />}
          <span>{(num * 100).toFixed(0)}% Review Advised</span>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-red-50 text-red-800 border border-red-200 ${className}`}
      >
        {showIcon && <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0" />}
        <span>Low Conf. (Human Correction Req.)</span>
      </span>
    );
  }

  // Dimension 5: Official Statutory Decision
  if (dimension === "decision") {
    if (norm === "approved") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-400 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />}
          <span>STATUTORY APPROVED</span>
        </span>
      );
    }
    if (norm === "approved_with_deficiencies") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-400 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />}
          <span>APPROVAL WITH DEFICIENCIES</span>
        </span>
      );
    }
    if (norm === "rejected") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-red-100 text-red-900 border border-red-400 ${className}`}
        >
          {showIcon && <XCircle className="w-4 h-4 text-red-700 flex-shrink-0" />}
          <span>STATUTORY REJECTED</span>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}
      >
        {showIcon && <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />}
        <span>Pending Competent Review</span>
      </span>
    );
  }

  // Default / Workflow Status
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium capitalize bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
    >
      <span>{norm.replace(/_/g, " ")}</span>
    </span>
  );
};
