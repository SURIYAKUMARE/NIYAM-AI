"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi, API_BASE_URL } from "@/lib/api";
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
  Download,
  Landmark,
  ShieldAlert,
  Flame,
  Users2,
  Receipt,
  BadgeCheck,
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

  // Accessible Modal States replacing browser prompt/confirm
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [submittingScrutiny, setSubmittingScrutiny] = useState(false);

  const [manualConfirmModal, setManualConfirmModal] = useState<{
    open: boolean;
    docVersionId: number | null;
  } | null>(null);
  const [manualEvidenceRef, setManualEvidenceRef] = useState("DOTE-CONFIRM-REG-2025/892");
  const [manualObservations, setManualObservations] = useState("Physically cross-checked with State Directorate records");
  const [submittingManual, setSubmittingManual] = useState(false);

  const [findingDispositionModal, setFindingDispositionModal] = useState<{
    open: boolean;
    findingId: number;
    action: string;
    ruleCode: string;
  } | null>(null);
  const [findingDispositionNote, setFindingDispositionNote] = useState("");
  const [submittingFindingDisposition, setSubmittingFindingDisposition] = useState(false);

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
  const handleOpenSubmitModal = () => {
    setSubmitConfirmOpen(true);
  };

  const handleExecuteSubmitForScrutiny = async () => {
    setSubmittingScrutiny(true);
    try {
      await fetchApi(`/applications/${appId}/submit`, { method: "POST" });
      setSubmitConfirmOpen(false);
      loadApplication();
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmittingScrutiny(false);
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
      const res = await fetch(`${API_BASE_URL}/documents/upload/${uploadingDocId}`, {
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
      const res = await fetch(`${API_BASE_URL}/reports/application/${appId}/summary?format=csv`, {
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

  // Manual Source Confirmation Modal Handlers
  const handleOpenManualConfirm = (docVersionId: number) => {
    setManualConfirmModal({ open: true, docVersionId });
    setManualEvidenceRef("DOTE-CONFIRM-REG-2025/892");
    setManualObservations("Physically cross-checked with State Directorate records");
  };

  const handleExecuteManualConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualConfirmModal?.docVersionId || !manualEvidenceRef.trim()) return;

    setSubmittingManual(true);
    try {
      await fetchApi(
        `/verification/manual-confirm?doc_version_id=${manualConfirmModal.docVersionId}&supporting_evidence_ref=${encodeURIComponent(
          manualEvidenceRef.trim()
        )}&observations=${encodeURIComponent(manualObservations.trim())}`,
        { method: "POST" }
      );
      setManualConfirmModal(null);
      loadApplication();
    } catch (err: any) {
      alert(`Manual confirmation failed: ${err.message}`);
    } finally {
      setSubmittingManual(false);
    }
  };

  // Finding Disposition Modal Handlers
  const handleOpenFindingDisposition = (findingId: number, action: string, ruleCode: string) => {
    setFindingDispositionModal({ open: true, findingId, action, ruleCode });
    setFindingDispositionNote(
      action === "CONFIRMED_BY_OFFICER"
        ? "Verified deficiency against Approval Process Handbook norms"
        : "Permitted variance under institutional compliance guidelines"
    );
  };

  const handleExecuteFindingDisposition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findingDispositionModal || !findingDispositionNote.trim()) return;

    setSubmittingFindingDisposition(true);
    try {
      await fetchApi(`/validation/findings/${findingDispositionModal.findingId}/disposition`, {
        method: "PATCH",
        body: JSON.stringify({
          status: findingDispositionModal.action,
          officer_notes: findingDispositionNote.trim(),
        }),
      });
      setFindingDispositionModal(null);
      loadApplication();
    } catch (err: any) {
      alert(`Error updating finding: ${err.message}`);
    } finally {
      setSubmittingFindingDisposition(false);
    }
  };

  if (loading && !application) {
    return (
      <div className="p-12 text-center text-[#5B6B7A] text-xs">
        Loading Institutional Application Workspace...
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

  const role = user?.role;
  const isApplicant = role === "applicant";
  const isOfficer = role === "scrutiny_officer";
  const isAuthority = role === "supervising_authority";
  const isAdmin = role === "admin";
  const isAuditor = role === "auditor";
  const isOfficerOrAuthority = isOfficer || isAuthority || isAdmin;

  // Compute 5-Pillar APH Compliance Health Statuses
  const findingsList = application.findings || [];
  const documentsList = application.documents || [];

  const landFinding = findingsList.find((f: any) => f.rule_code?.includes("LAND") || f.rule_code?.includes("TITLE"));
  const areaFinding = findingsList.find((f: any) => f.rule_code?.includes("AREA") || f.rule_code?.includes("BUILD"));
  const facultyFinding = findingsList.find((f: any) => f.rule_code?.includes("FAC") || f.rule_code?.includes("CADRE"));
  const safetyFinding = findingsList.find((f: any) => f.rule_code?.includes("FIRE") || f.rule_code?.includes("SAFE"));
  const feeFinding = findingsList.find((f: any) => f.rule_code?.includes("FEE") || f.rule_code?.includes("PAY"));

  const pillars = [
    {
      id: "land",
      name: "Land & Title Deeds",
      clause: "APH Clause 4.1",
      icon: Landmark,
      finding: landFinding,
      norm: "Min 2.5 Acres contiguous / 30-yr Registered Lease",
      status: landFinding
        ? landFinding.status === "DISMISSED_BY_OFFICER"
          ? "COMPLIANT"
          : "DEFICIENT"
        : "COMPLIANT",
    },
    {
      id: "area",
      name: "Built-up Instructional Area",
      clause: "APH Clause 5.3",
      icon: Building,
      finding: areaFinding,
      norm: "Classrooms, labs, library carpet per approved intake",
      status: areaFinding
        ? areaFinding.status === "DISMISSED_BY_OFFICER"
          ? "COMPLIANT"
          : "DEFICIENT"
        : "COMPLIANT",
    },
    {
      id: "faculty",
      name: "Faculty Cadre & Ratio",
      clause: "APH Clause 6.2",
      icon: Users2,
      finding: facultyFinding,
      norm: "1:15 Cadre ratio & AICTE qualified Principal",
      status: facultyFinding
        ? facultyFinding.status === "DISMISSED_BY_OFFICER"
          ? "COMPLIANT"
          : "OBSERVATION"
        : "COMPLIANT",
    },
    {
      id: "safety",
      name: "Statutory Safety Clearances",
      clause: "APH Clause 4.8",
      icon: Flame,
      finding: safetyFinding,
      norm: "State Fire Service NOC & Structural Stability Certificate",
      status: safetyFinding
        ? safetyFinding.status === "DISMISSED_BY_OFFICER"
          ? "COMPLIANT"
          : "DEFICIENT"
        : "COMPLIANT",
    },
    {
      id: "fee",
      name: "TER Regulatory Fee",
      clause: "APH Clause 1.7",
      icon: Receipt,
      finding: feeFinding,
      norm: "Electronic Bharatkosh treasury settlement confirmed",
      status: "COMPLIANT",
    },
  ];

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
      <div className="bg-white p-6 rounded-xl border border-[#E3E8EE] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-[#E3E8EE]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {application.application_number}
              </span>
              <StatusBadge status={application.status} type="application" />
              <span className="text-[11px] text-[#5B6B7A] font-mono">
                Rule Set Version: <strong className="text-[#14202B]">{application.rule_set_version}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#14202B] mt-2">
              {application.institution?.name || "Apex Institute of Technology"}
            </h1>
            <p className="text-xs text-[#5B6B7A] mt-1">
              Category: <span className="font-semibold text-[#14202B] capitalize">{application.category_code?.replace(/_/g, " ")}</span> · Academic Year: {application.academic_year} · AICTE ID: <span className="font-mono">{application.institution?.aicte_permanent_id}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isAuditor && (
              <button
                onClick={handleRunValidation}
                disabled={isValidating}
                className="px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs disabled:opacity-60"
              >
                <Play className={`w-3.5 h-3.5 ${isValidating ? "animate-spin" : ""}`} />
                <span>{isValidating ? "Evaluating Rules..." : "Run AI Advisory Validation"}</span>
              </button>
            )}

            <button
              onClick={handleDownloadReport}
              className="px-3 py-2 bg-white hover:bg-[#F7F9FB] text-[#14202B] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-[#E3E8EE] shadow-xs"
              title="Download CSV Validation Report"
            >
              <Download className="w-3.5 h-3.5 text-[#5B6B7A]" />
              <span>CSV Report</span>
            </button>

            <button
              onClick={handleDownloadReceipt}
              className="px-3 py-2 bg-white hover:bg-[#F7F9FB] text-[#14202B] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-[#E3E8EE] shadow-xs"
              title="Download Tamper-Evident Submission Receipt"
            >
              <FileText className="w-3.5 h-3.5 text-[#5B6B7A]" />
              <span>Receipt</span>
            </button>

            {isApplicant && application.status === "DRAFT" && (
              <button
                onClick={handleOpenSubmitModal}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                <span>Submit for Scrutiny</span>
              </button>
            )}

            {isAuthority && (
              <button
                onClick={() => setStatutoryModalOpen(true)}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Record Statutory Decision</span>
              </button>
            )}

            {isOfficer && (
              <button
                onClick={() => setStatutoryModalOpen(true)}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                <span>Record Scrutiny Observation</span>
              </button>
            )}
          </div>
        </div>

        {/* Advisory Risk Bar & Snapshot */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-white rounded-xl border border-[#E3E8EE] shadow-xs">
            <span className="text-[#5B6B7A] text-[10px] font-bold uppercase tracking-wider block">
              AI Advisory Risk Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-extrabold font-mono ${application.overall_risk_score > 50 ? "text-rose-600" : application.overall_risk_score > 20 ? "text-amber-600" : "text-[#2563EB]"}`}>
                {application.overall_risk_score?.toFixed(0) || 0}%
              </span>
              <span className="text-[11px] text-[#5B6B7A]">
                ({application.findings?.length || 0} findings)
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-[#E3E8EE] shadow-xs">
            <span className="text-[#5B6B7A] text-[10px] font-bold uppercase tracking-wider block">
              Checklist Completeness
            </span>
            <span className="text-2xl font-extrabold font-mono text-[#14202B] mt-1 block">
              {application.documents?.filter((d: any) => d.current_version_id).length} / {application.documents?.length || 6}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-[#E3E8EE] shadow-xs">
            <span className="text-[#5B6B7A] text-[10px] font-bold uppercase tracking-wider block">
              TER Regulatory Fee
            </span>
            <span className="text-sm font-bold text-emerald-700 mt-2 block flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <span>SETTLED (BHARATKOSH)</span>
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-[#E3E8EE] shadow-xs">
            <span className="text-[#5B6B7A] text-[10px] font-bold uppercase tracking-wider block">
              Approved Intake
            </span>
            <span className="text-2xl font-extrabold font-mono text-[#14202B] mt-1 block">
              {application.approved_programmes?.reduce((s: number, p: any) => s + (p.intake || 0), 0) || 240}{" "}
              <span className="text-xs font-sans text-[#5B6B7A] font-normal">Seats</span>
            </span>
          </div>
        </div>
      </div>

      {/* 5-PILLAR APH COMPLIANCE HEALTH INDEX */}
      <div className="bg-white rounded-xl border border-[#E3E8EE] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 mb-4 border-b border-[#E3E8EE]">
          <div>
            <h3 className="text-xs font-bold text-[#14202B] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>5-Pillar APH 2025-26 Compliance Health Index</span>
            </h3>
            <p className="text-[11px] text-[#5B6B7A] mt-0.5">
              Deterministic verification against statutory Approval Process Handbook clauses and physical norms
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-50 text-[#2563EB] border border-blue-200">
            Handbook Ver. 2025-26
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            const isCompliant = pillar.status === "COMPLIANT";
            const isDeficient = pillar.status === "DEFICIENT";

            return (
              <div
                key={pillar.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isDeficient
                    ? "bg-rose-50/40 border-rose-200 hover:border-rose-400"
                    : isCompliant
                    ? "bg-[#F7F9FB]/60 border-[#E3E8EE] hover:border-[#2563EB]/40"
                    : "bg-amber-50/40 border-amber-200 hover:border-amber-400"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <span className="text-[9px] font-mono font-bold text-[#5B6B7A] uppercase">
                      {pillar.clause}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold tracking-tight border ${
                        isDeficient
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : isCompliant
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      {pillar.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`p-1.5 rounded-lg border shrink-0 ${
                        isDeficient
                          ? "bg-rose-100 text-rose-700 border-rose-200"
                          : isCompliant
                          ? "bg-white text-[#2563EB] border-[#E3E8EE]"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#14202B] leading-tight">
                      {pillar.name}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#5B6B7A] leading-snug">
                    {pillar.norm}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#E3E8EE]/60 text-[10px]">
                  {pillar.finding ? (
                    <button
                      onClick={() => setActiveTab("findings")}
                      className="text-rose-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Review Finding</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Norm Satisfied</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-t-xl border border-b-0 border-[#E3E8EE] px-4 pt-1 flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("checklist")}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition whitespace-nowrap -mb-px ${
            activeTab === "checklist"
              ? "border-[#2563EB] text-[#2563EB] font-bold"
              : "border-transparent text-[#5B6B7A] hover:text-[#14202B] hover:border-[#E3E8EE]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Statutory Checklist &amp; Uploads ({application.documents?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("findings")}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition whitespace-nowrap -mb-px ${
            activeTab === "findings"
              ? "border-[#2563EB] text-[#2563EB] font-bold"
              : "border-transparent text-[#5B6B7A] hover:text-[#14202B] hover:border-[#E3E8EE]"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Compliance Findings ({application.findings?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("verification")}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition whitespace-nowrap -mb-px ${
            activeTab === "verification"
              ? "border-[#2563EB] text-[#2563EB] font-bold"
              : "border-transparent text-[#5B6B7A] hover:text-[#14202B] hover:border-[#E3E8EE]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Source Verifications</span>
        </button>

        <button
          onClick={() => setActiveTab("clarifications")}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition whitespace-nowrap -mb-px ${
            activeTab === "clarifications"
              ? "border-[#2563EB] text-[#2563EB] font-bold"
              : "border-transparent text-[#5B6B7A] hover:text-[#14202B] hover:border-[#E3E8EE]"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Official Clarifications</span>
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition whitespace-nowrap -mb-px ${
            activeTab === "timeline"
              ? "border-[#2563EB] text-[#2563EB] font-bold"
              : "border-transparent text-[#5B6B7A] hover:text-[#14202B] hover:border-[#E3E8EE]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Review Actions &amp; History</span>
        </button>
      </div>

      {/* TAB 1: Checklist & Evidence Upload */}
      {activeTab === "checklist" && (
        <div className="bg-white rounded-b-xl border border-[#E3E8EE] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E3E8EE] flex items-center justify-between bg-[#F7F9FB]/50">
            <div>
              <h3 className="text-xs font-bold text-[#14202B] uppercase tracking-wider">
                Statutory Document Checklist (Rule Set {application.rule_set_version})
              </h3>
              <p className="text-xs text-[#5B6B7A] mt-0.5">
                Every document maintains immutable versioning, SHA-256 cryptographic provenance, and structured extraction
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#E3E8EE]/70">
            {application.documents?.map((doc: any) => {
              const latestVersion = doc.versions?.[doc.versions.length - 1];
              return (
                <div key={doc.id} className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F7F9FB]/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold text-[#5B6B7A] bg-[#F7F9FB] px-2 py-0.5 rounded border border-[#E3E8EE]">
                        {doc.checklist_item_code}
                      </span>
                      <h4 className="text-sm font-bold text-[#14202B]">{doc.title}</h4>
                      {doc.is_mandatory && (
                        <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold border border-rose-200">
                          Mandatory
                        </span>
                      )}
                    </div>

                    {latestVersion ? (
                      <div className="text-xs text-[#5B6B7A] space-y-0.5 pt-1">
                        <div>
                          File: <span className="font-semibold text-[#14202B]">{latestVersion.file_name}</span> (Version {latestVersion.version_number})
                        </div>
                        <div className="font-mono text-[11px] text-[#5B6B7A]">
                          SHA-256: {latestVersion.sha256_hash.slice(0, 16)}... · Size: {(latestVersion.file_size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-700 pt-1 font-medium">
                        No document uploaded yet. Submission pending.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
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
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-blue-200"
                      >
                        <SearchCode className="w-3.5 h-3.5" />
                        <span>View &amp; Verify ({latestVersion.extracted_fields?.length || 0} fields)</span>
                      </button>
                    )}

                    {isApplicant && (
                      <button
                        onClick={() => handleFileUploadTrigger(doc.id)}
                        className="px-3.5 py-1.5 bg-white hover:bg-[#F7F9FB] text-[#14202B] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-[#E3E8EE] shadow-xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-[#5B6B7A]" />
                        <span>{latestVersion ? "Upload Rectified Version" : "Upload Document"}</span>
                      </button>
                    )}
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
          <div className="bg-white p-5 rounded-xl border border-[#E3E8EE] shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#14202B] uppercase tracking-wider">
                Evidence-Linked Regulatory Findings ({application.findings?.length || 0})
              </h3>
              <p className="text-xs text-[#5B6B7A] mt-0.5">
                Deterministic comparisons against Rule Set {application.rule_set_version} handbook clauses
              </p>
            </div>
            {!isAuditor && !isApplicant && (
              <button
                onClick={handleRunValidation}
                className="px-3.5 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Evaluate Rules</span>
              </button>
            )}
          </div>

          {application.findings?.length === 0 ? (
            <div className="bg-emerald-50/50 border border-emerald-200 p-8 rounded-xl text-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-emerald-900">No Regulatory Deficiencies Detected</h4>
              <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                All statutory checklist items, certificates, dates, and entity references conform with handbook norms.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {application.findings.map((f: any) => (
                <div key={f.id} className="bg-white p-5 rounded-xl border border-[#E3E8EE] shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E3E8EE]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#14202B] bg-[#F7F9FB] px-2.5 py-0.5 rounded-md border border-[#E3E8EE]">
                        {f.rule_code}
                      </span>
                      <StatusBadge status={f.severity} type="finding" />
                      <StatusBadge status={f.status} type="finding" />
                    </div>
                    <span className="text-[11px] text-[#5B6B7A]">
                      Citation: <strong className="text-[#14202B]">{f.rule_citation || "AICTE Handbook"}</strong>
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#14202B] leading-snug">
                    {f.explanation}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F7F9FB] p-3.5 rounded-xl border border-[#E3E8EE]">
                    <div>
                      <span className="text-[10px] text-[#5B6B7A] uppercase font-bold block mb-1">
                        Statutory Expected Value
                      </span>
                      <p className="text-[#14202B] font-mono text-[11px]">
                        {f.expected_value || "Valid conforming record"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5B6B7A] uppercase font-bold block mb-1">
                        Observed Evidence Value
                      </span>
                      <p className="text-rose-700 font-mono text-[11px] font-bold">
                        {f.observed_value || "Non-conforming"}
                      </p>
                    </div>
                  </div>

                  {f.excerpt && (
                    <div className="text-[11px] text-[#14202B] font-mono bg-blue-50/50 p-2.5 rounded-lg border border-blue-200">
                      <strong className="text-[#2563EB]">Evidence Excerpt:</strong> &quot;{f.excerpt}&quot;
                    </div>
                  )}

                  {!isApplicant && f.officer_notes && (
                    <div className="text-[11px] text-[#14202B] bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                      <strong className="text-amber-800">Official Scrutiny Note:</strong> {f.officer_notes}
                    </div>
                  )}

                  {/* Officer finding disposition actions */}
                  {!isAuditor && !isApplicant && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3E8EE]">
                      {isOfficer && (
                        <>
                          <button
                            onClick={() => handleOpenFindingDisposition(f.id, "CONFIRMED_BY_OFFICER", f.rule_code)}
                            className="px-3 py-1 text-[11px] bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold border border-rose-200 transition"
                          >
                            Confirm Finding
                          </button>
                          <button
                            onClick={() => handleOpenFindingDisposition(f.id, "DISMISSED_BY_OFFICER", f.rule_code)}
                            className="px-3 py-1 text-[11px] bg-[#F7F9FB] text-[#14202B] hover:bg-[#E3E8EE] rounded-lg font-semibold border border-[#E3E8EE] transition"
                          >
                            Dismiss Finding
                          </button>
                        </>
                      )}
                      {(isOfficer || isAuthority) && (
                        <button
                          onClick={() => {
                            setClarificationModalOpen(true);
                          }}
                          className="px-3 py-1 text-[11px] bg-blue-50 text-[#2563EB] hover:bg-blue-100 rounded-lg font-semibold border border-blue-200 transition"
                        >
                          Raise Clarification
                        </button>
                      )}
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
        <div className="bg-white rounded-xl border border-[#E3E8EE] shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-[#14202B] uppercase tracking-wider">
              Issuing-Authority External Verifications
            </h3>
            <p className="text-xs text-[#5B6B7A] mt-0.5">
              Pluggable adapters connect directly to digital repositories (DigiLocker, State Portals, Land Registries). All mock responses are clearly labeled.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DigiLocker */}
            <div className="p-4 bg-[#F7F9FB] rounded-xl border border-[#E3E8EE] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#14202B]">DigiLocker / NAD Registry</span>
                <StatusBadge status="VERIFIED" type="verification" />
              </div>
              <p className="text-xs text-[#5B6B7A] leading-relaxed">
                [SIMULATED DEMO] Successfully authenticated via National Academic Depository (NAD). URI signature verified with Root CA.
              </p>
              <div className="pt-2 border-t border-[#E3E8EE] flex justify-between items-center text-[11px] text-[#5B6B7A]">
                <span>Latency: 135ms</span>
                {!isAuditor && !isApplicant && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleTriggerVerification(1, "DIGILOCKER", "NORMAL")}
                      className="text-[#2563EB] font-semibold hover:underline"
                    >
                      Test Pull (Success)
                    </button>
                    <button
                      onClick={() => handleTriggerVerification(1, "DIGILOCKER", "SOURCE_UNAVAILABLE")}
                      className="text-amber-700 font-semibold hover:underline"
                    >
                      Simulate 504 Timeout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* University Affiliation */}
            <div className="p-4 bg-[#F7F9FB] rounded-xl border border-[#E3E8EE] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#14202B]">University Affiliation Order</span>
                <StatusBadge status="VERIFIED" type="verification" />
              </div>
              <p className="text-xs text-[#5B6B7A] leading-relaxed">
                [SIMULATED DEMO] State Technical University confirmed provisional affiliation order active for session 2025-26.
              </p>
              <div className="pt-2 border-t border-[#E3E8EE] flex justify-between items-center text-[11px] text-[#5B6B7A]">
                <span>Latency: 180ms</span>
                {!isAuditor && !isApplicant && (
                  <button
                    onClick={() => handleTriggerVerification(1, "UNIVERSITY_AFFILIATION", "NORMAL")}
                    className="text-[#2563EB] font-semibold hover:underline"
                  >
                    Re-Verify
                  </button>
                )}
              </div>
            </div>

            {/* Land Revenue Portal */}
            <div className="p-4 bg-[#F7F9FB] rounded-xl border border-[#E3E8EE] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#14202B]">Land Revenue / Bhulekh Registry</span>
                <StatusBadge status="VERIFIED" type="verification" />
              </div>
              <p className="text-xs text-[#5B6B7A] leading-relaxed">
                [SIMULATED DEMO] Sub-Registrar 7/12 mutation verified contiguous educational land in favor of registered trust.
              </p>
              <div className="pt-2 border-t border-[#E3E8EE] flex justify-between items-center text-[11px] text-[#5B6B7A]">
                <span>Latency: 210ms</span>
                {!isAuditor && !isApplicant && (
                  <button
                    onClick={() => handleTriggerVerification(1, "LAND_REVENUE_PORTAL", "NORMAL")}
                    className="text-[#2563EB] font-semibold hover:underline"
                  >
                    Re-Verify
                  </button>
                )}
              </div>
            </div>

            {/* Bank TER Payment */}
            <div className="p-4 bg-[#F7F9FB] rounded-xl border border-[#E3E8EE] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#14202B]">Bharatkosh TER Payment Gateway</span>
                <StatusBadge status="VERIFIED" type="verification" />
              </div>
              <p className="text-xs text-[#5B6B7A] leading-relaxed">
                [SIMULATED DEMO] Electronic payment confirmed settled with AICTE designated treasury account.
              </p>
              <div className="pt-2 border-t border-[#E3E8EE] flex justify-between items-center text-[11px] text-[#5B6B7A]">
                <span>Latency: 95ms</span>
                <span className="text-emerald-700 font-bold">Settled</span>
              </div>
            </div>

            {/* Manual Official Confirmation Card */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2563EB]">Manual Official Confirmation</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#2563EB] border border-blue-300">
                  Officer Workflow
                </span>
              </div>
              <p className="text-xs text-[#14202B] leading-relaxed">
                Section 5E &amp; Acceptance Test 12 mandate: Authorized reviewers can record manual confirmation backed by supporting document references.
              </p>
              <div className="pt-2 border-t border-blue-200 flex justify-between items-center text-[11px]">
                <span className="text-[#5B6B7A] font-medium">Requires Reviewer Provenance</span>
                {isOfficer && (
                  <button
                    onClick={() => handleOpenManualConfirm(1)}
                    className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-semibold shadow-xs transition"
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
        <div className="bg-white rounded-xl border border-[#E3E8EE] shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E8EE]">
            <div>
              <h3 className="text-xs font-bold text-[#14202B] uppercase tracking-wider">
                Official Scrutiny Clarifications &amp; Institutional Responses
              </h3>
              <p className="text-xs text-[#5B6B7A] mt-0.5">
                Formal queries issued by AICTE scrutiny officers and institutional written replies
              </p>
            </div>
            {(isOfficer || isAuthority) && (
              <button
                onClick={() => setClarificationModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Issue Clarification Query</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {application.clarifications?.length === 0 ? (
              <p className="text-xs text-[#5B6B7A] text-center py-8">
                No official clarifications have been raised for this application.
              </p>
            ) : (
              application.clarifications.map((c: any) => (
                <div key={c.id} className="p-4 rounded-xl border border-[#E3E8EE] bg-[#F7F9FB] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#14202B]">
                      Official Query from Scrutiny Officer
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${c.status === "RESOLVED" || c.status === "RESPONDED" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#14202B] leading-relaxed font-medium">
                    &quot;{c.question}&quot;
                  </p>

                  {c.applicant_response ? (
                    <div className="p-3 bg-white rounded-lg border border-[#E3E8EE] mt-2">
                      <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                        Institutional Response:
                      </span>
                      <p className="text-xs text-[#14202B] leading-relaxed">{c.applicant_response}</p>
                    </div>
                  ) : (
                    isApplicant && (
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setClarificationToRespond(c);
                          }}
                          className="px-3.5 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition shadow-xs"
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
        <div className="bg-white rounded-xl border border-[#E3E8EE] shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-[#14202B] uppercase tracking-wider">
              Statutory Review Actions &amp; Official Audit Trail
            </h3>
            <p className="text-xs text-[#5B6B7A] mt-0.5">
              Append-only statutory scrutiny actions, officer recommendations, and authority review outcomes
            </p>
          </div>

          <div className="space-y-4">
            {application.review_actions?.length === 0 ? (
              <p className="text-xs text-[#5B6B7A] text-center py-8">
                No formal review decisions recorded yet. Scrutiny in progress.
              </p>
            ) : (
              application.review_actions.map((act: any) => (
                <div key={act.id} className="p-4 rounded-xl border border-[#E3E8EE] bg-[#F7F9FB] flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#14202B]">
                        {act.action_type.replace(/_/g, " ")}
                      </span>
                      {act.statutory_decision && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
                          Decision: {act.statutory_decision}
                        </span>
                      )}
                    </div>
                    {(!isApplicant || act.action_type === "STATUTORY_DECISION_RECORDED") && act.comments && (
                      <p className="text-xs text-[#14202B] leading-relaxed">{act.comments}</p>
                    )}
                    <span className="text-[10px] text-[#5B6B7A] block pt-1">
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

      {/* Accessible Submit for Scrutiny Modal */}
      {submitConfirmOpen && (
        <div className="fixed inset-0 bg-[#14202B]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E3E8EE] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8EE]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-[#14202B]">Confirm Application Submission</h3>
              </div>
              <button
                onClick={() => setSubmitConfirmOpen(false)}
                className="text-[#5B6B7A] hover:text-[#14202B] text-lg leading-none"
              >
                &times;
              </button>
            </div>
            
            <p className="text-xs text-[#5B6B7A] leading-relaxed">
              You are about to submit Application <strong className="font-mono text-[#14202B]">{application.application_number}</strong> for formal regulatory scrutiny by AICTE scrutiny officers.
            </p>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold">Statutory Scrutiny Notice:</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Upon submission, application documents and data become immutable. Modifications can only be executed in response to formal clarification queries issued by assigned scrutiny officers.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSubmitConfirmOpen(false)}
                className="px-3.5 py-1.5 border border-[#E3E8EE] rounded-xl text-xs font-semibold text-[#5B6B7A] hover:bg-[#F7F9FB] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSubmitForScrutiny}
                disabled={submittingScrutiny}
                className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
              >
                {submittingScrutiny ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Confirm &amp; Lock Submission</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Manual Source Confirmation Modal */}
      {manualConfirmModal?.open && (
        <div className="fixed inset-0 bg-[#14202B]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleExecuteManualConfirm}
            className="bg-white rounded-2xl shadow-2xl border border-[#E3E8EE] max-w-lg w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8EE]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#14202B]">Record Manual Source Confirmation</h3>
              </div>
              <button
                type="button"
                onClick={() => setManualConfirmModal(null)}
                className="text-[#5B6B7A] hover:text-[#14202B] text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-[#5B6B7A] leading-relaxed">
              Section 5E &amp; Acceptance Test 12 mandate: When external electronic registries are unavailable or require physical corroboration, authorized reviewers can record manual confirmation backed by verified document references.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#14202B] mb-1">
                  Supporting Evidence / Registry Reference <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualEvidenceRef}
                  onChange={(e) => setManualEvidenceRef(e.target.value)}
                  placeholder="e.g. DOTE-CONFIRM-REG-2025/892 or DOTE/DISP/4501"
                  className="w-full text-xs p-2.5 border border-[#E3E8EE] rounded-xl font-mono text-[#14202B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14202B] mb-1">
                  Reviewer Observations &amp; Verification Notes
                </label>
                <textarea
                  rows={3}
                  value={manualObservations}
                  onChange={(e) => setManualObservations(e.target.value)}
                  placeholder="Observations from direct inspection, physical verification, or department record check..."
                  className="w-full text-xs p-2.5 border border-[#E3E8EE] rounded-xl text-[#14202B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-[11px] text-[#2563EB]">
                <strong>Provenance Notice:</strong> This action will record your user identity, timestamp, and audit trail entry as statutory officer verification.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E3E8EE]">
              <button
                type="button"
                onClick={() => setManualConfirmModal(null)}
                className="px-3.5 py-1.5 border border-[#E3E8EE] rounded-xl text-xs font-semibold text-[#5B6B7A] hover:bg-[#F7F9FB] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingManual}
                className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
              >
                {submittingManual ? "Saving..." : "Record Official Confirmation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accessible Finding Disposition Modal */}
      {findingDispositionModal?.open && (
        <div className="fixed inset-0 bg-[#14202B]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleExecuteFindingDisposition}
            className="bg-white rounded-2xl shadow-2xl border border-[#E3E8EE] max-w-lg w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8EE]">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${findingDispositionModal.action === "CONFIRMED_BY_OFFICER" ? "text-rose-600" : "text-[#5B6B7A]"}`} />
                <h3 className="text-sm font-bold text-[#14202B]">
                  {findingDispositionModal.action === "CONFIRMED_BY_OFFICER" ? "Confirm Deficiency Finding" : "Dismiss Advisory Finding"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFindingDispositionModal(null)}
                className="text-[#5B6B7A] hover:text-[#14202B] text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#14202B]">Rule Code:</span>
              <span className="font-mono bg-[#F7F9FB] px-2 py-0.5 rounded text-[#14202B] font-bold border border-[#E3E8EE]">
                {findingDispositionModal.ruleCode}
              </span>
              <span className="text-[#5B6B7A]">·</span>
              <span className="text-[#5B6B7A]">Finding #{findingDispositionModal.findingId}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#14202B] mb-1">
                  Official Scrutiny Note &amp; Regulatory Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={findingDispositionNote}
                  onChange={(e) => setFindingDispositionNote(e.target.value)}
                  placeholder="Provide statutory justification referencing Approval Process Handbook norms or institutional evidence..."
                  className="w-full text-xs p-2.5 border border-[#E3E8EE] rounded-xl text-[#14202B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#E3E8EE] text-[11px] text-[#5B6B7A] leading-relaxed">
                <strong>Core Regulatory Principle:</strong> AI findings are advisory suggestions. Your disposition overrides or validates this finding with officer provenance in the statutory scrutiny dossier.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E3E8EE]">
              <button
                type="button"
                onClick={() => setFindingDispositionModal(null)}
                className="px-3.5 py-1.5 border border-[#E3E8EE] rounded-xl text-xs font-semibold text-[#5B6B7A] hover:bg-[#F7F9FB] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingFindingDisposition}
                className={`px-4 py-1.5 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 ${
                  findingDispositionModal.action === "CONFIRMED_BY_OFFICER"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-[#14202B] hover:bg-[#1D4ED8]"
                }`}
              >
                {submittingFindingDisposition ? "Updating..." : (
                  findingDispositionModal.action === "CONFIRMED_BY_OFFICER" ? "Confirm Deficiency" : "Dismiss Advisory Finding"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
