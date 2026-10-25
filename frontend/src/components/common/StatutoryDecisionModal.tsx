"use client";

import React, { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { X, ShieldCheck, AlertOctagon, CheckCircle2 } from "lucide-react";

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#14202B]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E3E8EE] w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#14202B] text-white px-6 py-4 flex items-center justify-between border-b border-[#243447]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isSupervisingAuthority ? "Record Statutory Regulatory Decision" : "Record Officer Scrutiny Recommendation"}
              </h3>
              <p className="text-xs text-[#8FA2B4] mt-0.5">
                Application: <span className="font-mono text-white">{applicationNumber}</span> ({institutionName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8FA2B4] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Statutory Authority Mandate:</span> Automated AI advisory findings assist review. Authorized human officials retain exclusive statutory jurisdiction and full legal accountability for approval, inspection, or rejection orders.
            </div>
          </div>

          {!isSupervisingAuthority ? (
            <div>
              <label className="text-xs font-bold text-[#14202B] block mb-1.5">
                Scrutiny Officer Recommendation
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#E3E8EE] rounded-xl bg-[#F7F9FB] text-[#14202B] focus:ring-2 focus:ring-[#2563EB] outline-none"
              >
                <option value="RECOMMENDED_FOR_APPROVAL">Recommend for Formal Approval</option>
                <option value="DEFICIENCIES_COMMUNICATED">Communicate Deficiencies to Institution</option>
                <option value="EXPERT_VISIT_SCHEDULED">Schedule Physical Expert Visit Committee (EVC)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-[#14202B] block mb-1.5">
                Final Regulatory Statutory Determination
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "APPROVE", label: "Grant Approval", color: "border-emerald-500 bg-emerald-50 text-emerald-800" },
                  { id: "DEFICIENT", label: "Issue Deficiency", color: "border-amber-500 bg-amber-50 text-amber-800" },
                  { id: "REJECT", label: "Reject Order", color: "border-rose-500 bg-rose-50 text-rose-800" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatutoryDecision(opt.id)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      statutoryDecision === opt.id
                        ? `${opt.color} ring-2 ring-[#2563EB]`
                        : "border-[#E3E8EE] bg-white text-[#5B6B7A] hover:bg-[#F7F9FB]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#14202B] block mb-1.5">
              Official Comments & Statutory Justification
            </label>
            <textarea
              required
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Record detailed statutory justification, handbook clause references, and specific committee notes..."
              className="w-full text-xs p-3 border border-[#E3E8EE] rounded-xl bg-[#F7F9FB] text-[#14202B] focus:ring-2 focus:ring-[#2563EB] outline-none placeholder-[#5B6B7A]/60"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E3E8EE]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5B6B7A] hover:bg-[#F7F9FB] rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl shadow-xs transition disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Sign & Record Official Outcome"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
