"use client";

import React, { useState } from "react";
import { fetchApi } from "@/lib/api";
import { X, MessageSquare, Send } from "lucide-react";

interface ClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  clarificationId?: number;
  existingQuestion?: string;
  isResponding?: boolean;
  onSuccess?: () => void;
}

export const ClarificationModal: React.FC<ClarificationModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  clarificationId,
  existingQuestion,
  isResponding = false,
  onSuccess,
}) => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isResponding && clarificationId) {
        if (!response.trim()) {
          alert("Please enter your clarification response.");
          return;
        }
        await fetchApi(`/clarifications/${clarificationId}/respond`, {
          method: "POST",
          body: JSON.stringify({ applicant_response: response.trim() }),
        });
        alert("Clarification response submitted.");
      } else {
        if (!question.trim()) {
          alert("Please enter your question for the applicant.");
          return;
        }
        await fetchApi(`/clarifications/${applicationId}`, {
          method: "POST",
          body: JSON.stringify({ question: question.trim() }),
        });
        alert("Clarification notice issued to institution.");
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(`Error submitting clarification: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#14202B]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E3E8EE] w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#14202B] text-white px-6 py-4 flex items-center justify-between border-b border-[#243447]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {isResponding
                ? "Respond to Official Clarification Query"
                : "Issue Scrutiny Clarification Notice"}
            </h3>
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
          {isResponding && existingQuestion && (
            <div className="p-3.5 bg-[#F7F9FB] rounded-xl border border-[#E3E8EE] space-y-1">
              <span className="text-[10px] font-bold text-[#5B6B7A] uppercase tracking-wider block">
                Official Scrutiny Query:
              </span>
              <p className="text-xs text-[#14202B] font-medium leading-relaxed">
                &quot;{existingQuestion}&quot;
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#14202B] block mb-1.5">
              {isResponding
                ? "Institutional Response & Evidence Submission"
                : "Clarification Query for Applicant"}
            </label>
            <textarea
              required
              rows={4}
              value={isResponding ? response : question}
              onChange={(e) =>
                isResponding ? setResponse(e.target.value) : setQuestion(e.target.value)
              }
              placeholder={
                isResponding
                  ? "Provide point-by-point clarification, land registration references, or rectified document details..."
                  : "Specify the clause deficiency, illegible document page, or clarification required..."
              }
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
              className="px-5 py-2 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Submitting..." : isResponding ? "Submit Reply" : "Issue Notice"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
