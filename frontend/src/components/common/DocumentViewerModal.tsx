"use client";

import React, { useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  X,
  Check,
  Edit2,
  AlertCircle,
  FileText,
  Shield,
  Layers,
  Sparkles,
  Search,
} from "lucide-react";

interface ExtractedField {
  id: number;
  field_name: string;
  original_value: string;
  corrected_value?: string;
  confidence_score: number;
  is_low_confidence: boolean;
  page_number: number;
  bounding_box?: number[];
  raw_text_excerpt?: string;
  extraction_method: string;
  is_corrected: boolean;
}

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  fileName: string;
  checklistCode: string;
  fields: ExtractedField[];
  onFieldCorrected?: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  fileName,
  checklistCode,
  fields,
  onFieldCorrected,
}) => {
  const [selectedField, setSelectedField] = useState<ExtractedField | null>(
    fields[0] || null
  );
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);
  const [correctionValue, setCorrectionValue] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleStartCorrection = (field: ExtractedField) => {
    setEditingFieldId(field.id);
    setCorrectionValue(field.corrected_value || field.original_value || "");
    setCorrectionReason("");
    setSuccessMsg("");
  };

  const handleSaveCorrection = async (fieldId: number) => {
    if (!correctionValue.trim() || !correctionReason.trim()) {
      alert("Please provide both the corrected value and the statutory correction reason.");
      return;
    }
    setIsSubmitting(true);
    try {
      await fetchApi(`/extraction/field/${fieldId}/correct`, {
        method: "POST",
        body: JSON.stringify({
          new_value: correctionValue.trim(),
          reason: correctionReason.trim(),
        }),
      });
      setSuccessMsg("Field correction recorded with audit trail.");
      setEditingFieldId(null);
      if (onFieldCorrected) {
        onFieldCorrected();
      }
    } catch (err: any) {
      alert(`Error saving correction: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#14202B]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E3E8EE] w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#14202B] text-white px-6 py-4 flex items-center justify-between border-b border-[#243447]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {documentTitle}
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  {checklistCode}
                </span>
              </div>
              <p className="text-xs text-[#8FA2B4] mt-0.5">
                File: {fileName} · AI Advisory OCR Extraction with Bounding-Box Geometry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8FA2B4] hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition text-xs font-semibold flex items-center gap-1"
            title="Close Viewer"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body - Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Document Visual Preview & Bounding Box */}
          <div className="w-full md:w-1/2 bg-[#F7F9FB] border-r border-[#E3E8EE] p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-[#5B6B7A] font-medium">
                <span className="font-semibold text-[#14202B]">
                  Visual Evidence Scan (Page {selectedField?.page_number || 1})
                </span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E3E8EE] text-[#2563EB] font-bold">
                  Scale: 100% · Overlay Active
                </span>
              </div>

              {/* Simulated Official Document Sheet */}
              <div className="relative bg-white border border-[#E3E8EE] rounded-xl shadow-xs p-8 min-h-[460px] text-[#14202B] text-xs font-serif leading-relaxed">
                {/* Government Watermark Header */}
                <div className="text-center pb-4 mb-4 border-b border-[#E3E8EE]">
                  <div className="font-sans font-extrabold text-[#14202B] uppercase tracking-widest text-[11px]">
                    Statutory Institutional Evidence Record
                  </div>
                  <div className="text-[10px] text-[#5B6B7A] font-sans mt-0.5">
                    Official Regulatory Filing · AICTE National Bureau
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] text-[#5B6B7A] font-sans">
                    To Competent Scrutiny Authority / AICTE Bureau,
                  </p>

                  <p className="text-justify text-[11px] text-[#14202B] leading-relaxed">
                    This is to formally certify and place on record that the statutory requirements
                    and institutional norms under the AICTE Approval Process Handbook (APH 2025-26)
                    have been compiled for the referenced engineering and technical programmes.
                  </p>

                  {/* Highlighted Bounding Box Target */}
                  {selectedField && (
                    <div className="relative p-3 rounded-lg bg-blue-50/80 border-2 border-[#2563EB] shadow-xs transition-all">
                      <div className="absolute -top-2.5 left-2 px-2 py-0.5 rounded bg-[#2563EB] text-white font-sans text-[9px] font-bold tracking-wider uppercase">
                        FIELD: {selectedField.field_name.replace(/_/g, " ")}
                      </div>
                      <p className="font-mono text-xs text-[#14202B] font-bold mt-1">
                        &quot;{selectedField.raw_text_excerpt || selectedField.original_value}&quot;
                      </p>
                      <div className="text-[10px] font-sans text-[#5B6B7A] mt-2 flex items-center justify-between border-t border-blue-200/60 pt-1">
                        <span className="font-semibold text-[#2563EB]">
                          Confidence: {(selectedField.confidence_score * 100).toFixed(0)}%
                        </span>
                        <span className="font-mono text-[9px]">
                          Parser: {selectedField.extraction_method}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-[#5B6B7A] text-justify font-sans leading-relaxed">
                    All land titles, structural safety assurances, building carpet measurements, and
                    cadre ratios attested herein conform strictly with relevant legal enactments.
                  </p>

                  <div className="pt-8 flex justify-between items-end text-[10px] text-[#5B6B7A] font-sans border-t border-[#E3E8EE]/50 mt-6">
                    <div>
                      <div className="font-bold text-[#14202B]">Digital Verification Stamp</div>
                      <div className="font-mono text-[9px]">SHA256: 8f3a9e...e7b2</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#14202B]">Authorized Signatory</div>
                      <div>Apex Institute Registrar</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-xl border border-[#E3E8EE] text-[11px] text-[#5B6B7A] flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span>
                Bounding box coordinates provide traceable spatial provenance directly from the uploaded artifact.
              </span>
            </div>
          </div>

          {/* Right: Extracted Fields & Human-in-the-Loop Correction */}
          <div className="w-full md:w-1/2 bg-white p-6 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3E8EE]">
              <h4 className="text-xs font-bold text-[#14202B] uppercase tracking-wider">
                Extracted Fields ({fields.length})
              </h4>
              <span className="text-[11px] text-[#5B6B7A]">
                Select a field to highlight geometry
              </span>
            </div>

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-3 flex-1">
              {fields.map((f) => {
                const isSelected = selectedField?.id === f.id;
                const isEditing = editingFieldId === f.id;

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedField(f)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#2563EB] bg-blue-50/30 ring-1 ring-[#2563EB]"
                        : "border-[#E3E8EE] hover:border-[#2563EB]/40 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#14202B] capitalize">
                          {f.field_name.replace(/_/g, " ")}
                        </span>
                        {f.is_low_confidence && !f.is_corrected && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Low Conf ({(f.confidence_score * 100).toFixed(0)}%)</span>
                          </span>
                        )}
                        {f.is_corrected && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Human Corrected
                          </span>
                        )}
                      </div>

                      {!isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartCorrection(f);
                          }}
                          className="flex items-center gap-1 text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-semibold px-2 py-0.5 rounded-lg hover:bg-blue-50 transition"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Correct</span>
                        </button>
                      )}
                    </div>

                    {!isEditing ? (
                      <div className="mt-2 text-xs">
                        <div className="text-[#14202B] font-mono font-bold bg-[#F7F9FB] px-3 py-1.5 rounded-lg border border-[#E3E8EE]">
                          {f.corrected_value || f.original_value || "<Empty>"}
                        </div>
                        {f.is_corrected && (
                          <div className="text-[11px] text-[#5B6B7A] mt-1.5 font-medium">
                            Original OCR extracted value:{" "}
                            <span className="line-through text-rose-600">{f.original_value}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 p-3.5 bg-[#F7F9FB] border border-[#2563EB]/40 rounded-xl space-y-2.5">
                        <div className="text-[11px] font-bold text-[#14202B]">
                          Authorize Field Value Correction
                        </div>
                        <div>
                          <label className="text-[10px] text-[#5B6B7A] font-bold uppercase tracking-wider block mb-1">
                            New Verified Value
                          </label>
                          <input
                            type="text"
                            value={correctionValue}
                            onChange={(e) => setCorrectionValue(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 border border-[#E3E8EE] rounded-lg bg-white text-[#14202B] focus:ring-2 focus:ring-[#2563EB] outline-none"
                            placeholder="Enter corrected value"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#5B6B7A] font-bold uppercase tracking-wider block mb-1">
                            Mandatory Correction Reason (Audit Trail)
                          </label>
                          <input
                            type="text"
                            value={correctionReason}
                            onChange={(e) => setCorrectionReason(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 border border-[#E3E8EE] rounded-lg bg-white text-[#14202B] focus:ring-2 focus:ring-[#2563EB] outline-none"
                            placeholder="e.g., OCR misread blurred character 'I' as '1' in institute name"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingFieldId(null)}
                            className="px-3 py-1 text-xs text-[#5B6B7A] hover:bg-[#E3E8EE] rounded-lg font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleSaveCorrection(f.id)}
                            className="px-3.5 py-1 text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg transition shadow-xs disabled:opacity-60"
                          >
                            {isSubmitting ? "Saving..." : "Save & Record Audit"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E3E8EE] text-[10px] text-[#5B6B7A] leading-relaxed">
              Field corrections maintain an append-only cryptographic log linking the modifying user, original OCR reading, timestamp, and justification.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
