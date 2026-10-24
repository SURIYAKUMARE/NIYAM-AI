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
} from "lucide-react";

export default function InstitutionDashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          className="font-bold text-[#14202B] hover:text-[#0F6B6B] flex items-center gap-1.5 transition-colors"
        >
          <span className="font-mono">{app.application_number}</span>
          <ExternalLink className="w-3 h-3 text-[#5B6B7A]" />
        </Link>
      ),
    },
    {
      header: "Approval Category",
      cell: (app) => (
        <span className="capitalize text-[#14202B]">
          {app.category_code?.replace(/_/g, " ") || "Extension of Approval"}
        </span>
      ),
    },
    {
      header: "Academic Session",
      cell: (app) => (
        <span className="font-mono text-[#5B6B7A]">
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
            <div className="w-16 bg-[#E3E8EE] rounded-full h-1.5 overflow-hidden">
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
            <span className="text-[11px] font-mono text-[#5B6B7A]">
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
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0F6B6B] bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
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
        title="Institutional Application Review"
        subtitle="Manage approval submissions, track AI advisory findings against APH norms, and monitor official scrutiny progress."
        badge="Institution Portal"
        actionText="Create Application & Open Checklist"
        actionHref="/institution/applications/new"
      >
        <button
          onClick={loadData}
          className="p-2 text-[#5B6B7A] hover:text-[#14202B] hover:bg-[#F7F9FB] rounded-lg border border-[#E3E8EE] transition-colors"
          title="Refresh Dossier Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </ContextPanel>

      {/* Early Deficiencies Alert Banner */}
      {openDeficiencies.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-rose-900">
                Action Required: {openDeficiencies.length} Critical Deficiencies Flagged
              </h3>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                Deterministic validation detected checklist deficiencies or expired statutory certificates.
                Rectify flagged documents prior to official scrutiny lock.
              </p>
            </div>
          </div>
          <Link
            href={applications.length > 0 ? `/applications/${applications[0].id}` : "#"}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0 transition shadow-xs self-start sm:self-center"
          >
            Review & Rectify
          </Link>
        </div>
      )}

      {/* Summary Band: Measured StockWatch Metrics */}
      <SummaryBand
        metrics={[
          {
            label: "Total Applications",
            value: applications.length,
            subtext: "Academic Session 2025-26",
            tone: "teal",
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
            tone: "teal",
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
            <h2 className="text-base font-bold text-[#14202B]">
              Institutional Filings & Applications
            </h2>
            <p className="text-xs text-[#5B6B7A]">
              Live records persisted in Supabase PostgreSQL with Row Level Security.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#5B6B7A] bg-white px-2 py-1 rounded-lg border border-[#E3E8EE]">
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
