"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Building,
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Layers,
  ExternalLink
} from "lucide-react";

export default function InfrastructureEvidencePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isOfficer = user?.role === "scrutiny_officer" || user?.role === "supervising_authority";

  const loadInfra = async () => {
    setLoading(true);
    try {
      // Pull infra items for first 3 apps
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

  const handleToggleInspection = async (item: any) => {
    const comments = prompt(
      "Enter officer justification for physical inspection requirement:",
      item.officer_comments || "Visible density discrepancy requires Expert Visit verification"
    );
    if (!comments) return;

    try {
      await fetchApi(`/infrastructure/${item.id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          inspection_recommended: !item.inspection_recommended,
          officer_comments: comments,
        }),
      });
      alert("Infrastructure review record updated.");
      loadInfra();
    } catch (err: any) {
      alert(`Error updating infrastructure item: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            Physical Campus & Laboratory Norms
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Infrastructure Evidence & Computer Vision Review
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Photographs, geotagged campus facilities, CV terminal detection, and Physical Inspection triggers
          </p>
        </div>

        <button
          onClick={loadInfra}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition self-start md:self-auto"
          title="Refresh Items"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Statutory Clarification on CV */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-xs text-blue-900 flex items-start space-x-3">
        <Building className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold block mb-0.5">Statutory Evaluation Limit:</span>
          Computer Vision suggests visible equipment count discrepancies based on optical object detection only. Photographs do not establish structural safety, exact structural dimensions, or ownership. Where discrepancies exist, officers must trigger the official <strong>&quot;Physical Inspection May Be Required&quot;</strong> workflow.
        </div>
      </div>

      {/* Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 bg-white p-12 text-center text-slate-400 text-xs rounded-lg border border-slate-200">
            Loading infrastructure evidence records...
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center text-slate-400 text-xs rounded-lg border border-slate-200">
            No infrastructure evidence items found.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
              {/* Visual Simulated Evidence Banner */}
              <div className="relative bg-slate-800 h-44 flex items-center justify-center text-slate-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10" />
                {/* Simulated Geotag Watermark */}
                <div className="absolute top-3 left-3 z-20 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-mono flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-red-400" />
                  <span>
                    Lat: {item.geo_lat || 18.5204}° N, Long: {item.geo_long || 73.8567}° E
                  </span>
                </div>

                <div className="absolute top-3 right-3 z-20">
                  {item.inspection_recommended ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow">
                      Physical Inspection Required
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow">
                      Norms Compliant
                    </span>
                  )}
                </div>

                {/* Simulated Photo Graphic Canvas */}
                <div className="text-center z-10 px-4">
                  <Camera className="w-8 h-8 text-blue-400 mx-auto mb-1 opacity-80" />
                  <span className="text-xs font-semibold text-white block">
                    {item.file_name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Uploaded Facility Evidence Capture
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 z-20 text-white text-xs font-semibold">
                  {item.caption}
                </div>
              </div>

              {/* Data & Computer Vision Metrics */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-900">
                      Application: <Link href={`/applications/${item.app_id}`} className="text-blue-600 font-mono hover:underline">{item.app_number}</Link>
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono capitalize">
                      {item.facility_type.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        Reported Carpet Area
                      </span>
                      <span className="font-mono text-slate-800 font-semibold">
                        {item.reported_area_sqm} sq.m
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        (Norm: {item.required_area_sqm} sq.m)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        Equipment / Workstations
                      </span>
                      <span className="font-mono text-slate-800 font-semibold">
                        {item.reported_equipment_count} Reported
                      </span>
                      <span className={`text-[10px] block font-semibold ${item.cv_detected_count < item.reported_equipment_count * 0.7 ? "text-rose-600" : "text-emerald-600"}`}>
                        (CV Detected: {item.cv_detected_count})
                      </span>
                    </div>
                  </div>

                  {/* CV Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">CV Tags:</span>
                    {item.cv_tags?.map((tag: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {item.officer_comments && (
                    <div className="mt-3 text-[11px] p-2 bg-amber-50 rounded border border-amber-200 text-amber-900">
                      <strong>Scrutiny Officer Observation:</strong> {item.officer_comments}
                    </div>
                  )}
                </div>

                {isOfficer && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Physical Inspection Workflow
                    </span>
                    <button
                      onClick={() => handleToggleInspection(item)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                        item.inspection_recommended
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                      }`}
                    >
                      {item.inspection_recommended ? "Clear Inspection Flag" : "Flag: Physical Inspection Required"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
