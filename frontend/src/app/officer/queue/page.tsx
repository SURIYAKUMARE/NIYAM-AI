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
  Inbox,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  Building,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  Layers,
  ArrowRight,
  Clock,
} from "lucide-react";

export default function OfficerReviewQueuePage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("");

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await fetchApi("/applications");
      setApplications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const filteredApps = filterCategory
    ? applications.filter((a) => a.category_code === filterCategory)
    : applications;

  // Officer metrics
  const pendingScrutinyCount = applications.filter(
    (a) => a.status === "SUBMITTED_FOR_SCRUTINY" || a.status === "UNDER_SCRUTINY"
  ).length;
  const criticalDeficiencyCount = applications.filter(
    (a) => (a.overall_risk_score || 0) > 40 || a.status === "DEFICIENCIES_DETECTED"
  ).length;
  const completedCount = applications.filter(
    (a) =>
      a.status === "RECOMMENDED_FOR_APPROVAL" ||
      a.status === "APPROVED_BY_AUTHORITY" ||
      a.status === "REJECTED_BY_AUTHORITY"
  ).length;

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
      header: "Institution & AICTE ID",
      cell: (app) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">
            {app.institution?.name || "Apex Institute of Technology"}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            AICTE ID: {app.institution?.aicte_permanent_id || "1-492048123"} · {app.institution?.state || "Maharashtra"}
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      cell: (app) => (
        <span className="capitalize text-slate-800 dark:text-slate-200">
          {app.category_code?.replace(/_/g, " ") || "Extension of Approval"}
        </span>
      ),
    },
    {
      header: "Processing Status",
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
            <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
              {score.toFixed(0)}%
            </span>
          </div>
        );
      },
    },
    {
      header: "Scrutiny Action",
      className: "text-right",
      cell: (app) => (
        <Link
          href={`/applications/${app.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          <span>Inspect &amp; Scrutinize</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Reference Context Panel */}
      <ContextPanel
        title="Technical Scrutiny Division — Review Desk"
        subtitle={`Welcome, ${user?.full_name || "Scrutiny Officer"} (${user?.role || "scrutiny_officer"}) — Examine institutional evidence dossiers, evaluate extracted bounding boxes, and confirm compliance observations.`}
        badge="Scrutiny Officer"
      >
        <Link
          href="/review"
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
        >
          Review Workspace
        </Link>
        <Link
          href="/findings"
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
        >
          Findings &amp; Dispositions
        </Link>
        <button
          onClick={loadQueue}
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </ContextPanel>

      {/* Summary Band */}
      <SummaryBand
        metrics={[
          {
            label: "Total Assigned Cases",
            value: applications.length,
            subtext: "Assigned across Western Region",
            tone: "blue",
            icon: Layers,
          },
          {
            label: "Awaiting Scrutiny",
            value: pendingScrutinyCount,
            subtext: "Dossiers locked for verification",
            tone: "amber",
            icon: Clock,
          },
          {
            label: "Cases Requiring Review",
            value: criticalDeficiencyCount,
            subtext: "Discrepancies or expired NOCs",
            tone: "rose",
            icon: AlertTriangle,
          },
          {
            label: "Orders Disposed",
            value: completedCount,
            subtext: "Recommended or determined",
            tone: "emerald",
            icon: ShieldCheck,
          },
        ]}
      />

      {/* Queue Data Table with Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Active Institutional Review Queue
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic rule evaluation populated from APH 2025-26 compliance engine.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            Active Rule Set: v2025.1
          </span>
        </div>

        <DataTable
          data={filteredApps}
          columns={columns}
          searchPlaceholder="Search Application Number, Institution or AICTE ID..."
          searchFilter={(item, q) =>
            item.application_number?.toLowerCase().includes(q) ||
            item.institution?.name?.toLowerCase().includes(q) ||
            item.institution?.aicte_permanent_id?.toLowerCase().includes(q)
          }
          filterComponent={
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Approval Categories</option>
                <option value="EXTENSION_OF_APPROVAL">Extension of Approval (EoA)</option>
                <option value="INCREASE_IN_INTAKE">Increase in Intake</option>
                <option value="NEW_INSTITUTION">New Institution</option>
                <option value="CHANGE_OF_SITE">Change of Site</option>
              </select>
            </div>
          }
          emptyTitle="Queue is clear"
          emptyDescription="There are no applications currently pending scrutiny under this category filter."
        />
      </div>
    </div>
  );
}
