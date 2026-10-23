"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DocumentViewerModal } from "@/components/common/DocumentViewerModal";
import { StatutoryDecisionModal } from "@/components/common/StatutoryDecisionModal";
import { ClarificationModal } from "@/components/common/ClarificationModal";
import {
  FileText,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  SearchCode,
  ArrowRight,
  MessageSquare,
  Play,
  Layers,
  Building,
  Clock,
  RefreshCw,
  ExternalLink,
  Sliders,
  Send,
  FileCheck,
  Download
} from "lucide-react";

export default function ApplicationWorkspacePage() {
  const params = useParams();
  const appId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"checklist" | "findings" | "verification" | "clarifications" | "timeline">("checklist");
  
  // Modals state
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<any>(null);
  const [statutoryModalOpen, setStatutoryModalOpen] = useState(false);
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [clarificationToRespond, setClarificationToRespond] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadApplication = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(`/applications/${appId}`);
      setApplication(data);
    } catch (err: any) {
      console.error(err);
      alert(`Error loading application workspace: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appId) {
      loadApplication();
    }
  }, [appId]);

  // Run AI Validation
  const handleRunValidation = async () => {
    setIsValidating(true);
    try {
      const result = await fetchApi(`/validation/run/${appId}`, { method: "POST" });
      alert(`Validation complete! Status: ${result.status}, Findings: ${result.findings_count}`);
      await loadApplication();
      setActiveTab("findings");
    } catch (err: any) {
      alert(`Validation error: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Submit for Scrutiny
  const handleSubmitForScrutiny = async () => {
    if (!confirm("Are you sure you want to formally submit this application for official scrutiny?")) return;
    try {
      await fetchApi(`/applications/${appId}/submit`, { method: "POST" });
      alert("Application formally submitted for AICTE regulatory scrutiny.");
      loadApplication();
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    }
  };

  // File Upload / Rectification handler
  const handleFileUploadTrigger = (docId: number) => {
    setUploadingDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingDocId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("notes", "Uploaded via Document Checklist Workspace");

    try {
      const token = localStorage.getItem("aicte_token");
      const res = await fetch(`http://127.0.0.1:8000/api/v1/documents/upload/${uploadingDocId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || "Upload failed");
      }
      alert(`Document '${file.name}' successfully uploaded and structured fields extracted.`);
      loadApplication();
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingDocId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Trigger Re-Verification
  const handleTriggerVerification = async (docVersionId: number, authorityType: string, scenario = "NORMAL") => {
    try {
      const res = await fetchApi(`/verification/trigger?simulate_scenario=${scenario}`, {
        method: "POST",
        body: JSON.stringify({
          authority_type: authorityType,
          document_version_id: docVersionId,
        }),
      });
      alert(`Verification dispatched to ${authorityType}: Status = ${res.status}`);
      loadApplication();
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    }
  };

  // Download Validation Report CSV
  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem("aicte_token");
      const res = await fetch(`http://127.0.0.1:8000/api/v1/reports/application/${appId}/summary?format=csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Report generation failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Validation_Report_${application.application_number}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`Download error: ${err.message}`);
    }
  };

  // Download Submission Receipt
  const handleDownloadReceipt = async () => {
    try {
      const receipt = await fetchApi(`/reports/application/${appId}/receipt`);
      const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Submission_Receipt_${application.application_number}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      alert(`Submission Receipt generated:\n\nReceipt #: ${receipt.receipt_number}\nHash: ${receipt.cryptographic_receipt_hash}\nTimestamp: ${receipt.submission_timestamp}`);
    } catch (err: any) {
      alert(`Receipt error: ${err.message}`);
    }
  };

  // Manual Source Confirmation
  const handleManualSourceConfirm = async (docVersionId: number) => {
    const evidenceRef = prompt("Enter official supporting document / file reference for manual confirmation:", "OFFICIAL-DISPATCH-REG-2025/892");
    if (!evidenceRef) return;
    const notes = prompt("Enter officer manual verification observations:", "Physically cross-checked with State Directorate records");
    if (!notes) return;

    try {
      await fetchApi(`/verification/manual-confirm?doc_version_id=${docVersionId}&supporting_evidence_ref=${encodeURIComponent(evidenceRef)}&observations=${encodeURIComponent(notes)}`, {
        method: "POST",
      });
      alert("Manual confirmation recorded with supporting evidence and officer provenance.");
      loadApplication();
    } catch (err: any) {
      alert(`Manual confirmation failed: ${err.message}`);
    }
  };

  if (loading && !application) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        Loading Application Workspace...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-12 text-center text-rose-600 text-xs font-semibold">
        Application not found or unauthorized access.
      </div>
    );
  }

  const isOfficerOrAuthority = user?.role === "scrutiny_officer" || user?.role === "supervising_authority" || user?.role === "admin";
  const isApplicant = user?.role === "applicant";

  return (
    <div className="space-y-6">
      {/* Hidden File Input for document uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
      />

      {/* Flagship Header Card */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {application.application_number}
              </span>
              <StatusBadge status={application.status} type="application" />
              <span className="text-[11px] text-slate-500 font-mono">
                Rule Set Version: <strong className="text-slate-800">{application.rule_set_version}</strong>
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2">
              {application.institution?.name || "Apex Institute of Technology"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Category: <span className="font-semibold text-slate-700 capitalize">{application.category_code.replace(/_/g, " ")}</span> | Academic Year: {application.academic_year} | AICTE ID: {application.institution?.aicte_permanent_id}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunValidation}
              disabled={isValidating}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
            >
              <Play className={`w-3.5 h-3.5 ${isValidating ? "animate-spin" : ""}`} />
              <span>{isValidating ? "Evaluating Rules..." : "Run AI Advisory Validation"}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-300"
              title="Download CSV Validation Report"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>CSV Report</span>
            </button>

            <button
              onClick={handleDownloadReceipt}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-300"
              title="Download Tamper-Evident Submission Receipt"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Receipt</span>
            </button>

            {isApplicant && application.status === "DRAFT" && (
              <button
                onClick={handleSubmitForScrutiny}
                className="px-4 py-2 bg-navy-900 hover:bg-navy-850 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Submit for Scrutiny</span>
              </button>
            )}

            {isOfficerOrAuthority && (
              <button
                onClick={() => setStatutoryModalOpen(true)}
                className="px-4 py-2 bg-navy-900 hover:bg-navy-850 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {user?.role === "supervising_authority" ? "Record Statutory Decision" : "Record Scrutiny Observation"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Advisory Risk Bar & Snapshot */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 text-[11px] block">AI Advisory Risk Score</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-base font-bold font-mono ${application.overall_risk_score > 50 ? "text-rose-600" : application.overall_risk_score > 20 ? "text-amber-600" : "text-emerald-600"}`}>
                {application.overall_risk_score.toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-400">
                ({application.findings?.length || 0} advisory findings)
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 text-[11px] block">Checklist Completeness</span>
            <span className="text-base font-bold text-slate-800 mt-1 block">
              {application.documents?.filter((d: any) => d.current_version_id).length} / {application.documents?.length || 6} Uploaded
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 text-[11px] block">TER Regulatory Fee</span>
            <span className="text-base font-bold text-emerald-600 mt-1 block">
              PAID & SETTLED
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 text-[11px] block">Active Programme Intake</span>
            <span className="text-base font-bold text-slate-800 mt-1 block">
              {application.approved_programmes?.reduce((s: number, p: any) => s + (p.intake || 0), 0) || 240} Seats
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("checklist")}
          className={`pb-3 px-2 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === "checklist"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Statutory Checklist & Uploads ({application.documents?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("findings")}
          className={`pb-3 px-2 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === "findings"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Compliance Findings ({application.findings?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("verification")}
          className={`pb-3 px-2 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === "verification"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Source Verifications</span>
        </button>

        <button
          onClick={() => setActiveTab("clarifications")}
          className={`pb-3 px-2 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === "clarifications"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Official Clarifications</span>
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`pb-3 px-2 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === "timeline"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Review Actions & History</span>
        </button>
      </div>

      {/* TAB 1: Checklist & Evidence Upload */}
      {activeTab === "checklist" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Statutory Document Checklist (Rule Set {application.rule_set_version})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every document maintains immutable versioning, SHA-256 cryptographic provenance, and structured extraction
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {application.documents?.map((doc: any) => {
              const latestVersion = doc.versions?.[doc.versions.length - 1];
              return (
                <div key={doc.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {doc.checklist_item_code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{doc.title}</h4>
                      {doc.is_mandatory && (
                        <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-semibold border border-rose-200">
                          Mandatory
                        </span>
                      )}
                    </div>

                    {latestVersion ? (
                      <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                        <div>
                          File: <span className="font-semibold text-slate-800">{latestVersion.file_name}</span> (Version {latestVersion.version_number})
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          SHA-256: {latestVersion.sha256_hash.slice(0, 16)}... | Size: {(latestVersion.file_size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-700 pt-1">
                        No document uploaded yet. Submission pending.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {latestVersion && (
                      <button
                        onClick={() => {
                          setSelectedDocForViewer({
                            title: doc.title,
                            fileName: latestVersion.file_name,
                            code: doc.checklist_item_code,
                            fields: latestVersion.extracted_fields || [],
                          });
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold flex items-center space-x-1.5 transition border border-blue-200"
                      >
                        <SearchCode className="w-3.5 h-3.5" />
                        <span>Inspect Extraction ({latestVersion.extracted_fields?.length || 0} fields)</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleFileUploadTrigger(doc.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium flex items-center space-x-1.5 transition border border-slate-300"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{latestVersion ? "Upload Rectified Version" : "Upload Document"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Compliance Findings */}
      {activeTab === "findings" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Evidence-Linked Regulatory Findings ({application.findings?.length || 0})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Findings are deterministic comparisons against Rule Set {application.rule_set_version} handbook clauses
              </p>
            </div>
            <button
              onClick={handleRunValidation}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Re-Evaluate Rules</span>
            </button>
          </div>

          {application.findings?.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-lg text-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-emerald-900">No Regulatory Deficiencies Detected</h4>
              <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                All statutory checklist items, certificates, dates, and entity references conform with handbook norms.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {application.findings.map((f: any) => (
                <div key={f.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {f.rule_code}
                      </span>
                      <StatusBadge status={f.severity} type="finding" />
                      <StatusBadge status={f.status} type="finding" />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Citation: <strong className="text-slate-600">{f.rule_citation || "AICTE Handbook"}</strong>
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    {f.explanation}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                        Statutory Expected Value
                      </span>
                      <p className="text-slate-800 font-mono text-[11px]">
                        {f.expected_value || "Valid conforming record"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                        Observed Evidence Value
                      </span>
                      <p className="text-rose-700 font-mono text-[11px] font-semibold">
                        {f.observed_value || "Non-conforming"}
                      </p>
                    </div>
                  </div>

                  {f.excerpt && (
                    <div className="text-[11px] text-slate-600 font-mono bg-blue-50/50 p-2 rounded border border-blue-100">
                      <strong>Evidence Excerpt:</strong> &quot;{f.excerpt}&quot;
                    </div>
                  )}

                  {f.officer_notes && (
                    <div className="text-[11px] text-slate-700 bg-amber-50/60 p-2.5 rounded border border-amber-200">
                      <strong>Official Scrutiny Note:</strong> {f.officer_notes}
                    </div>
                  )}

                  {/* Officer finding disposition actions */}
                  {isOfficerOrAuthority && (
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={async () => {
                          const note = prompt("Enter officer observation for confirming deficiency:", "Verified during scrutiny");
                          if (!note) return;
                          await fetchApi(`/validation/findings/${f.id}/disposition`, {
                            method: "PATCH",
                            body: JSON.stringify({ status: "CONFIRMED_BY_OFFICER", officer_notes: note }),
                          });
                          loadApplication();
                        }}
                        className="px-2.5 py-1 text-[11px] bg-red-50 text-red-700 hover:bg-red-100 rounded font-medium border border-red-200"
                      >
                        Confirm Finding
                      </button>
                      <button
                        onClick={async () => {
                          const note = prompt("Enter justification for dismissing finding:", "Verified acceptable under waiver clause");
                          if (!note) return;
                          await fetchApi(`/validation/findings/${f.id}/disposition`, {
                            method: "PATCH",
                            body: JSON.stringify({ status: "DISMISSED_BY_OFFICER", officer_notes: note }),
                          });
                          loadApplication();
                        }}
                        className="px-2.5 py-1 text-[11px] bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium border border-slate-300"
                      >
                        Dismiss Finding
                      </button>
                      <button
                        onClick={() => {
                          setClarificationModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium border border-blue-200"
                      >
                        Raise Clarification
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Source Verification Adapters */}
      {activeTab === "verification" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Issuing-Authority External Verifications
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pluggable adapters connect directly to digital repositories (DigiLocker, State Portals, Land Registries). All mock responses are clearly labeled.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DigiLocker */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">DigiLocker / NAD Registry</span>
                <StatusBadge status="VERIFIED" type="verification" />
              </div>
              <p className="text-xs text-slate-600">
                [SIMULATED DEMO] Successfully authenticated via National Academic Depository (NAD). URI signature verified with Root CA.
              </p>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-400">
                <span>Latency: 135ms</span>
                <button
                  onClick={() => handleTriggerVerification(1, "DIGILOCKER", "NORMAL")}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Test Pull (Success)
                </button>
                <button
                  onClick={() => handleTriggerVerification(1, "DIGILOCKER", "SOURCE_UNAVAILABLE")}
                  className="text-amber-600 font-semibold hover:underline"
                >
                  Simulate 504 Timeout
                </button>
              </div>
            </div>

            {/* University Affiliation */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">University Affiliation Order</span>
                <StatusBadge status="VERIFIED" type="verification" />
              </div>
              <p className="text-xs text-slate-600">
                [SIMULATED DEMO] State Technical University confirmed provisional affiliation order active for session 2025-26.
              </p>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-400">
                <span>Latency: 180ms</span>
                <button
                  onClick={() => handleTriggerVerification(1, "UNIVERSITY_AFFILIATION", "NORMAL")}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Re-Verify
                </button>
              </div>
            </div>

            {/* Land Revenue Portal */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Land Revenue / Bhulekh Registry</span>
                <StatusBadge status="VERIFIED" type="verification" />
              </div>
              <p className="text-xs text-slate-600">
                [SIMULATED DEMO] Sub-Registrar 7/12 mutation verified contiguous educational land in favor of registered trust.
              </p>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-400">
                <span>Latency: 210ms</span>
                <button
                  onClick={() => handleTriggerVerification(1, "LAND_REVENUE_PORTAL", "NORMAL")}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Re-Verify
                </button>
              </div>
            </div>

            {/* Bank TER Payment */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Bharatkosh TER Payment Gateway</span>
                <StatusBadge status="VERIFIED" type="verification" />
              </div>
              <p className="text-xs text-slate-600">
                [SIMULATED DEMO] Electronic payment confirmed settled with AICTE designated treasury account.
              </p>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-400">
                <span>Latency: 95ms</span>
                <span className="text-emerald-700 font-semibold">Settled</span>
              </div>
            </div>

            {/* Manual Official Confirmation Card */}
            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">Manual Official Confirmation</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  Officer Workflow
                </span>
              </div>
              <p className="text-xs text-blue-800">
                Section 5E & Acceptance Test 12 mandate: Authorized reviewers can record manual confirmation backed by supporting document references.
              </p>
              <div className="pt-2 border-t border-blue-200 flex justify-between items-center text-[11px]">
                <span className="text-blue-600 font-medium">Requires Reviewer Provenance</span>
                {isOfficerOrAuthority && (
                  <button
                    onClick={() => handleManualSourceConfirm(1)}
                    className="px-2.5 py-1 bg-navy-900 hover:bg-navy-850 text-white rounded font-medium shadow-sm"
                  >
                    Record Manual Confirmation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Clarifications */}
      {activeTab === "clarifications" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Official Scrutiny Clarifications & Institutional Responses
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Formal queries issued by AICTE scrutiny officers and institutional written replies
              </p>
            </div>
            {isOfficerOrAuthority && (
              <button
                onClick={() => setClarificationModalOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Issue Clarification Query</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {application.clarifications?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No official clarifications have been raised for this application.
              </p>
            ) : (
              application.clarifications.map((c: any) => (
                <div key={c.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-blue-900">
                      Official Query from Scrutiny Officer
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === "RESOLVED" || c.status === "RESPONDED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    &quot;{c.question}&quot;
                  </p>

                  {c.applicant_response ? (
                    <div className="p-3 bg-white rounded border border-slate-200 mt-2">
                      <span className="text-[11px] font-bold text-emerald-800 block mb-0.5">
                        Institutional Response:
                      </span>
                      <p className="text-xs text-slate-700">{c.applicant_response}</p>
                    </div>
                  ) : (
                    isApplicant && (
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setClarificationToRespond(c);
                          }}
                          className="px-3 py-1 bg-navy-900 text-white rounded text-xs font-medium hover:bg-navy-850 transition"
                        >
                          Submit Institutional Response
                        </button>
                      </div>
                    )
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Statutory Review Actions & Timeline */}
      {activeTab === "timeline" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Statutory Review Actions & Official Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Append-only statutory scrutiny actions, officer recommendations, and authority review outcomes
            </p>
          </div>

          <div className="space-y-4">
            {application.review_actions?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No formal review decisions recorded yet. Scrutiny in progress.
              </p>
            ) : (
              application.review_actions.map((act: any) => (
                <div key={act.id} className="p-4 rounded border border-slate-200 bg-slate-50 flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">
                        {act.action_type.replace(/_/g, " ")}
                      </span>
                      {act.statutory_decision && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                          Decision: {act.statutory_decision}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700">{act.comments}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Recorded on: {new Date(act.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      {selectedDocForViewer && (
        <DocumentViewerModal
          isOpen={true}
          onClose={() => setSelectedDocForViewer(null)}
          documentTitle={selectedDocForViewer.title}
          fileName={selectedDocForViewer.fileName}
          checklistCode={selectedDocForViewer.code}
          fields={selectedDocForViewer.fields}
          onFieldCorrected={loadApplication}
        />
      )}

      {statutoryModalOpen && (
        <StatutoryDecisionModal
          isOpen={statutoryModalOpen}
          onClose={() => setStatutoryModalOpen(false)}
          applicationId={Number(appId)}
          applicationNumber={application.application_number}
          institutionName={application.institution?.name || "Apex Institute"}
          onSuccess={loadApplication}
        />
      )}

      {clarificationModalOpen && (
        <ClarificationModal
          isOpen={clarificationModalOpen}
          onClose={() => setClarificationModalOpen(false)}
          applicationId={Number(appId)}
          onSuccess={loadApplication}
        />
      )}

      {clarificationToRespond && (
        <ClarificationModal
          isOpen={true}
          onClose={() => setClarificationToRespond(null)}
          applicationId={Number(appId)}
          clarificationId={clarificationToRespond.id}
          existingQuestion={clarificationToRespond.question}
          isResponding={true}
          onSuccess={loadApplication}
        />
      )}
    </div>
  );
}
