"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import {
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Upload,
  ArrowRight,
  Calendar,
  ExternalLink,
  ShieldAlert,
  Send,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { StateFeedback } from "@/components/ui/StateFeedback";

export default function ClarificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [clarifications, setClarifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Response Drawer state
  const [selectedClarification, setSelectedClarification] = useState<any | null>(null);
  const [responseComment, setResponseComment] = useState("");
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => {
    // Synthetic clarifications list pre-seeded with Scenario 8
    setClarifications([
      {
        id: 101,
        application_id: "app-008",
        application_title: "Apex Institute - Extension of Approval 2025-26",
        query:
          "AICTE scrutiny indicates that the submitted Laboratory Equipment Invoices for the AI & Robotics Lab are illegible and missing tax authentication. Please upload GST-authenticated invoices and equipment calibration certificates.",
        category: "Laboratory Infrastructure & Equipment",
        deadline: "2026-11-02T23:59:59Z",
        days_remaining: 5,
        status: "pending_response",
        created_at: "2026-10-22T10:15:00Z",
        officer_name: "Rajesh Varma (Scrutiny Officer)",
        response_text: null,
        revised_doc_name: null,
      },
      {
        id: 102,
        application_id: "app-002",
        application_title: "Zenith Institute of Engineering - EoA",
        query:
          "The uploaded Fire Safety NOC expired on 2024-03-31. Submit an updated Fire Safety Certificate from the Competent Municipal Fire Authority or proof of renewal application with payment receipt.",
        category: "Safety & Compliance Certificates",
        deadline: "2026-10-28T23:59:59Z",
        days_remaining: 1,
        status: "pending_response",
        created_at: "2026-10-21T14:30:00Z",
        officer_name: "Anita Deshmukh (Scrutiny Officer)",
        response_text: null,
        revised_doc_name: null,
      },
      {
        id: 103,
        application_id: "app-003",
        application_title: "Modern College of Engineering - Increase in Intake",
        query:
          "Faculty Cadre Ratio discrepancy: The mandatory AICTE norm requires 1:20 FSR. Submit appointment orders and Aadhaar-linked payroll sheets for the 3 newly appointed Assistant Professors.",
        category: "Faculty Cadre & Ratio",
        deadline: "2026-10-15T23:59:59Z",
        days_remaining: 0,
        status: "resolved",
        created_at: "2026-10-08T09:00:00Z",
        officer_name: "Rajesh Varma (Scrutiny Officer)",
        response_text:
          "Uploaded appointment orders and September 2026 payroll sheets verified via bank transfer records.",
        revised_doc_name: "Faculty_Appointment_Orders_Batch_Oct2026.pdf",
        resolved_at: "2026-10-14T11:20:00Z",
      },
    ]);
    setLoading(false);
  }, []);

  const filtered = clarifications.filter((c) => {
    if (filter === "pending") return c.status === "pending_response";
    if (filter === "resolved") return c.status === "resolved";
    return true;
  });

  const handleSendResponse = () => {
    if (!responseComment) return;
    setSubmittingResponse(true);
    setTimeout(() => {
      setClarifications((prev) =>
        prev.map((c) =>
          c.id === selectedClarification.id
            ? {
                ...c,
                status: "resolved",
                response_text: responseComment,
                revised_doc_name: "Revised_Evidence_Submission_Oct2026.pdf",
              }
            : c
        )
      );
      setSubmittingResponse(false);
      setSelectedClarification(null);
      setResponseComment("");
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-niyam-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-niyam-text tracking-tight flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-niyam-accent" />
            <span>Clarification Requests & Resubmission Tracker</span>
          </h1>
          <p className="text-sm text-niyam-secondary mt-1">
            Statutory scrutiny queries issued by scrutiny officers requiring institutional clarification or revised evidence.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-md border border-niyam-border">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${
              filter === "all" ? "bg-white text-niyam-text shadow-subtle" : "text-niyam-secondary hover:text-niyam-text"
            }`}
          >
            All Queries ({clarifications.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${
              filter === "pending" ? "bg-white text-niyam-text shadow-subtle" : "text-niyam-secondary hover:text-niyam-text"
            }`}
          >
            Pending Action ({clarifications.filter((c) => c.status === "pending_response").length})
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${
              filter === "resolved" ? "bg-white text-niyam-text shadow-subtle" : "text-niyam-secondary hover:text-niyam-text"
            }`}
          >
            Resolved ({clarifications.filter((c) => c.status === "resolved").length})
          </button>
        </div>
      </div>

      {/* Clarification Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <StateFeedback
            state="empty"
            title="No Clarification Queries Found"
            description="There are no outstanding queries matching the selected filter."
          />
        ) : (
          filtered.map((item) => (
            <Card key={item.id} padding="none">
              <div className="p-4 sm:p-6 space-y-4">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-niyam-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-niyam-accent">
                        {item.application_id.toUpperCase()}
                      </span>
                      <span className="text-xs text-niyam-secondary font-medium">•</span>
                      <span className="text-xs font-semibold text-niyam-text">{item.category}</span>
                    </div>
                    <h2 className="text-base font-bold text-niyam-text mt-0.5">
                      {item.application_title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.status === "pending_response" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                        <span>{item.days_remaining} Days Remaining</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Clarification Resolved</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Scrutiny Query */}
                <div className="p-4 rounded-md bg-slate-50 border border-niyam-border">
                  <div className="flex items-center justify-between text-xs text-niyam-secondary mb-1">
                    <span className="font-semibold text-slate-800">Scrutiny Officer Observation:</span>
                    <span className="font-mono text-[11px]">{item.officer_name}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-niyam-text leading-relaxed">
                    {item.query}
                  </p>
                </div>

                {/* Institution Response (if answered) */}
                {item.response_text && (
                  <div className="p-4 rounded-md bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs text-emerald-900">
                      <span className="font-semibold">Institution Rectification Response:</span>
                      <span className="text-[11px] font-mono">Recorded in Audit Ledger</span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                      {item.response_text}
                    </p>
                    {item.revised_doc_name && (
                      <div className="flex items-center gap-2 pt-1 text-xs font-mono text-emerald-800">
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Attached: {item.revised_doc_name}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                  <span className="text-xs text-niyam-secondary">
                    Issued: {new Date(item.created_at).toLocaleDateString()} | Regulatory Deadline: {new Date(item.deadline).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-3">
                    <Link href={`/applications/${item.application_id}`}>
                      <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Open Case Dossier
                      </Button>
                    </Link>

                    {item.status === "pending_response" && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Upload className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedClarification(item)}
                      >
                        Submit Revised Evidence
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Response Modal / Drawer */}
      {selectedClarification && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-niyam-border max-w-lg w-full p-6 shadow-dialog space-y-4">
            <div>
              <h3 className="text-lg font-bold text-niyam-text">
                Respond to Clarification Query
              </h3>
              <p className="text-xs text-niyam-secondary mt-1">
                Submitting revised evidence updates the application record and notifies the assigned scrutiny officer.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-niyam-border text-xs text-niyam-text">
              <strong>Query:</strong> {selectedClarification.query}
            </div>

            <div>
              <label className="text-xs font-semibold text-niyam-text block mb-1">
                Rectification Explanation / Response Narrative
              </label>
              <textarea
                rows={4}
                value={responseComment}
                onChange={(e) => setResponseComment(e.target.value)}
                placeholder="Detail the corrections made, document issuance details, and institutional justification..."
                className="w-full text-xs sm:text-sm p-3 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-niyam-text block mb-1">
                Attach Revised Document Evidence (PDF)
              </label>
              <div className="border-2 border-dashed border-niyam-border rounded-md p-4 text-center hover:border-niyam-accent transition cursor-pointer bg-slate-50/50">
                <Upload className="w-6 h-6 text-niyam-secondary mx-auto mb-1" />
                <span className="text-xs font-semibold text-niyam-text block">
                  Click to select revised PDF or drag and drop
                </span>
                <span className="text-[11px] text-niyam-secondary">
                  Auto-scanned for virus signature and cryptographic SHA-256 hash
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-niyam-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedClarification(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submittingResponse}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                onClick={handleSendResponse}
                disabled={!responseComment.trim()}
              >
                Submit Rectification
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
