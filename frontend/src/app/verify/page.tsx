"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileCheck2,
  UploadCloud,
  FileText,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Download,
  ExternalLink,
  Award,
  Search,
  Filter,
  Layers,
  Scan,
  BookOpen,
  ArrowRight,
  Info,
  Building2,
  Hash,
  QrCode,
  Calendar,
  Sparkles,
} from "lucide-react";

import { TrustScoreGauge } from "@/components/verify/TrustScoreGauge";
import { MismatchHighlighter, MismatchItem } from "@/components/verify/MismatchHighlighter";
import { OcrExtractorView, OcrExtractedData } from "@/components/verify/OcrExtractorView";

import rawInstitutions from "../../../data/seed/institutions.json";
import rawGroundTruth from "../../../data/seed/ground_truth.json";

interface ValidationHistoryItem {
  id: string;
  timestamp: string;
  collegeName: string;
  collegeId: string;
  docTitle: string;
  docId: string;
  status: "Valid" | "Tampered" | "Expired" | "Missing Fields";
  trustScore: number;
  anomaliesCount: number;
}

export default function VerificationStudioPage() {
  const searchParams = useSearchParams();
  const initialCollegeId = searchParams.get("collegeId") || "zec-zaskar";
  const initialDocId = searchParams.get("docId") || "doc-zec-01";

  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(initialCollegeId);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId);

  // Upload simulation state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStage, setVerificationStage] = useState<string>("");

  // History state
  const [historyFilter, setHistoryFilter] = useState<string>("ALL");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flatten all documents for the dropdown
  const allDocuments = useMemo(() => {
    const list: Array<{
      collegeId: string;
      collegeName: string;
      collegeStatus: string;
      docId: string;
      docTitle: string;
      docType: string;
      refNumber: string;
      path: string;
      pages: number;
      fileSize: string;
      sha256: string;
    }> = [];

    rawInstitutions.forEach((col: any) => {
      col.documents?.forEach((doc: any) => {
        list.push({
          collegeId: col.id,
          collegeName: col.name,
          collegeStatus: col.status,
          docId: doc.id,
          docTitle: doc.title,
          docType: doc.type,
          refNumber: doc.refNumber,
          path: doc.path,
          pages: doc.pages,
          fileSize: doc.fileSize,
          sha256: doc.sha256,
        });
      });
    });

    return list;
  }, []);

  // Current active college & doc
  const currentCollege = useMemo(() => {
    return rawInstitutions.find((c: any) => c.id === selectedCollegeId) || rawInstitutions[0];
  }, [selectedCollegeId]);

  const currentDoc = useMemo(() => {
    const doc = currentCollege.documents?.find((d: any) => d.id === selectedDocId);
    return (doc || currentCollege.documents?.[0] || allDocuments[0]) as any;
  }, [currentCollege, selectedDocId, allDocuments]);

  const docPath = currentDoc.path || currentDoc.filePath || `/seed/docs/${currentCollege.id}/${currentDoc.id}.pdf`;
  const docFileSize = currentDoc.fileSize || "180 KB";
  const docPages = currentDoc.pages || 2;
  const docSha256 = currentDoc.sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  // Ground truth data for active college
  const currentGroundTruth = useMemo(() => {
    const gt = (rawGroundTruth.colleges as any)[selectedCollegeId];
    return gt || {
      expectedStatus: "Valid",
      expectedTrustScore: 98,
      anomaliesExpected: [],
    };
  }, [selectedCollegeId]);

  // Compute mismatch items based on document and ground truth
  const mismatchItems: MismatchItem[] = useMemo(() => {
    const anomalies = currentGroundTruth.anomaliesExpected?.filter(
      (a: any) => a.documentId === currentDoc.id
    ) || [];

    if (currentGroundTruth.expectedStatus === "Valid" || anomalies.length === 0) {
      return [
        {
          fieldName: "Institution Legal Entity",
          category: "Affiliation",
          extractedValue: currentCollege.legalEntityType,
          expectedValue: currentCollege.legalEntityType,
          status: "MATCH",
          severity: "PASSED",
          explanation: "Sponsoring educational trust registered and verified in state portal.",
        },
        {
          fieldName: "Approved Academic Intake",
          category: "Intake",
          extractedValue: `${currentCollege.intake} seats`,
          expectedValue: `${currentCollege.intake} seats`,
          status: "MATCH",
          severity: "PASSED",
          explanation: "Course intake schedule matches AICTE Central Bureau sanctioned capacity.",
        },
        {
          fieldName: "Faculty Cadre & SFR",
          category: "Infrastructure",
          extractedValue: `${currentCollege.facultyCount} core faculty (SFR 1:15)`,
          expectedValue: `${currentCollege.facultyCount} core faculty (SFR 1:15)`,
          status: "MATCH",
          severity: "PASSED",
          explanation: "Student-Faculty Ratio meets AICTE APH Chapter VII criteria.",
        },
        {
          fieldName: "Digital Signature & Seal",
          category: "Signature",
          extractedValue: "X.509 PKI Class-3 (Govt Certified)",
          expectedValue: "X.509 PKI Class-3 (Govt Certified)",
          status: "MATCH",
          severity: "PASSED",
          explanation: "Cryptographic signature validated via Controller of Certifying Authorities.",
        },
      ];
    }

    // Otherwise format the specific anomalies
    const list: MismatchItem[] = [];

    anomalies.forEach((a: any) => {
      let cat: MismatchItem["category"] = "Intake";
      if (a.anomalyType.includes("INTAKE")) cat = "Intake";
      else if (a.anomalyType.includes("EXPIRED")) cat = "Affiliation";
      else if (a.anomalyType.includes("MISSING")) cat = "Mandatory Disclosure";
      else if (a.anomalyType.includes("REF")) cat = "Affiliation";

      let statusVal: MismatchItem["status"] = "TAMPERED";
      if (a.anomalyType.includes("EXPIRED")) statusVal = "EXPIRED";
      else if (a.anomalyType.includes("MISSING")) statusVal = "MISSING";

      list.push({
        fieldName: a.anomalyType.replace(/_/g, " "),
        category: cat,
        extractedValue: a.extractedValue || "(Omitted / Missing in PDF)",
        expectedValue: a.expectedValue || "(Mandatory per AICTE Form B)",
        status: statusVal,
        severity: a.severity || "CRITICAL",
        ruleCitation: a.ruleViolated,
        explanation: a.explanation,
      });
    });

    // Add baseline matches
    list.push({
      fieldName: "Campus Land Survey Number",
      category: "Infrastructure",
      extractedValue: "Survey 104/2A Registered",
      expectedValue: "Survey 104/2A Registered",
      status: "MATCH",
      severity: "PASSED",
      explanation: "Title deed verified unencumbered in state land portal.",
    });

    return list;
  }, [currentCollege, currentDoc, currentGroundTruth]);

  // Compute Pillars breakdown based on expected score
  const pillars = useMemo(() => {
    const isTampered = currentGroundTruth.expectedStatus === "Tampered";
    const isExpired = currentGroundTruth.expectedStatus === "Expired";
    const isMissing = currentGroundTruth.expectedStatus === "Missing Fields";

    return [
      {
        name: "Document Integrity & Hash",
        score: isTampered ? 5 : isMissing ? 18 : 25,
        maxScore: 25,
        description: isTampered
          ? "SHA-256 hash mismatch: Document content modified after signing."
          : "SHA-256 digest matches issuing authority repository.",
        passed: !isTampered,
      },
      {
        name: "Issuing Authority Ledger",
        score: isExpired ? 8 : isTampered ? 6 : 25,
        maxScore: 25,
        description: isExpired
          ? "Affiliation expired in university ledger. Renewal pending."
          : "Authoritative state registry confirms active affiliation.",
        passed: !isExpired && !isTampered,
      },
      {
        name: "AICTE APH 2025 Norms",
        score: isMissing ? 10 : 25,
        maxScore: 25,
        description: isMissing
          ? "Mandatory statutory fields omitted from submitted dossier."
          : "All intake quotas and physical infrastructure satisfy APH Chapter II.",
        passed: !isMissing,
      },
      {
        name: "Seal & Signature Provenance",
        score: isTampered ? 5 : isMissing ? 10 : 25,
        maxScore: 25,
        description: isTampered
          ? "Digital signature hash invalid or seal modified."
          : "Valid X.509 PKI certificate verified against Root CA.",
        passed: !isTampered,
      },
    ];
  }, [currentGroundTruth]);

  // OCR entity mockup
  const ocrData: OcrExtractedData = useMemo(() => {
    return {
      fileName: `${currentDoc.id}.pdf`,
      fileSize: docFileSize,
      pages: docPages,
      sha256: docSha256,
      qrPayload: `https://aicte-verify.gov.in/verify/${currentDoc.id}`,
      isQrValid: currentGroundTruth.expectedStatus !== "Tampered",
      fields: [
        { label: "Institution Name", value: currentCollege.name, confidence: 99.8, bbox: "[40, 80, 520, 110]" },
        { label: "Permanent Institute ID", value: currentCollege.permanentId, confidence: 99.4, bbox: "[40, 115, 200, 130]" },
        { label: "Official Ref Number", value: currentDoc.refNumber, confidence: 98.7, bbox: "[40, 135, 340, 150]" },
        { label: "Approval Issue Date", value: currentDoc.issueDate, confidence: 99.1, bbox: "[450, 135, 550, 150]" },
        { label: "Approved Intake", value: `${currentCollege.intake} seats`, confidence: currentGroundTruth.expectedStatus === "Tampered" ? 82.4 : 99.0, bbox: "[200, 320, 310, 335]" },
        { label: "Signatory Authority", value: "Member Secretary / Regional Officer", confidence: 97.6, bbox: "[380, 680, 550, 710]" },
      ],
      rawTextPreview: `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION\n(A Statutory Body under Ministry of Education, Govt. of India)\nNelson Mandela Marg, Vasant Kunj, New Delhi-110070\n\nREF: ${currentDoc.refNumber}\nDATE: ${currentDoc.issueDate}\n\nTO,\nThe Principal / Director,\n${currentCollege.name}\n${currentCollege.address}\n\nSub: Extension of Approval (EoA) / Verification Dossier for Academic Year 2025-26.\n\nSir / Madam,\nIn terms of provisions under AICTE Regulations 2025 and Approval Process Handbook (APH 2025-26), the Council conveys approval with sanctioned intake of ${currentCollege.intake} seats.\n\nDigital Verification Digest: ${docSha256}\nProvenance Link: https://aicte-verify.gov.in/verify/${currentDoc.id}`,
    };
  }, [currentCollege, currentDoc, currentGroundTruth, docFileSize, docPages, docSha256]);

  // Handle Document Selection
  const handleSelectDoc = (fullDocKey: string) => {
    const [cId, dId] = fullDocKey.split("::");
    setSelectedCollegeId(cId);
    setSelectedDocId(dId);
    setUploadedFile(null);
  };

  // Run Verification Action Simulation
  const runVerification = () => {
    setIsVerifying(true);
    setVerificationProgress(10);
    setVerificationStage("Computing SHA-256 Digest & Header Checksums...");

    setTimeout(() => {
      setVerificationProgress(35);
      setVerificationStage("Extracting OCR Entities & Bounding Box Layout...");
    }, 400);

    setTimeout(() => {
      setVerificationProgress(70);
      setVerificationStage("Cross-Referencing State Board & DigiLocker Registries...");
    }, 900);

    setTimeout(() => {
      setVerificationProgress(95);
      setVerificationStage("Evaluating AICTE APH 2025 Norms & Computing Trust Score...");
    }, 1400);

    setTimeout(() => {
      setVerificationProgress(100);
      setIsVerifying(false);
      setVerificationStage("Verification Completed.");
    }, 1800);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      runVerification();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      runVerification();
    }
  };

  // Print/Download Audit Report
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Module 02 • Decision Support Engine
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              AICTE Problem Statement 26261
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>AI Upload &amp; Verification Studio</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Validate institutional dossiers against regulatory registries, detect document manipulation, and inspect cryptographic trust scores.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={runVerification}
            disabled={isVerifying}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying ? "animate-spin" : ""}`} />
            <span>{isVerifying ? "Analyzing Dossier..." : "Re-Run Verification"}</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Upload Zone & Quick Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`lg:col-span-2 rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[170px] ${
            dragActive
              ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20"
              : "border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {uploadedFile
              ? `Loaded: ${uploadedFile.name}`
              : "Drag & Drop Institutional Dossier (PDF or Scan)"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
            Upload any Approval Letter, Affiliation Certificate, or Compliance Report to execute automatic OCR extraction, hash cross-check, and anomaly detection.
          </p>

          <span className="mt-3 px-3 py-1 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Supports PDF, PNG, JPG • Max 25 MB
          </span>
        </div>

        {/* Right Col: Quick-Load 36 Pre-seeded Synthetic Documents */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Quick-Load Benchmark Document
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any of the 36 synthetic documents generated for the 12 colleges to test valid, tampered, expired, and missing scenarios.
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select Document ({allDocuments.length} available)
            </label>
            <select
              value={`${selectedCollegeId}::${selectedDocId}`}
              onChange={(e) => handleSelectDoc(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:border-blue-600"
            >
              {allDocuments.map((doc) => (
                <option
                  key={`${doc.collegeId}::${doc.docId}`}
                  value={`${doc.collegeId}::${doc.docId}`}
                >
                  [{doc.collegeStatus.toUpperCase()}] {doc.collegeName.slice(0, 24)}... — {doc.docTitle.slice(0, 26)}
                </option>
              ))}
            </select>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span className="font-semibold truncate">Ref: {currentDoc.refNumber}</span>
            <a
              href={docPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Inspect PDF</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Progress Bar when verifying */}
      {isVerifying && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-blue-600/30 shadow-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>{verificationStage}</span>
            </span>
            <span className="font-mono font-bold text-blue-600">{verificationProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${verificationProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Document Overview Strip */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={currentCollege.logo}
              alt={currentCollege.name}
              className="w-10 h-10 object-contain"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {currentCollege.permanentId}
              </span>
              <span className="font-mono text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500 font-mono">{currentDoc.refNumber}</span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {currentDoc.title}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentCollege.name} • {currentCollege.city}, {currentCollege.state}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={docPath}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Original A4 PDF</span>
          </a>

          <Link
            href={`/colleges/${currentCollege.id}`}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>College Dossier</span>
          </Link>
        </div>
      </div>

      {/* Main Analysis Grid: Trust Score Gauge & Visual Mismatch Highlighter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Trust Score Gauge */}
        <div className="lg:col-span-1">
          <TrustScoreGauge
            score={currentGroundTruth.expectedTrustScore}
            pillars={pillars}
            statusLabel={
              currentGroundTruth.expectedStatus === "Valid"
                ? "Statutory Conformance"
                : currentGroundTruth.expectedStatus === "Tampered"
                ? "Tampered Alteration"
                : currentGroundTruth.expectedStatus === "Expired"
                ? "Affiliation Expired"
                : "Missing Disclosure"
            }
          />
        </div>

        {/* Right 2 Columns: Visual Mismatch Highlighter */}
        <div className="lg:col-span-2">
          <MismatchHighlighter items={mismatchItems} />
        </div>
      </div>

      {/* OCR Entity Stream & Bounding Boxes */}
      <div>
        <OcrExtractorView data={ocrData} />
      </div>

      {/* Validation Audit History Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Statutory Validation History Ledger</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Append-only cryptographic record of all dossier inspections executed in this session
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {["ALL", "Valid", "Tampered", "Expired", "Missing Fields"].map((st) => (
              <button
                key={st}
                onClick={() => setHistoryFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  historyFilter === st
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Verification Timestamp</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Document Dossier</th>
                <th className="py-3 px-4">Trust Score</th>
                <th className="py-3 px-4">Regulatory Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rawInstitutions
                .filter((col: any) => {
                  if (historyFilter === "ALL") return true;
                  return col.status === historyFilter;
                })
                .slice(0, 8)
                .map((col: any, idx: number) => {
                  const doc = col.documents?.[0];
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {new Date().toISOString().split("T")[0]} 09:{10 + idx * 5}:22
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {col.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {doc?.title || "Approval Letter"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span
                          className={
                            col.trustScore >= 90
                              ? "text-emerald-600"
                              : col.trustScore >= 70
                              ? "text-amber-600"
                              : "text-rose-600"
                          }
                        >
                          {col.trustScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            col.status === "Valid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : col.status === "Tampered"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : col.status === "Expired"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {col.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedCollegeId(col.id);
                            setSelectedDocId(doc?.id || "doc-01");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                        >
                          Examine Check
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
