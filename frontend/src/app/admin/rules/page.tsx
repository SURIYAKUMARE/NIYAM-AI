"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Sliders,
  PlusCircle,
  Play,
  CheckCircle,
  History,
  FileText,
  AlertTriangle,
  RefreshCw,
  Layers,
  ShieldCheck,
  Check
} from "lucide-react";

export default function RuleAdministrationPage() {
  const { user } = useAuth();
  const [ruleSets, setRuleSets] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("v2025.1");
  const [loading, setLoading] = useState(true);

  // New Draft Modal / State
  const [showNewDraftModal, setShowNewDraftModal] = useState(false);
  const [draftVersion, setDraftVersion] = useState("v2026.1");
  const [draftTitle, setDraftTitle] = useState("AICTE Approval Process Regulations 2026-27");
  const [draftNotes, setDraftNotes] = useState("Draft version with enhanced digital verification and green campus standards");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRuleSets = async () => {
    setLoading(true);
    try {
      const data = await fetchApi("/rules");
      setRuleSets(data);
      if (data.length > 0 && !selectedVersion) {
        setSelectedVersion(data[0].version);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuleSets();
  }, []);

  const currentRuleSet = ruleSets.find((r) => r.version === selectedVersion) || ruleSets[0];

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchApi("/rules", {
        method: "POST",
        body: JSON.stringify({
          version: draftVersion.trim(),
          title: draftTitle.trim(),
          effective_from: new Date().toISOString(),
          notes: draftNotes.trim(),
        }),
      });
      alert(`Draft rule set version '${draftVersion}' created successfully.`);
      setShowNewDraftModal(false);
      await loadRuleSets();
      setSelectedVersion(draftVersion);
    } catch (err: any) {
      alert(`Error creating draft: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateVersion = async (version: string) => {
    if (!confirm(`Are you sure you want to promote rule set '${version}' to ACTIVE status?`)) return;
    try {
      await fetchApi(`/rules/${version}/activate`, { method: "POST" });
      alert(`Rule set ${version} is now ACTIVE!`);
      loadRuleSets();
    } catch (err: any) {
      alert(`Error activating rule set: ${err.message}`);
    }
  };

  const handleTestAgainstSample = async (version: string) => {
    try {
      const res = await fetchApi(`/rules/${version}/test?sample_app_id=1`, { method: "POST" });
      alert(
        `Rule Engine Dry-Run Test Complete!\n\nTested Version: ${res.tested_version}\nSample Application: ${res.sample_application}\nFindings Detected: ${res.findings_count}\nValidation Status: ${res.validation_status}`
      );
    } catch (err: any) {
      alert(`Error testing rules: ${err.message}`);
    }
  };

  const isAdmin = user?.role === "admin" || user?.role === "supervising_authority";

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            Regulatory Compliance Engine
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Rule & Checklist Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage versioned statutory rules, deterministic condition types, and checklist applicability without altering historical evaluations
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadRuleSets}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
            title="Refresh Rules"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowNewDraftModal(true)}
              className="px-4 py-2 bg-navy-900 hover:bg-navy-850 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Draft Rule Set</span>
            </button>
          )}
        </div>
      </div>

      {/* Version Selector Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700">Select Rule Set Version:</span>
          <div className="flex space-x-2">
            {ruleSets.map((rs) => (
              <button
                key={rs.version}
                onClick={() => setSelectedVersion(rs.version)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition border flex items-center space-x-1.5 ${
                  selectedVersion === rs.version
                    ? "bg-navy-900 text-white border-navy-900 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                <span>{rs.version}</span>
                <span className={`text-[10px] px-1.5 rounded font-bold ${
                  rs.status === "ACTIVE"
                    ? "bg-emerald-500 text-white"
                    : rs.status === "DRAFT"
                    ? "bg-amber-400 text-slate-900"
                    : "bg-slate-400 text-white"
                }`}>
                  {rs.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {currentRuleSet && isAdmin && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleTestAgainstSample(currentRuleSet.version)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold transition border border-blue-200 flex items-center space-x-1"
            >
              <Play className="w-3.5 h-3.5 text-blue-600" />
              <span>Test Against Sample Applications</span>
            </button>

            {currentRuleSet.status === "DRAFT" && (
              <button
                onClick={() => handleActivateVersion(currentRuleSet.version)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition flex items-center space-x-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Activate Version</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Selected Version Metadata */}
      {currentRuleSet && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-900 text-sm">{currentRuleSet.title}</span>
              <p className="text-slate-500 mt-0.5">{currentRuleSet.handbook_edition}</p>
            </div>
            <div className="text-right text-slate-400 font-mono text-[11px]">
              Effective: {new Date(currentRuleSet.effective_from).toLocaleDateString()}
            </div>
          </div>
          {currentRuleSet.notes && (
            <p className="text-slate-600 italic pt-1 border-t border-slate-200/60">
              Note: {currentRuleSet.notes}
            </p>
          )}
        </div>
      )}

      {/* Rules Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Deterministic Regulatory Rules ({currentRuleSet?.rules?.length || 0})
          </h3>
          <span className="text-xs text-slate-500">
            Preserved for historical audit evaluation
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Rule Code & Title</th>
              <th className="px-6 py-3">Condition Type</th>
              <th className="px-6 py-3">Severity</th>
              <th className="px-6 py-3">Handbook Clause Reference</th>
              <th className="px-6 py-3 text-right">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentRuleSet?.rules?.map((rule: any) => (
              <tr key={rule.id} className="hover:bg-slate-50/70 transition">
                <td className="px-6 py-3.5">
                  <div className="font-bold text-slate-900">{rule.title}</div>
                  <div className="font-mono text-[11px] text-slate-400">{rule.rule_code}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{rule.description}</p>
                </td>
                <td className="px-6 py-3.5">
                  <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                    {rule.condition_type}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={rule.severity} type="finding" />
                </td>
                <td className="px-6 py-3.5 text-slate-600 text-[11px]">
                  {rule.source_handbook_ref}
                </td>
                <td className="px-6 py-3.5 text-right font-semibold text-emerald-600">
                  {rule.is_active ? "Active" : "Disabled"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Checklist Items Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Statutory Checklist Requirements ({currentRuleSet?.checklist_items?.length || 0})
          </h3>
          <span className="text-xs text-slate-500">
            Calibrated for category submissions
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Item Code</th>
              <th className="px-6 py-3">Document Title</th>
              <th className="px-6 py-3">Mandatory</th>
              <th className="px-6 py-3">Required Extraction Fields</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentRuleSet?.checklist_items?.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition">
                <td className="px-6 py-3.5 font-mono font-bold text-slate-800">
                  {item.item_code}
                </td>
                <td className="px-6 py-3.5">
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="text-[11px] text-slate-500">{item.description}</div>
                </td>
                <td className="px-6 py-3.5">
                  {item.is_mandatory ? (
                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold border border-rose-200 text-[10px]">
                      Mandatory
                    </span>
                  ) : (
                    <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded text-[10px]">
                      Optional
                    </span>
                  )}
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {item.required_fields?.map((f: string, i: number) => (
                      <span key={i} className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] border border-blue-200">
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Draft Modal */}
      {showNewDraftModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden">
            <div className="bg-navy-950 text-white px-6 py-4 flex items-center justify-between border-b border-navy-850">
              <h3 className="text-sm font-bold text-white">Create Draft Rule Set Version</h3>
              <button onClick={() => setShowNewDraftModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateDraft} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Version Identifier (e.g., v2026.1)
                </label>
                <input
                  type="text"
                  value={draftVersion}
                  onChange={(e) => setDraftVersion(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Rule Set Title
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Handbook Edition / Regulatory Notes
                </label>
                <textarea
                  rows={3}
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewDraftModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-navy-900 text-white rounded text-xs font-semibold hover:bg-navy-850 transition"
                >
                  {isSubmitting ? "Creating..." : "Save Draft Rule Set"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
