import React from "react";
import {
  Inbox,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileQuestion,
  FileWarning,
  ServerCrash,
  ShieldBan,
  Lock,
  MessageSquare,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { Button } from "./Button";

export type InteractionStateType =
  | "empty"
  | "loading"
  | "success"
  | "validation_error"
  | "failed_upload"
  | "unreadable_document"
  | "low_confidence"
  | "unavailable_service"
  | "permission_denied"
  | "submission_locked"
  | "clarification_requested"
  | "revised_submission"
  | "session_expired";

interface StateFeedbackProps {
  state: InteractionStateType;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const StateFeedback: React.FC<StateFeedbackProps> = ({
  state,
  title,
  description,
  actionText,
  onAction,
  className = "",
}) => {
  const configs: Record<
    InteractionStateType,
    {
      icon: React.ElementType;
      defaultTitle: string;
      defaultDesc: string;
      colorClass: string;
      bgClass: string;
      borderClass: string;
    }
  > = {
    empty: {
      icon: Inbox,
      defaultTitle: "No Records Found",
      defaultDesc: "There are currently no items matching your filter or assigned queue.",
      colorClass: "text-slate-400",
      bgClass: "bg-slate-50",
      borderClass: "border-slate-200",
    },
    loading: {
      icon: Loader2,
      defaultTitle: "Processing Regulatory Evidence...",
      defaultDesc: "Running layout analysis, OCR extraction heuristics, and rule evaluation.",
      colorClass: "text-niyam-accent animate-spin",
      bgClass: "bg-niyam-accentLight/40",
      borderClass: "border-niyam-accentMuted",
    },
    success: {
      icon: CheckCircle2,
      defaultTitle: "Verification Completed",
      defaultDesc: "The document and application records satisfy regulatory validation criteria.",
      colorClass: "text-semantic-success",
      bgClass: "bg-semantic-successBg",
      borderClass: "border-semantic-successBorder",
    },
    validation_error: {
      icon: AlertCircle,
      defaultTitle: "Validation Deficiencies Flagged",
      defaultDesc: "One or more mandatory fields or regulatory thresholds failed evaluation.",
      colorClass: "text-semantic-error",
      bgClass: "bg-semantic-errorBg",
      borderClass: "border-semantic-errorBorder",
    },
    failed_upload: {
      icon: UploadCloud,
      defaultTitle: "Document Upload Failed",
      defaultDesc: "The file transmission was interrupted or the document format is unsupported.",
      colorClass: "text-semantic-error",
      bgClass: "bg-semantic-errorBg",
      borderClass: "border-semantic-errorBorder",
    },
    unreadable_document: {
      icon: FileQuestion,
      defaultTitle: "Unreadable or Corrupted Scan",
      defaultDesc: "OCR engine cannot extract text due to heavy skew, low DPI, or missing digital layer.",
      colorClass: "text-semantic-warning",
      bgClass: "bg-semantic-warningBg",
      borderClass: "border-semantic-warningBorder",
    },
    low_confidence: {
      icon: FileWarning,
      defaultTitle: "Low-Confidence Extraction",
      defaultDesc: "Extracted fields fall below the 75% confidence threshold. Human scrutiny required.",
      colorClass: "text-semantic-warning",
      bgClass: "bg-semantic-warningBg",
      borderClass: "border-semantic-warningBorder",
    },
    unavailable_service: {
      icon: ServerCrash,
      defaultTitle: "External Issuing Source Unavailable",
      defaultDesc: "The authoritative external registry (e.g. Land Revenue / University API) timed out. This is a technical connectivity issue, NOT a failed authenticity check.",
      colorClass: "text-amber-700",
      bgClass: "bg-amber-50",
      borderClass: "border-amber-300",
    },
    permission_denied: {
      icon: ShieldBan,
      defaultTitle: "Access Restricted",
      defaultDesc: "You do not have the required statutory authority or assignment permission to view or modify this record.",
      colorClass: "text-slate-600",
      bgClass: "bg-slate-100",
      borderClass: "border-slate-300",
    },
    submission_locked: {
      icon: Lock,
      defaultTitle: "Submission Locked for Official Scrutiny",
      defaultDesc: "This application has been formally submitted. Modifications are disabled during active regulatory review.",
      colorClass: "text-slate-600",
      bgClass: "bg-slate-100",
      borderClass: "border-slate-300",
    },
    clarification_requested: {
      icon: MessageSquare,
      defaultTitle: "Clarification Outstanding",
      defaultDesc: "The scrutiny officer has requested additional evidence or rectification within the permitted deadline.",
      colorClass: "text-amber-700",
      bgClass: "bg-amber-50",
      borderClass: "border-amber-300",
    },
    revised_submission: {
      icon: RefreshCw,
      defaultTitle: "Revised Submission Recorded",
      defaultDesc: "The applicant has uploaded updated evidence superseding previous deficiencies.",
      colorClass: "text-blue-700",
      bgClass: "bg-blue-50",
      borderClass: "border-blue-200",
    },
    session_expired: {
      icon: LogOut,
      defaultTitle: "Session Security Timeout",
      defaultDesc: "Your authenticated session has expired for regulatory security. Please sign in again.",
      colorClass: "text-slate-700",
      bgClass: "bg-slate-100",
      borderClass: "border-slate-300",
    },
  };

  const current = configs[state];
  const Icon = current.icon;

  return (
    <div
      className={`rounded-lg p-6 sm:p-8 text-center border ${current.bgClass} ${current.borderClass} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex justify-center mb-3">
        <div className={`p-3 rounded-full bg-white shadow-subtle ${current.colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-base sm:text-lg font-bold text-niyam-text mb-1">
        {title || current.defaultTitle}
      </h3>
      <p className="text-sm text-niyam-secondary max-w-md mx-auto mb-4 leading-relaxed">
        {description || current.defaultDesc}
      </p>
      {actionText && onAction && (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
