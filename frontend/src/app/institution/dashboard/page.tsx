"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ContextPanel } from "@/components/stitch/ContextPanel";
import { SummaryBand } from "@/components/stitch/SummaryBand";
import { DataTable, Column } from "@/components/stitch/DataTable";
import {
  Building2,
  PlusCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Layers,
  Inbox,
  FileCheck2,
  MapPin,
  Calendar,
  Globe,
  Mail,
  Phone,
  Landmark,
  Award,
  Sparkles,
  ImageIcon,
  ChevronDown,
} from "lucide-react";
import rawInstitutions from "../../../../data/seed/institutions.json";

export default function InstitutionDashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active institution showcase state for applicant demo
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("nit-nilgiri");
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  const selectedCollege = rawInstitutions.find((c: any) => c.id === selectedCollegeId) || rawInstitutions[0];
  const activePhoto = selectedCollege?.photos?.[activePhotoIdx] || selectedCollege?.photos?.[0];

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsData, findingsData] = await Promise.all([
        fetchApi("/applications"),
        fetchApi("/validation/findings"),
      ]);
      setApplications(appsData || []);
      setFindings(findingsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDeficiencies = findings.filter((f) => f.status === "OPEN" && f.severity === "CRITICAL");
  const preliminaryVerified = applications.filter(
    (a) => a.status === "PRELIMINARY_CHECK_PASSED" || a.status === "RESUBMITTED" || a.status === "APPROVED_BY_AUTHORITY"
  );
  const pendingScrutiny = applications.filter(
    (a) => a.status === "SUBMITTED_FOR_SCRUTINY" || a.status === "UNDER_SCRUTINY"
  );

  const columns: Column<any>[] = [
    {
      header: "Application Number",
      cell: (app) => (
        <Link
          href={`/applications/${app.id}`}
          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors"
        >
          <span className="font-mono">{app.application_number}</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      ),
    },
    {
      header: "Approval Category",
      cell: (app) => (
        <span className="capitalize text-slate-800 dark:text-slate-200">
          {app.category_code?.replace(/_/g, " ") || "Extension of Approval"}
        </span>
      ),
    },
    {
      header: "Academic Session",
      cell: (app) => (
        <span className="font-mono text-slate-500 dark:text-slate-400">
          {app.academic_year || "2025-2026"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (app) => <StatusBadge status={app.status} type="application" />,
    },
    {
      header: "AI Advisory Risk",
      cell: (app) => {
        const score = Number(app.overall_risk_score || 0);
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full ${
                  score > 50
                    ? "bg-rose-500"
                    : score > 20
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {score.toFixed(0)}%
            </span>
          </div>
        );
      },
    },
    {
      header: "Action",
      className: "text-right",
      cell: (app) => (
        <Link
          href={`/applications/${app.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
        >
          <span>Open Workspace</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Reference-Matched Context Panel */}
      <ContextPanel
        title={`${selectedCollege.name} Portal`}
        subtitle={`Welcome, ${user?.full_name || "Institution Applicant"} (${user?.role || "applicant"}) — Manage statutory approval dossiers, upload verified documents, and rectify compliance observations.`}
        badge="Applicant Portal"
        actionText="+ New Application"
        actionHref="/institution/applications/new"
      >
        <Link
          href="/applications"
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
        >
          My Applications
        </Link>
        <Link
          href={`/colleges/${selectedCollege.id}`}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
        >
          College Directory
        </Link>
        <Link
          href="/clarifications"
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
        >
          Clarifications
        </Link>
        <button
          onClick={loadData}
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          title="Refresh Dossier Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </ContextPanel>

      {/* College Identity & Campus Visual Showcase */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 sm:p-7 shadow-xs space-y-6 transition-colors">
        {/* Top Bar: Emblem, Title, Status, and Institution Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={selectedCollege.logo}
                alt={`${selectedCollege.name} Official Emblem`}
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded font-mono text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {selectedCollege.permanentId}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Trust Score {selectedCollege.trustScore}/100
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Est. {selectedCollege.establishedYear}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {selectedCollege.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{selectedCollege.address}</span>
              </p>
            </div>
          </div>

          {/* Quick College Switcher for Demo / Evaluation */}
          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <div className="relative">
              <select
                value={selectedCollegeId}
                onChange={(e) => {
                  setSelectedCollegeId(e.target.value);
                  setActivePhotoIdx(0);
                }}
                className="appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition max-w-[240px] truncate"
              >
                {rawInstitutions.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <Link
              href={`/colleges/${selectedCollege.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors"
            >
              <span>Full Dossier</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2-Column Showcase: Photos on Left / Infrastructure Metrics on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Active Campus Photo View with Thumbnails (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-[16/10] group shadow-sm">
              <img
                src={activePhoto?.path}
                alt={activePhoto?.alt || selectedCollege.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
              
              {/* Photo Title Overlay */}
              <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/90 backdrop-blur-sm uppercase tracking-wider mb-1">
                  <ImageIcon className="w-3 h-3" />
                  {activePhoto?.type === "campus" ? "Campus Architecture" : activePhoto?.type === "classroom" ? "Smart Classroom" : "Research Lab"}
                </span>
                <p className="text-sm font-bold text-white truncate drop-shadow-xs">
                  {activePhoto?.title}
                </p>
                <p className="text-[11px] text-slate-300 line-clamp-1 drop-shadow-xs mt-0.5">
                  {activePhoto?.alt}
                </p>
              </div>

              {/* Geotagged badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-white/10 shadow-sm">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Geotagged &amp; Verified
                </span>
              </div>
            </div>

            {/* 3 Interactive Photo Selector Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {selectedCollege.photos?.map((photo: any, idx: number) => {
                const isActive = activePhotoIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative rounded-xl overflow-hidden border p-1 text-left transition-all flex items-center gap-2.5 ${
                      isActive
                        ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="w-10 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                      <img src={photo.path} alt={photo.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 pr-1">
                      <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate capitalize">
                        {photo.type}
                      </span>
                      <span className="block text-[9px] text-slate-500 dark:text-slate-400 truncate">
                        {photo.type === "campus" ? "Exterior View" : photo.type === "classroom" ? "Lecture Hall" : "Equipment"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Key Institutional Metrics & Contacts (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Campus Area
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                  {selectedCollege.campusAreaAcres} Acres
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Exceeds 7.5 Ac Norm
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Built-Up Space
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                  {selectedCollege.builtUpAreaSqm?.toLocaleString()} m²
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Approved Plan
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Sanctioned Intake
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                  {selectedCollege.intake} Seats
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">
                  {selectedCollege.courses?.length || 5} Degree Branches
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Faculty Cadre
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                  {selectedCollege.facultyCount} Members
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                  1:15 Prescribed Ratio
                </span>
              </div>
            </div>

            {/* Sponsoring Entity & Accreditation Strip */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300">
                  Sponsoring Entity
                </span>
                <span className="font-semibold text-blue-900 dark:text-blue-200">
                  {selectedCollege.legalEntityType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300">
                  Statutory Standing
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {selectedCollege.statusReason || "Compliant with AICTE APH 2025-26"}
                </span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{selectedCollege.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{selectedCollege.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <a
                  href={selectedCollege.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-blue-600 dark:text-blue-400 hover:underline truncate"
                >
                  {selectedCollege.website}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Early Deficiencies Alert Banner */}
      {openDeficiencies.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Action Required: {openDeficiencies.length} Critical Deficiencies Flagged
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                Deterministic validation detected checklist deficiencies or expired statutory certificates.
                Rectify flagged documents prior to official scrutiny lock.
              </p>
            </div>
          </div>
          <Link
            href={applications.length > 0 ? `/applications/${applications[0].id}` : "#"}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0 transition shadow-xs self-start sm:self-center"
          >
            Review &amp; Rectify
          </Link>
        </div>
      )}

      {/* Summary Band */}
      <SummaryBand
        metrics={[
          {
            label: "Total Applications",
            value: applications.length,
            subtext: "Academic Session 2025-26",
            tone: "blue",
            icon: FileText,
          },
          {
            label: "Awaiting Action",
            value: applications.filter((a) => a.status === "DRAFT" || a.status === "CLARIFICATION_REQUESTED").length,
            subtext: "Drafts & pending responses",
            tone: "amber",
            icon: Clock,
          },
          {
            label: "Under Scrutiny",
            value: pendingScrutiny.length,
            subtext: "Assigned to scrutiny officers",
            tone: "blue",
            icon: Layers,
          },
          {
            label: "Verified / Approved",
            value: preliminaryVerified.length,
            subtext: "Statutory requirements confirmed",
            tone: "emerald",
            icon: CheckCircle2,
          },
        ]}
      />

      {/* Applications Data Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Institutional Filings &amp; Applications
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live records persisted in Supabase PostgreSQL with Row Level Security.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            Rule Engine: v2025.1
          </span>
        </div>

        <DataTable
          data={applications}
          columns={columns}
          searchPlaceholder="Search by Application Number or Category..."
          searchFilter={(item, q) =>
            item.application_number?.toLowerCase().includes(q) ||
            item.category_code?.toLowerCase().includes(q)
          }
          emptyTitle="No applications found"
          emptyDescription="You have not created any approval applications yet. Click 'Create Application' to begin."
        />
      </div>
    </div>
  );
}
