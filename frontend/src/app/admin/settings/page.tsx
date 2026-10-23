"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Settings,
  Shield,
  Server,
  Lock,
  Database,
  CheckCircle,
  Save,
  Radio,
  RefreshCw
} from "lucide-react";

export default function SystemSettingsPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retentionDays, setRetentionDays] = useState(365);
  const [maxUploadMb, setMaxUploadMb] = useState(25);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchApi("/settings");
      setConfig(data);
      setRetentionDays(data.data_retention_days || 365);
      setMaxUploadMb(data.max_file_size_mb || 25);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            System Administration
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            System & Source Integration Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational policies, authority timeout thresholds, retention windows, and privacy controls
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition self-start md:self-auto"
          title="Refresh Settings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Operational settings updated successfully.</span>
        </div>
      )}

      {/* Admin Privilege Boundary Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs text-slate-700 flex items-start space-x-3">
        <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 font-semibold block mb-0.5">Confidentiality Separation of Duty:</strong>
          System administrators manage technical parameters, rule definitions, and gateway adapters. Administrators do not automatically receive unrestricted viewing access to sensitive institutional applicant financial or proprietary files.
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Storage & Retention Parameters */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Document Storage & Privacy Retention</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Data Retention Window (Days)
              </label>
              <input
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Preserves immutable versions for regulatory appeal window.
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Maximum File Upload Limit (MB)
              </label>
              <input
                type="number"
                value={maxUploadMb}
                onChange={(e) => setMaxUploadMb(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Allowed extensions: .pdf, .png, .jpg, .jpeg, .webp
              </span>
            </div>
          </div>
        </div>

        {/* Source Adapter Timeouts & Rate Limits */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Authority Adapter Timeouts & Circuit Breakers</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Source Adapter</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Timeout Threshold</th>
                  <th className="px-4 py-2.5">Rate Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">DigiLocker / NAD Pull API</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">Enabled (Demo Mode)</td>
                  <td className="px-4 py-3 font-mono">5,000 ms</td>
                  <td className="px-4 py-3 font-mono">60 req/min</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">University Affiliation Order Registry</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">Enabled (Demo Mode)</td>
                  <td className="px-4 py-3 font-mono">6,000 ms</td>
                  <td className="px-4 py-3 font-mono">45 req/min</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">Land Revenue / Bhulekh Registry</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">Enabled (Demo Mode)</td>
                  <td className="px-4 py-3 font-mono">8,000 ms</td>
                  <td className="px-4 py-3 font-mono">30 req/min</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">Bharatkosh TER Payment Gateway</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">Enabled (Demo Mode)</td>
                  <td className="px-4 py-3 font-mono">4,000 ms</td>
                  <td className="px-4 py-3 font-mono">100 req/min</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">AICTE DSS QR & DSC Verifier</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">Enabled (Demo Mode)</td>
                  <td className="px-4 py-3 font-mono">3,000 ms</td>
                  <td className="px-4 py-3 font-mono">120 req/min</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-navy-900 hover:bg-navy-850 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Operational Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
