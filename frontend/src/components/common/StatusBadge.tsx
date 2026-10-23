import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "application" | "finding" | "verification" | "rule";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = "application", className = "" }) => {
  let badgeStyle = "bg-slate-100 text-slate-800 border-slate-300";
  let label = status.replace(/_/g, " ");

  // Application Statuses
  if (type === "application") {
    switch (status) {
      case "PRELIMINARY_CHECK_PASSED":
      case "APPROVED_BY_AUTHORITY":
        badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-300";
        label = status === "PRELIMINARY_CHECK_PASSED" ? "Preliminary Check: Passed" : "Approved by AICTE Authority";
        break;
      case "DEFICIENCIES_DETECTED":
        badgeStyle = "bg-rose-50 text-rose-800 border-rose-300";
        label = "Deficiencies Detected";
        break;
      case "UNDER_SCRUTINY":
      case "SUBMITTED_FOR_SCRUTINY":
        badgeStyle = "bg-blue-50 text-blue-800 border-blue-300";
        label = status === "UNDER_SCRUTINY" ? "Under Official Scrutiny" : "Submitted for Scrutiny";
        break;
      case "CLARIFICATION_REQUESTED":
        badgeStyle = "bg-amber-50 text-amber-800 border-amber-300";
        label = "Clarification Requested";
        break;
      case "RECOMMENDED_FOR_INSPECTION":
        badgeStyle = "bg-purple-50 text-purple-800 border-purple-300";
        label = "Physical Inspection Required";
        break;
      case "RECOMMENDED_FOR_APPROVAL":
        badgeStyle = "bg-teal-50 text-teal-800 border-teal-300";
        label = "Recommended for Approval";
        break;
      case "REJECTED_BY_AUTHORITY":
        badgeStyle = "bg-red-50 text-red-800 border-red-300";
        label = "Rejected by Authority";
        break;
      case "RESUBMITTED":
        badgeStyle = "bg-cyan-50 text-cyan-800 border-cyan-300";
        label = "Resubmitted (V2 Rectified)";
        break;
      default:
        badgeStyle = "bg-slate-50 text-slate-700 border-slate-300";
        label = "Draft";
    }
  }

  // Finding Severities & Statuses
  if (type === "finding") {
    switch (status) {
      case "CRITICAL":
        badgeStyle = "bg-rose-100 text-rose-800 border-rose-300 font-semibold";
        label = "Critical Deficiency";
        break;
      case "MAJOR":
        badgeStyle = "bg-amber-100 text-amber-800 border-amber-300";
        label = "Major Advisory";
        break;
      case "MINOR":
        badgeStyle = "bg-blue-100 text-blue-800 border-blue-300";
        label = "Minor Discrepancy";
        break;
      case "ADVISORY":
        badgeStyle = "bg-slate-100 text-slate-800 border-slate-300";
        label = "Informational";
        break;
      case "RECTIFIED_BY_APPLICANT":
        badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-300";
        label = "Rectified (Resolved)";
        break;
      case "DISMISSED_BY_OFFICER":
        badgeStyle = "bg-slate-100 text-slate-600 border-slate-300 line-through";
        label = "Dismissed by Officer";
        break;
      case "CONFIRMED_BY_OFFICER":
        badgeStyle = "bg-red-100 text-red-800 border-red-300";
        label = "Confirmed by Officer";
        break;
      case "WAIVED_BY_AUTHORITY":
        badgeStyle = "bg-indigo-100 text-indigo-800 border-indigo-300";
        label = "Waived by Authority";
        break;
      case "OPEN":
        badgeStyle = "bg-rose-50 text-rose-700 border-rose-300";
        label = "Open Finding";
        break;
    }
  }

  // Verification Statuses
  if (type === "verification") {
    switch (status) {
      case "VERIFIED":
        badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-300";
        label = "Verified Authentic";
        break;
      case "MISMATCH_DETECTED":
        badgeStyle = "bg-rose-50 text-rose-800 border-rose-300";
        label = "Mismatch Detected";
        break;
      case "EXPIRED":
        badgeStyle = "bg-amber-50 text-amber-800 border-amber-300";
        label = "Certificate Expired";
        break;
      case "SOURCE_UNAVAILABLE":
        badgeStyle = "bg-slate-100 text-slate-700 border-slate-400";
        label = "Source Unavailable (Non-adverse)";
        break;
      case "MANUAL_REVIEW_REQUIRED":
        badgeStyle = "bg-purple-50 text-purple-800 border-purple-300";
        label = "Manual Review Required";
        break;
      case "VERIFICATION_PENDING":
        badgeStyle = "bg-blue-50 text-blue-700 border-blue-300";
        label = "Verification Pending";
        break;
      default:
        badgeStyle = "bg-slate-50 text-slate-700 border-slate-300";
        label = "Not Supported";
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
      role="status"
    >
      {label}
    </span>
  );
};
