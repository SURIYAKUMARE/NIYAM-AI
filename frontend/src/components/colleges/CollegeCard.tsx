"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Users,
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export interface CollegeSummary {
  id: string;
  permanentId: string;
  name: string;
  shortName: string;
  city: string;
  district?: string;
  state: string;
  establishedYear: number;
  status: "Valid" | "Expired" | "Tampered" | "Missing Fields";
  statusReason: string;
  trustScore: number;
  intake: number;
  facultyCount: number;
  courses: Array<{ id: string; degree: string; name: string; intake: number }>;
  logo: string;
  photos: Array<{ type: string; title: string; path: string; alt: string }>;
  documents: Array<any>;
}

interface CollegeCardProps {
  college: CollegeSummary;
}

export function CollegeCard({ college }: CollegeCardProps) {
  const getStatusBadge = (status: CollegeSummary["status"]) => {
    switch (status) {
      case "Valid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Valid APH 2025
          </span>
        );
      case "Tampered":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Tampered Detected
          </span>
        );
      case "Expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Affiliation Expired
          </span>
        );
      case "Missing Fields":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Missing Disclosure
          </span>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800";
    if (score >= 70) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800";
    return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800";
  };

  return (
    <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Banner & Header */}
      <div>
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            {/* Logo and Institution Title */}
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-13 h-13 rounded-xl p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={college.logo}
                  alt={`${college.name} Original Emblem`}
                  className="w-11 h-11 object-contain transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="min-w-0">
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block">
                  {college.permanentId}
                </span>
                <Link
                  href={`/colleges/${college.id}`}
                  className="font-bold text-slate-900 dark:text-white text-base leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 block"
                >
                  {college.name}
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">
                    {college.city}, {college.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Score Badge */}
            <div
              className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl border font-bold text-center shrink-0 ${getScoreColor(
                college.trustScore
              )}`}
            >
              <span className="text-base leading-none font-extrabold font-mono">
                {college.trustScore}
              </span>
              <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">
                Trust Score
              </span>
            </div>
          </div>

          {/* Status Chip & Reason Note */}
          <div className="mt-3.5 flex items-center justify-between gap-2">
            <div>{getStatusBadge(college.status)}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Est. {college.establishedYear}</span>
            </div>
          </div>

          <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {college.statusReason}
          </p>
        </div>

        {/* Metric Strip */}
        <div className="grid grid-cols-3 gap-2 px-5 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-y border-slate-100 dark:border-slate-800/80 text-center">
          <div className="p-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">
              Approved Intake
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
              {college.intake} seats
            </span>
          </div>
          <div className="p-1 border-x border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">
              Core Faculty
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
              {college.facultyCount} members
            </span>
          </div>
          <div className="p-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">
              Programs
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
              {college.courses?.length || 0} courses
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-white dark:bg-[#0F172A] flex items-center justify-between gap-2">
        <Link
          href={`/colleges/${college.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <span>Examine Dossier</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          href={`/verify?collegeId=${college.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Quick Verify</span>
        </Link>
      </div>
    </div>
  );
}
