"use client";

import React, { useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  GraduationCap,
  MapPin,
  Calendar,
  Building,
  Mail,
  Phone,
  Globe,
  FileCheck2,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  Landmark,
  Layers,
  Sparkles,
  Award,
  CheckCircle2,
  Users,
} from "lucide-react";
import { PhotoGallery } from "@/components/colleges/PhotoGallery";
import { TrustScoreGauge } from "@/components/verify/TrustScoreGauge";
import rawInstitutions from "../../../../data/seed/institutions.json";

export default function CollegeDetailPage() {
  const params = useParams();
  const collegeId = params?.id as string;

  const college = rawInstitutions.find((c: any) => c.id === collegeId);

  if (!college) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-4">
        <GraduationCap className="w-12 h-12 mx-auto text-slate-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Institution Not Found</h2>
        <p className="text-sm text-slate-500">
          No synthetic college matches identifier <code className="font-mono">{collegeId}</code>.
        </p>
        <Link
          href="/colleges"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Institutions Directory</span>
        </Link>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "documents">("overview");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Valid":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Approved APH 2025-26
          </span>
        );
      case "Tampered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Tampered Anomaly Flagged
          </span>
        );
      case "Expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Affiliation Term Expired
          </span>
        );
      case "Missing Fields":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <AlertTriangle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Missing Statutory Mandatory Fields
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link
          href="/colleges"
          className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Institutions Directory</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
          {college.name}
        </span>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Logo and Core Details */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={college.logo}
                alt={`${college.name} Original Emblem`}
                className="w-16 h-16 object-contain"
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {college.permanentId}
                </span>
                {getStatusBadge(college.status)}
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {college.name}
              </h1>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {college.city}, {college.state} - {college.pincode}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Established {college.establishedYear}
                </span>
                <span className="flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-slate-400" />
                  {college.legalEntityType}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-row md:flex-col items-center md:items-end gap-2.5 shrink-0">
            <Link
              href={`/verify?collegeId=${college.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Verify Institutional Dossier</span>
            </Link>

            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              Trust Score: {college.trustScore}/100
            </span>
          </div>
        </div>

        {/* Quick Contacts & Website Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">{college.contactEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">{college.contactPhone}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate font-mono">{college.website}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === "overview"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <span>Overview &amp; Verified Photos</span>
          {activeTab === "overview" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === "documents"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <span>Sample Regulatory Dossier</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 font-mono">
            {college.documents?.length || 3} PDFs
          </span>
          {activeTab === "documents" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === "courses"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <span>Approved Programs &amp; Intake</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 font-mono">
            {college.courses?.length || 0}
          </span>
          {activeTab === "courses" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>
      </div>

      {/* Tab 1: Overview & Campus Photos */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Lightbox Photo Gallery Component */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-xs">
            <PhotoGallery photos={college.photos} collegeName={college.name} />
          </div>

          {/* Infrastructure Metrics & Compliance Statement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Campus Land & Built-up Space */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Land &amp; Physical Infrastructure (APH Chapter IV)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Campus Land Area
                  </span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {college.campusAreaAcres} Acres
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    Exceeds 7.5 acre urban norm
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Built-up Area
                  </span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {college.builtUpAreaSqm?.toLocaleString()} sq.m
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    Instructional &amp; admin space
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
                <p>
                  <strong>Survey / Title Deed:</strong> Registered under {college.legalEntityType}. 30-year unencumbered lease registered at District Sub-Registrar office.
                </p>
                <p>
                  <strong>Structural Safety &amp; Fire NOC:</strong> Compliant with National Building Code (NBC 2016 Part 4). Barrier-free access provided.
                </p>
              </div>
            </div>

            {/* Academic Capacity & Faculty Ratio */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Academic Faculty &amp; Student Intake Quotas</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Core Regular Faculty
                  </span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {college.facultyCount} Members
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    Cadre ratio 1:2:6 compliant
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Annual Intake
                  </span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
                    {college.intake} Students
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                    Across {college.courses?.length || 0} Programs
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
                <p>
                  <strong>Teacher-Student Ratio:</strong> 1:15 compliance maintained in accordance with AICTE Gazette Regulations (F.No. 61-1/RIFD/7th CPC/2016-17).
                </p>
                <p>
                  <strong>Accreditation:</strong> Tier-I Outcome-Based NBA Accreditation valid for core disciplines.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sample Regulatory Dossier Documents */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-200">
              <p className="font-bold">Automated Document Authentication Benchmark</p>
              <p className="mt-0.5 text-blue-700 dark:text-blue-300">
                Each PDF below was synthesized with letterhead, fictional seals, cryptographic QR codes, and simulated watermarks for testing verification algorithms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {college.documents?.map((doc: any) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {doc.pages} Page{doc.pages > 1 ? "s" : ""} A4
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {doc.refNumber}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Issue Date:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {doc.issueDate}
                      </span>
                    </div>
                    {doc.expiryDate && (
                      <div className="flex justify-between">
                        <span>Validity Thru:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {doc.expiryDate}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span className="font-mono">{doc.fileSize}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-3 rounded-lg text-center text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View PDF</span>
                    </a>

                    <a
                      href={doc.path}
                      download
                      className="p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Download PDF"
                      aria-label="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>

                  <Link
                    href={`/verify?collegeId=${college.id}&docId=${doc.id}`}
                    className="w-full py-2 px-3 rounded-lg text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Run AI Verification</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Approved Programs & Intake */}
      {activeTab === "courses" && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Approved Technical Programs &amp; Student Quotas
              </h3>
              <p className="text-xs text-slate-500">
                Extension of Approval (EoA) schedule for Academic Year 2025-26
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Total Approved Intake: {college.intake} Seats
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Program Level</th>
                  <th className="py-3 px-4">Discipline / Course Title</th>
                  <th className="py-3 px-4">Program Duration</th>
                  <th className="py-3 px-4">Approved Intake (2025-26)</th>
                  <th className="py-3 px-4">Affiliation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {college.courses?.map((course: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {course.degree}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {course.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {course.durationYears} Years Full-Time
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {course.intake} seats
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Affiliated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
