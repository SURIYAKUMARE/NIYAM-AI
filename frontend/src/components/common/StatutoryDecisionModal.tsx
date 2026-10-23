"use client";

import React, { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { X, CheckCircle2, ShieldCheck, AlertOctagon, HelpCircle } from "lucide-react";

interface StatutoryDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  applicationNumber: string;
  institutionName: string;
  onSuccess?: () => void;
}

export const StatutoryDecisionModal: React.FC<StatutoryDecisionModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  applicationNumber,
  institutionName,
  onSuccess,
}) => {
  const { user } = useAuth();
  const isSupervisingAuthority = user?.role === "supervising_authority";

  const [actionType, setActionType] = useState<string>(
    isSupervisingAuthority ? "STATUTORY_DECISION_RECORDED" : "RECOMMENDED_FOR_APPROVAL"
  );
  const [statutoryDecision, setStatutoryDecision] = useState<string>("APPROVE");
  const [comments, setComments] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      alert("Please enter official comments and reasoning for this statutory determination.");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchApi(`/review-actions/${applicationId}`, {
        method: "POST",
        body: JSON.stringify({
          action_type: actionType,
          comments: comments.trim(),
          statutory_decision: isSupervisingAuthority ? statutoryDecision : undefined,
        }),
      });
      alert("Official review outcome recorded successfully.");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(`Failed to record review action: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="bg-navy-950 text-white px-6 py-4 flex items-center justify-between border-b border-navy-850">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                {isSupervisingAuthority ? "Record Statutory Regulatory Decision" : "Record Officer Scrutiny Recommendation"}
              </h3>
              <p className="text-xs text-slate-400">
                Application: {applicationNumber} ({institutionName})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
            <AlertOctagon className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Statutory Authority Mandate:</span> Automated AI findings provide advisory risk indicators only. The authorized human official retains statutory authority and full legal accountability for approval, inspection, or deficiency decisions.
            </div>
          </div>

          {!isSupervisingAuthority ? (
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Scrutiny Officer Recommendation
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="RECOMMENDED_FOR_APPROVAL">Recommend for Approval to Bureau Authority</option>
                <option value="RECOMMENDED_FOR_INSPECTION">Recommend for Physical Campus Inspection / Expert Visit</option>
                <option value="CLARIFICATION_REQUESTED">Recommend Clarification / Rectification Notice</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Supervising Bureau Statutory Decision
              </label>
              <select
                value={statutoryDecision}
                onChange={(e) => setStatutoryDecision(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="APPROVE">GRANT APPROVAL (Issue Extension of Approval / Intake Letter)</option>
                <option value="INSPECT">SANCTION EXPERT PHYSICAL INSPECTION</option>
                <option value="REJECT">REFUSE APPROVAL (Deficiencies Unresolved)</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Statutory Justification & Observations (Recorded in Permanent Audit Trail)
            </label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Detail the factual findings, document verifications, handbook clauses evaluated, and justification for this outcome..."
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs bg-navy-900 text-white font-medium rounded hover:bg-navy-850 transition flex items-center space-x-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isSubmitting ? "Submitting..." : "Sign & Record Official Outcome"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
