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
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs overflow-hidden space-y-0 transition-colors">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scan className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                ? "bg-white dark:bg-[#0F172A] text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
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
                ? "bg-white dark:bg-[#0F172A] text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
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
        <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
          <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
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
        <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
          <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                QR Verification Route Cross-Check
              </span>
              {data.isQrValid ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Resolves
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3 h-3" />
                  Mismatched
                </span>
              )}
            </div>
            <a
              href={data.qrPayload}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5 truncate"
            >
              <span className="truncate">{data.qrPayload}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Content View: Extracted Entities Table OR Raw Text Stream */}
      {activeTab === "fields" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">Entity Key</th>
                <th className="py-2.5 px-4">Extracted String Value</th>
                <th className="py-2.5 px-4">OCR Confidence</th>
                <th className="py-2.5 px-4">Bounding Box</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.fields.map((field, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {field.label}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                    {field.value}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${field.confidence * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">
                        {(field.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400">
                    {field.bbox || "[x: 42, y: 110, w: 240, h: 22]"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap select-all">
          {data.rawTextPreview}
        </div>
      )}
    </div>
  );
}
