"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Info,
  Building2,
  ArrowUpDown,
  FileText,
} from "lucide-react";
import { CollegeCard, CollegeSummary } from "@/components/colleges/CollegeCard";
import { CollegeCardSkeleton } from "@/components/ui/Skeleton";
import rawInstitutions from "../../../data/seed/institutions.json";

export default function CollegesDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"trustScore" | "name" | "intake" | "year">("trustScore");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate smooth initial load for skeleton demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const colleges: CollegeSummary[] = rawInstitutions as unknown as CollegeSummary[];

  // Compute summary stats
  const stats = useMemo(() => {
    const total = colleges.length;
    const valid = colleges.filter((c) => c.status === "Valid").length;
    const tampered = colleges.filter((c) => c.status === "Tampered").length;
    const expired = colleges.filter((c) => c.status === "Expired").length;
    const missing = colleges.filter((c) => c.status === "Missing Fields").length;
    const totalIntake = colleges.reduce((sum, c) => sum + (c.intake || 0), 0);
    return { total, valid, tampered, expired, missing, totalIntake };
  }, [colleges]);

  // Extract unique states for dropdown
  const states = useMemo(() => {
    const unique = Array.from(new Set(colleges.map((c) => c.state))).sort();
    return unique;
  }, [colleges]);

  // Filtered and sorted colleges
  const filteredColleges = useMemo(() => {
    return colleges
      .filter((college) => {
        // Status filter
        if (selectedStatus !== "ALL" && college.status !== selectedStatus) {
          return false;
        }
        // State filter
        if (selectedState !== "ALL" && college.state !== selectedState) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = college.name.toLowerCase().includes(q);
          const matchId = college.permanentId.toLowerCase().includes(q);
          const matchCity = college.city.toLowerCase().includes(q);
          const matchState = college.state.toLowerCase().includes(q);
          return matchName || matchId || matchCity || matchState;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "trustScore") return b.trustScore - a.trustScore;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "intake") return b.intake - a.intake;
        if (sortBy === "year") return b.establishedYear - a.establishedYear;
        return 0;
      });
  }, [colleges, selectedStatus, selectedState, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Official Disclaimer & Benchmark Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3 transition-colors">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
          <p className="font-bold text-sm">
            AICTE Problem Statement 26261: Synthetic Institutions Benchmark Dataset
          </p>
          <p className="mt-0.5 text-blue-800 dark:text-blue-300">
            This benchmark repository contains {colleges.length} completely fictional engineering colleges, original SVG emblems, {colleges.length * 3} campus photos, and {colleges.length * 3} A4 PDF regulatory dossiers. Created exclusively for testing and evaluating automated verification pipelines without using real institutional names or government seals.
          </p>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Module 01 • Institutional Registry
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              12 Seeded Colleges • 36 Documents
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Technical Institutions Directory</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse institutional profiles, inspect infrastructure evidence galleries, and launch AICTE validation checks.
          </p>
        </div>

        <Link
          href="/verify"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs shrink-0 self-start md:self-auto"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Launch AI Verification Studio</span>
        </Link>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Colleges
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
            {stats.total}
          </span>
          <span className="text-[10px] text-slate-500">Benchmark Pool</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Compliant (Valid)
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
            {stats.valid}
          </span>
          <span className="text-[10px] text-emerald-600/80">100% APH Conformance</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
            Tampered Detections
          </span>
          <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
            {stats.tampered}
          </span>
          <span className="text-[10px] text-rose-600/80">Intake &amp; Seal Altered</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            Affiliation Expired
          </span>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
            {stats.expired}
          </span>
          <span className="text-[10px] text-amber-600/80">Pending University Board</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
            Missing Disclosures
          </span>
          <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
            {stats.missing}
          </span>
          <span className="text-[10px] text-purple-600/80">Incomplete Form B/NOC</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college name, code (e.g. NIT), city, or permanent ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
            />
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:border-blue-600"
            >
              <option value="ALL">All States ({states.length})</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:border-blue-600"
            >
              <option value="trustScore">Sort: Trust Score (High to Low)</option>
              <option value="name">Sort: College Name (A-Z)</option>
              <option value="intake">Sort: Approved Intake</option>
              <option value="year">Sort: Established Year</option>
            </select>
          </div>
        </div>

        {/* Status Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>

          {[
            { id: "ALL", label: `All (${colleges.length})` },
            { id: "Valid", label: `Valid (${stats.valid})` },
            { id: "Tampered", label: `Tampered (${stats.tampered})` },
            { id: "Expired", label: `Expired (${stats.expired})` },
            { id: "Missing Fields", label: `Missing Fields (${stats.missing})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedStatus === tab.id
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* College Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CollegeCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredColleges.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No institutions match your search criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, clearing status filters, or selecting "All States".
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedStatus("ALL");
              setSelectedState("ALL");
            }}
            className="px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-lg hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredColleges.map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </div>
      )}
    </div>
  );
}
