import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "application" | "finding" | "verification" | "rule";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = "application", className = "" }) => {
  let badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700";
  let label = status.replace(/_/g, " ");

  // Application Statuses
  if (type === "application") {
    switch (status) {
      case "PRELIMINARY_CHECK_PASSED":
      case "APPROVED_BY_AUTHORITY":
        badgeStyle = "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
        label = status === "PRELIMINARY_CHECK_PASSED" ? "Preliminary Check: Passed" : "Approved by AICTE Authority";
        break;
      case "DEFICIENCIES_DETECTED":
        badgeStyle = "bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800";
        label = "Deficiencies Detected";
        break;
      case "UNDER_SCRUTINY":
      case "SUBMITTED_FOR_SCRUTINY":
        badgeStyle = "bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800";
        label = status === "UNDER_SCRUTINY" ? "Under Official Scrutiny" : "Submitted for Scrutiny";
        break;
      case "CLARIFICATION_REQUESTED":
        badgeStyle = "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
        label = "Clarification Requested";
        break;
      case "RECOMMENDED_FOR_INSPECTION":
        badgeStyle = "bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800";
        label = "Physical Inspection Required";
        break;
      case "RECOMMENDED_FOR_APPROVAL":
        badgeStyle = "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800";
        label = "Recommended for Approval";
        break;
      case "REJECTED_BY_AUTHORITY":
        badgeStyle = "bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800";
        label = "Rejected by Authority";
        break;
      case "RESUBMITTED":
        badgeStyle = "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800";
        label = "Resubmitted (V2 Rectified)";
        break;
      default:
        badgeStyle = "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700";
        label = "Draft";
    }
  }

  // Finding Severities & Statuses
  if (type === "finding") {
    switch (status) {
      case "CRITICAL":
        badgeStyle = "bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold";
        label = "CRITICAL DEFICIENCY";
        break;
      case "MAJOR":
        badgeStyle = "bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800 font-semibold";
        label = "MAJOR DEFICIENCY";
        break;
      case "MODERATE":
        badgeStyle = "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold";
        label = "MODERATE DEFICIENCY";
        break;
      case "MINOR":
        badgeStyle = "bg-yellow-100 dark:bg-yellow-950/70 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800";
        label = "MINOR OBSERVATION";
        break;
      case "RECTIFIED":
      case "RESOLVED":
        badgeStyle = "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold";
        label = "RECTIFIED & VERIFIED";
        break;
      case "OPEN":
        badgeStyle = "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold";
        label = "OPEN";
        break;
      case "WAIVED":
        badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700";
        label = "WAIVED BY AUTHORITY";
        break;
      default:
        badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700";
    }
  }

  // Verification Item Statuses
  if (type === "verification") {
    switch (status) {
      case "AUTHENTIC":
      case "VERIFIED":
        badgeStyle = "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold";
        label = "AUTHENTICATED";
        break;
      case "TAMPERED":
      case "ALTERED":
        badgeStyle = "bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold animate-pulse";
        label = "TAMPERED ANOMALY";
        break;
      case "EXPIRED":
        badgeStyle = "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold";
        label = "EXPIRED RECORD";
        break;
      case "SOURCE_UNREACHABLE":
        badgeStyle = "bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800";
        label = "LEDGER OFFLINE";
        break;
      case "PENDING":
        badgeStyle = "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700";
        label = "PENDING CHECK";
        break;
      default:
        badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700";
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-2xs whitespace-nowrap ${badgeStyle} ${className}`}
    >
      {label}
    </span>
  );
};
