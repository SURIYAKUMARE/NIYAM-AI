"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ContextPanel } from "@/components/stitch/ContextPanel";
import { DataTable, Column } from "@/components/stitch/DataTable";
import {
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building2,
  ArrowRight,
} from "lucide-react";

export default function ApplicationsCatalogPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadApps = async () => {
    setLoading(true);
    try {
      let endpoint = "/applications";
      if (statusFilter) {
        endpoint += `?status=${encodeURIComponent(statusFilter)}`;
      }
      const data = await fetchApi(endpoint);
      setApplications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, [statusFilter]);

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
      header: "Institution & State",
      cell: (app) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">
            {app.institution?.name || `Institution #${app.institution_id}`}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            AICTE ID: {app.institution?.aicte_permanent_id || "N/A"} · {app.institution?.state || "India"}
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      cell: (app) => (
        <span className="capitalize text-slate-800 dark:text-slate-200">
          {app.category_code?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Processing Status",
      cell: (app) => <StatusBadge status={app.status} type="application" />,
    },
    {
      header: "Advisory Risk",
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
      <ContextPanel
        title="Regulatory Applications Workspace"
        subtitle={
          user?.role === "applicant"
            ? "Track and manage approval applications submitted for your authenticated institution."
            : "Review and inspect statutory applications submitted across institutional jurisdictions."
        }
        badge="Dossier Repository"
        actionText={user?.role === "applicant" ? "Create New Application" : undefined}
        actionHref={user?.role === "applicant" ? "/institution/applications/new" : undefined}
      >
        <button
          onClick={loadApps}
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          title="Refresh Applications"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </ContextPanel>

      <div className="space-y-3">
        <DataTable
          data={applications}
          columns={columns}
          searchPlaceholder="Search Application Number, Institution, or Category..."
          searchFilter={(item, q) =>
            item.application_number?.toLowerCase().includes(q) ||
            item.institution?.name?.toLowerCase().includes(q) ||
            item.category_code?.toLowerCase().includes(q)
          }
          filterComponent={
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Statuses ({applications.length})</option>
                <option value="PRELIMINARY_CHECK_PASSED">Preliminary Check Passed</option>
                <option value="DEFICIENCIES_DETECTED">Deficiencies Detected</option>
                <option value="SUBMITTED_FOR_SCRUTINY">Submitted for Scrutiny</option>
                <option value="UNDER_SCRUTINY">Under Scrutiny</option>
                <option value="CLARIFICATION_REQUESTED">Clarification Requested</option>
                <option value="RESUBMITTED">Resubmitted (Rectified)</option>
                <option value="RECOMMENDED_FOR_APPROVAL">Recommended for Approval</option>
                <option value="RECOMMENDED_FOR_INSPECTION">Recommended for Inspection</option>
              </select>
            </div>
          }
          emptyTitle="No applications found"
          emptyDescription="No applications matched your search or status filter criteria."
        />
      </div>
    </div>
  );
}
