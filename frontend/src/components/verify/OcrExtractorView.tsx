"use client";

import React, { useState } from "react";
import {
  FileText,
  Scan,
  Hash,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code,
  Layers,
} from "lucide-react";

export interface OcrExtractedData {
  fileName: string;
  fileSize: string;
  pages: number;
  sha256: string;
  qrPayload: string;
  isQrValid: boolean;
  fields: Array<{
    label: string;
    value: string;
    confidence: number;
    bbox?: string;
  }>;
  rawTextPreview: string;
}

interface OcrExtractorViewProps {
  data: OcrExtractedData;
}

export function OcrExtractorView({ data }: OcrExtractorViewProps) {
  const [activeTab, setActiveTab] = useState<"fields" | "raw">("fields");

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden space-y-0">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scan className="w-5 h-5 text-[#0F6B6B] dark:text-teal-400" />
            <span>AI Optical Character Recognition (OCR) &amp; Feature Extraction</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time visual feature parsing, layout analysis, and digital signature detection
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab("fields")}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "fields"
                ? "bg-white dark:bg-slate-900 text-[#0F6B6B] dark:text-teal-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Extracted Entities</span>
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "raw"
                ? "bg-white dark:bg-slate-900 text-[#0F6B6B] dark:text-teal-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>OCR Stream</span>
          </button>
        </div>
      </div>

      {/* Cryptographic & QR Ledger Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50/90 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs">
        {/* SHA-256 Digest */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
          <Hash className="w-4 h-4 text-[#0F6B6B] dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Cryptographic SHA-256 Digest
            </span>
            <span className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all">
              {data.sha256}
            </span>
          </div>
        </div>

        {/* QR Code Payload Cross-Check */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
          <QrCode className="w-4 h-4 text-[#0F6B6B] dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Embedded QR Code Provenance
              </span>
              {data.isQrValid ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Valid Link
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3 h-3" /> QR Altered
                </span>
              )}
            </div>
            <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate block mt-0.5">
              {data.qrPayload}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "fields" ? (
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.fields.map((field, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span className="font-semibold">{field.label}</span>
                  <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                    {field.confidence.toFixed(1)}% conf
                  </span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-xs font-mono break-words">
                  {field.value}
                </div>
                {field.bbox && (
                  <div className="text-[9px] text-slate-400 font-mono mt-1">
                    BBox: {field.bbox}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-5">
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap border border-slate-800">
            {data.rawTextPreview}
          </pre>
        </div>
      )}
    </div>
  );
}
