"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { DocumentViewerModal } from "@/components/common/DocumentViewerModal";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SearchCode, FileText, CheckCircle, AlertCircle, RefreshCw, ExternalLink, Filter } from "lucide-react";

export default function DocumentReviewWorkspace() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("");

  const loadDocs = async () => {
    setLoading(true);
    try {
      const apps = await fetchApi("/applications");
      setApplications(apps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  // Collect all uploaded documents across applications
  const allDocs: any[] = [];
  applications.forEach((app) => {
    app.documents?.forEach((doc: any) => {
      if (doc.current_version_id) {
        allDocs.push({
          ...doc,
          app_id: app.id,
          app_number: app.application_number,
          inst_name: app.institution?.name || "Applicant Institute",
          latest_version: doc.versions?.[doc.versions.length - 1],
        });
      }
    });
  });

  const filteredDocs = filterType
    ? allDocs.filter((d) => d.checklist_item_code === filterType)
    : allDocs;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Official Scrutiny Tool
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Document Evidence Review Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-inspect structured OCR field extractions, visual bounding boxes, and execute authorized field corrections
          </p>
        </div>

        <button
          onClick={loadDocs}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition self-start md:self-auto"
          title="Refresh Documents"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Checklist Category:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
          >
            <option value="">All Document Types ({allDocs.length})</option>
            <option value="DOC-EOA">Previous AICTE Extension of Approval (EoA)</option>
            <option value="DOC-FIRE-NOC">Fire & Life Safety NOC</option>
            <option value="DOC-LAND-DEED">Registered Land Ownership Deed</option>
            <option value="DOC-BUILDING-PLAN">Sanctioned Building Plan</option>
            <option value="DOC-AFFILIATION">University Affiliation Order</option>
            <option value="DOC-TER-RECEIPT">TER Fee Payment Receipt</option>
          </select>
        </div>
        <span className="text-slate-400 text-[11px]">
          Showing {filteredDocs.length} uploaded statutory documents
        </span>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Document Checklist Slot</th>
              <th className="px-6 py-3">Application Reference</th>
              <th className="px-6 py-3">File Name & Version</th>
              <th className="px-6 py-3">Extracted Fields</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Evidence Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Loading statutory documents...
                </td>
              </tr>
            ) : filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No documents found for this category filter.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc: any) => {
                const fields = doc.latest_version?.extracted_fields || [];
                const lowConfCount = fields.filter((f: any) => f.is_low_confidence && !f.is_corrected).length;
                const correctedCount = fields.filter((f: any) => f.is_corrected).length;

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-900">{doc.title}</div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {doc.checklist_item_code}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/applications/${doc.app_id}`}
                        className="font-mono font-bold text-blue-600 hover:underline"
                      >
                        {doc.app_number}
                      </Link>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {doc.inst_name}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-800">{doc.latest_version?.file_name}</div>
                      <span className="text-[10px] text-slate-400">
                        Version {doc.latest_version?.version_number} | {(doc.latest_version?.file_size / 1024).toFixed(0)} KB
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-slate-700">{fields.length} Fields</span>
                        {lowConfCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            {lowConfCount} Low Conf
                          </span>
                        )}
                        {correctedCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {correctedCount} Corrected
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={doc.status} type="application" />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedDoc({
                            title: doc.title,
                            fileName: doc.latest_version?.file_name,
                            code: doc.checklist_item_code,
                            fields: fields,
                          });
                        }}
                        className="px-3 py-1 bg-navy-900 hover:bg-navy-850 text-white rounded text-xs font-medium transition shadow-sm flex items-center space-x-1.5 ml-auto"
                      >
                        <SearchCode className="w-3.5 h-3.5" />
                        <span>Inspect & Correct</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <DocumentViewerModal
          isOpen={true}
          onClose={() => setSelectedDoc(null)}
          documentTitle={selectedDoc.title}
          fileName={selectedDoc.fileName}
          checklistCode={selectedDoc.code}
          fields={selectedDoc.fields}
          onFieldCorrected={loadDocs}
        />
      )}
    </div>
  );
}
