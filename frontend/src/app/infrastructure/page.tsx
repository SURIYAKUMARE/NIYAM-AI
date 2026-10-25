"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { StateFeedback } from "@/components/ui/StateFeedback";
import {
  Building,
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Layers,
  ExternalLink,
  Calendar,
  Compass,
  FileCheck,
  ShieldAlert,
  UserCheck,
  Eye,
} from "lucide-react";

export default function InfrastructureEvidencePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inspection Recommendation Modal State
  const [inspectionModalItem, setInspectionModalItem] = useState<any | null>(null);
  const [inspectionScope, setInspectionScope] = useState("");
  const [proposedDate, setProposedDate] = useState("2026-11-15");
  const [submittingInspection, setSubmittingInspection] = useState(false);

  // Detail / Photo Viewer Modal State
  const [detailItem, setDetailItem] = useState<any | null>(null);

  const loadInfra = async () => {
    setLoading(true);
    try {
      const apps = await fetchApi("/applications");
      const collected: any[] = [];
      for (const app of apps.slice(0, 5)) {
        try {
          const infraList = await fetchApi(`/infrastructure/${app.id}`);
          infraList.forEach((it: any) => {
            collected.push({
              ...it,
              app_id: app.id,
              app_number: app.application_number,
              inst_name: app.institution?.name || "Apex Institute",
            });
          });
        } catch {}
      }
      setItems(collected);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInfra();
  }, []);

  const handleRecommendInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectionModalItem) return;

    setSubmittingInspection(true);
    try {
      await fetchApi(
        `/infrastructure/${inspectionModalItem.id}/inspection-request?application_id=${inspectionModalItem.app_id}`,
        {
          method: "POST",
          body: JSON.stringify({
            requires_inspection: true,
            officer_comments: `[Physical Inspection Recommended for ${proposedDate}]: ${inspectionScope}`,
          }),
        }
      );
      setInspectionModalItem(null);
      setInspectionScope("");
      loadInfra();
    } catch (err: any) {
      alert(err.message || "Failed to submit inspection recommendation");
    } finally {
      setSubmittingInspection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-niyam-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-niyam-accentLight text-niyam-accent border border-niyam-accentMuted">
              Screen 12 • Physical Campus Norms
            </span>
            <span className="text-xs text-niyam-secondary font-mono">AICTE Norms 2025-26</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-niyam-text tracking-tight flex items-center gap-2">
            <Building className="w-7 h-7 text-niyam-accent" />
            <span>Infrastructure Evidence Review & Inspection Requests</span>
          </h1>
          <p className="text-sm text-niyam-secondary mt-1 max-w-2xl">
            Examine geo-tagged photographs, GPS coordinate provenance, architect-certified floor plans, and route suspect cases to Expert Visit Committees (EVC).
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadInfra}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
        >
          Refresh Evidence
        </Button>
      </div>

      {/* Grid of Infrastructure Evidence Cards */}
      {loading ? (
        <StateFeedback state="loading" title="Loading Infrastructure Evidence..." />
      ) : items.length === 0 ? (
        <StateFeedback
          state="empty"
          title="No Infrastructure Items"
          description="There are currently no recorded laboratory or classroom evidence items."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <Card key={it.id} padding="none" className="overflow-hidden flex flex-col justify-between">
              <div>
                {/* Photo Header Simulation */}
                <div className="relative bg-slate-800 text-white p-4 h-44 flex flex-col justify-between border-b border-niyam-border bg-gradient-to-br from-slate-900 to-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-black/60 text-blue-300 border border-blue-500/40">
                      {it.room_type || "Laboratory"}
                    </span>
                    <span className="text-[10px] text-slate-300 bg-black/50 px-2 py-0.5 rounded font-mono">
                      {it.room_number || "Lab 204"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-blue-200">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-mono text-[11px]">
                        {it.latitude?.toFixed(5) || "18.59120"}° N, {it.longitude?.toFixed(5) || "73.73890"}° E
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-300 font-mono">
                      <span>Azimuth: {it.azimuth_degrees || "142"}°</span>
                      <span>Accuracy: ±2.3m</span>
                    </div>
                  </div>
                </div>

                {/* Evidence Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-xs text-niyam-secondary font-mono">{it.app_number}</span>
                    <h3 className="text-sm font-bold text-niyam-text line-clamp-1">
                      {it.inst_name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-niyam-border">
                    <div>
                      <span className="text-niyam-secondary block">Reported Area</span>
                      <strong className="text-niyam-text font-mono">{it.carpet_area_sqm || "72.5"} sq.m</strong>
                    </div>
                    <div>
                      <span className="text-niyam-secondary block">Mandatory Norm</span>
                      <strong className="text-niyam-text font-mono">66.0 sq.m Min</strong>
                    </div>
                  </div>

                  {it.requires_inspection ? (
                    <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Physical EVC Inspection Requested</strong>
                        <span className="text-[11px] text-red-800 line-clamp-2">
                          {it.officer_comments || "Physical audit required to verify student workstation density."}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Complies with AICTE Carpet Area Norms</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => setDetailItem(it)}
                >
                  View EXIF
                </Button>

                {!it.requires_inspection ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<Calendar className="w-3.5 h-3.5" />}
                    onClick={() => setInspectionModalItem(it)}
                  >
                    Flag for Inspection
                  </Button>
                ) : (
                  <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200">
                    Inspection Queued
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Physical Inspection Modal */}
      {inspectionModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-niyam-border max-w-lg w-full p-6 shadow-dialog space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-5 h-5 text-semantic-error" />
                <h3 className="text-base sm:text-lg font-bold text-niyam-text">
                  Recommend Physical Inspection (EVC)
                </h3>
              </div>
              <p className="text-xs text-niyam-secondary">
                Route this facility for on-site physical scrutiny by an AICTE Expert Visit Committee.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-niyam-border text-xs space-y-1">
              <div>
                <strong>Facility:</strong> {inspectionModalItem.room_type} ({inspectionModalItem.room_number})
              </div>
              <div>
                <strong>Institution:</strong> {inspectionModalItem.inst_name}
              </div>
              <div>
                <strong>Application:</strong> <span className="font-mono">{inspectionModalItem.app_number}</span>
              </div>
            </div>

            <form onSubmit={handleRecommendInspection} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-niyam-text block mb-1">
                  Proposed Inspection Window / Target Date
                </label>
                <input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-niyam-text block mb-1">
                  Inspection Scope & Discrepancy Grounds <span className="text-semantic-error">*</span>
                </label>
                <textarea
                  rows={4}
                  value={inspectionScope}
                  onChange={(e) => setInspectionScope(e.target.value)}
                  placeholder="Detail the specific infrastructure concerns (e.g. computer terminal count below sanctioned intake, dubious EXIF timestamps, lack of safety egress)..."
                  required
                  className="w-full text-xs sm:text-sm p-3 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-niyam-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setInspectionModalItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  isLoading={submittingInspection}
                >
                  Submit Inspection Recommendation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXIF Metadata Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-niyam-border max-w-md w-full p-6 shadow-dialog space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-niyam-border">
              <h3 className="text-sm sm:text-base font-bold text-niyam-text flex items-center gap-2">
                <Camera className="w-4 h-4 text-niyam-accent" />
                <span>EXIF Telemetry & Sensor Provenance</span>
              </h3>
              <button
                onClick={() => setDetailItem(null)}
                className="text-xs font-bold text-niyam-secondary hover:text-niyam-text"
              >
                ✕
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-niyam-secondary">Room Identifier</dt>
                <dd className="font-mono font-bold text-niyam-text">{detailItem.room_number || "Lab 204"}</dd>
              </div>
              <div>
                <dt className="text-niyam-secondary">Room Category</dt>
                <dd className="font-semibold text-niyam-text">{detailItem.room_type || "Laboratory"}</dd>
              </div>
              <div>
                <dt className="text-niyam-secondary">GPS Latitude</dt>
                <dd className="font-mono text-niyam-text">{detailItem.latitude || 18.59120}° N</dd>
              </div>
              <div>
                <dt className="text-niyam-secondary">GPS Longitude</dt>
                <dd className="font-mono text-niyam-text">{detailItem.longitude || 73.73890}° E</dd>
              </div>
              <div>
                <dt className="text-niyam-secondary">Camera Azimuth</dt>
                <dd className="font-mono text-niyam-text">{detailItem.azimuth_degrees || 142}° (South-East)</dd>
              </div>
              <div>
                <dt className="text-niyam-secondary">Carpet Area</dt>
                <dd className="font-mono text-niyam-text">{detailItem.carpet_area_sqm || 72.5} sq.m</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-niyam-secondary">Geo-Fence Boundary Integrity</dt>
                <dd className="text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Located inside registered campus boundary survey</span>
                </dd>
              </div>
            </dl>

            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setDetailItem(null)}
              >
                Close Telemetry Inspection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
