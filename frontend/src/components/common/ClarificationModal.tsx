"use client";

import React, { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { X, MessageSquare, Send, CheckCircle2 } from "lucide-react";

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden">
        <div className="bg-navy-950 text-white px-6 py-4 flex items-center justify-between border-b border-navy-850">
          <div className="flex items-center space-x-2.5">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              {isResponding ? "Respond to Official Clarification Query" : "Issue Scrutiny Clarification Notice"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {existingQuestion && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs">
              <span className="font-bold text-blue-900 block mb-1">Official Query from Scrutiny Officer:</span>
              <p className="text-blue-800">{existingQuestion}</p>
            </div>
          )}

          {!isResponding ? (
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Specific Clarification Required from Institution
              </label>
              <textarea
                rows={4}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Specify the exact document, clause, discrepancy, or missing information the institution must rectify..."
                required
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Institutional Explanation / Rectification Statement
              </label>
              <textarea
                rows={4}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="State your institutional clarification, resolution steps, or references to uploaded rectification documents..."
                required
              />
            </div>
          )}

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
              className="px-5 py-2 text-xs bg-navy-900 text-white font-medium rounded hover:bg-navy-850 transition flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4 text-blue-400" />
              <span>{isSubmitting ? "Submitting..." : isResponding ? "Submit Institutional Response" : "Dispatch Clarification"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
