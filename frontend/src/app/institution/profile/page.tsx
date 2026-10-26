"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import {
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldCheck,
  Download,
  ExternalLink,
  Award,
  Layers,
  Users,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import rawInstitutions from "../../../../data/seed/institutions.json";

export default function InstitutionProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const college = rawInstitutions[0]; // Default institution
  const activePhoto = college?.photos?.[activePhotoIdx] || college?.photos?.[0];

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const instData = await fetchApi("/institutions/inst-101");
        setProfile(instData);
      } catch {
        // Fallback synthetic profile for instant demo
        setProfile({
          id: "inst-101",
          permanent_id: "1-3512891911",
          legal_name: "Apex Institute of Technology & Management",
          society_name: "Apex Technical Education Society",
          type: "Private Self-Financed",
          establishment_year: 2008,
          state: "Maharashtra",
          district: "Pune",
          address: "Survey No. 42/1B, Hinjawadi Phase 2, Pune - 411057",
          campus_area_acres: 10.5,
          built_up_area_sqm: 18450,
          current_intake: 420,
          naac_grade: "A+ (Valid till Nov 2027)",
          nba_accredited_programs: 3,
        });
      }

      setHistory([
        {
          academic_year: "2024-25",
          approval_type: "Extension of Approval (EoA)",
          status: "approved",
          sanctioned_intake: 420,
          order_number: "AICTE/WRO/1-3512891911/2024/EOA",
          order_date: "2024-05-18",
          deficiencies_noted: "None (Full Compliance)",
        },
        {
          academic_year: "2023-24",
          approval_type: "Extension of Approval & Increase in Intake",
          status: "approved",
          sanctioned_intake: 420,
          order_number: "AICTE/WRO/1-3512891911/2023/EOA",
          order_date: "2023-06-02",
          deficiencies_noted: "Library digital subscription renewed during scrutiny",
        },
        {
          academic_year: "2022-23",
          approval_type: "Extension of Approval (EoA)",
          status: "approved",
          sanctioned_intake: 360,
          order_number: "AICTE/WRO/1-3512891911/2022/EOA",
          order_date: "2022-05-27",
          deficiencies_noted: "Faculty Cadre Ratio rectified post-inspection",
        },
        {
          academic_year: "2021-22",
          approval_type: "Extension of Approval (EoA)",
          status: "approved",
          sanctioned_intake: 360,
          order_number: "AICTE/WRO/1-3512891911/2021/EOA",
          order_date: "2021-07-14",
          deficiencies_noted: "None",
        },
      ]);
      setLoading(false);
    };

    loadProfileData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header with Official Emblem */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-niyam-border">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={college?.logo || "/seed/logos/nit-nilgiri.svg"}
              alt={`${college?.name || "College"} Emblem`}
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-niyam-secondary mb-1">
              <span>Institutional Records</span>
              <span>/</span>
              <span className="font-mono text-niyam-text font-bold">Permanent ID: {college?.permanentId || profile?.permanent_id || "SYN-2025-001"}</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Verified APH 2025-26
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-niyam-text tracking-tight flex items-center gap-2">
              <span>{college?.name || profile?.legal_name || "Nilgiri Institute of Technology"}</span>
            </h1>
            <p className="text-sm text-niyam-secondary mt-1">
              Registered Trust/Society: <strong className="text-niyam-text">{college?.legalEntityType || profile?.society_name || "Nilgiri Educational Trust (Fictional)"}</strong> | Established: {college?.establishedYear || 2004}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => alert("Downloading Institutional Regulatory Dossier PDF...")}
          >
            Export Historical Dossier
          </Button>
        </div>
      </div>

      {/* College Campus Photo Showcase */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Campus Infrastructure &amp; Statutory Evidence</span>
            </h3>
            <p className="text-xs text-slate-500">
              Photographic evidence verified against NBC 2016 physical norms and municipal building plans
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            3 Geotagged Photos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {college?.photos?.map((photo: any, idx: number) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-900 group shadow-xs hover:border-blue-500 transition-all flex flex-col justify-between"
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src={photo.path}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 backdrop-blur-sm text-white uppercase">
                    {photo.type}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/80 space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {photo.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {photo.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Institutional Vital Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-niyam-accentLight text-niyam-accent">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-niyam-secondary block">NAAC Accreditation</span>
              <span className="text-sm font-bold text-niyam-text">{profile?.naac_grade || "A+ Grade"}</span>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-emerald-50 text-semantic-success border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-niyam-secondary block">NBA Accredited Programs</span>
              <span className="text-sm font-bold text-niyam-text">{profile?.nba_accredited_programs || 3} Engineering Depts</span>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-sky-50 text-semantic-info border border-sky-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-niyam-secondary block">Campus Area (Acres)</span>
              <span className="text-sm font-bold text-niyam-text">{profile?.campus_area_acres || 10.5} Acres (Contiguous)</span>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-slate-100 text-slate-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-niyam-secondary block">Current Approved Intake</span>
              <span className="text-sm font-bold text-niyam-text">{profile?.current_intake || 420} Students/Year</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Campus & Regulatory Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Campus & Land Survey Records" subtitle="Survey verification provenance from State Revenue Registry">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:text-sm">
            <div>
              <dt className="text-niyam-secondary">State & District</dt>
              <dd className="font-semibold text-niyam-text mt-0.5">{profile?.state || "Maharashtra"}, {profile?.district || "Pune"}</dd>
            </div>
            <div>
              <dt className="text-niyam-secondary">Institution Type</dt>
              <dd className="font-semibold text-niyam-text mt-0.5">{profile?.type || "Private Self-Financed"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-niyam-secondary">Registered Campus Address</dt>
              <dd className="font-semibold text-niyam-text mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-niyam-accent flex-shrink-0" />
                <span>{profile?.address || "Survey No. 42/1B, Hinjawadi Phase 2, Pune - 411057"}</span>
              </dd>
            </div>
            <div>
              <dt className="text-niyam-secondary">Total Built-Up Area</dt>
              <dd className="font-semibold text-niyam-text mt-0.5">{profile?.built_up_area_sqm?.toLocaleString() || "18,450"} sq.m</dd>
            </div>
            <div>
              <dt className="text-niyam-secondary">Land Ownership Type</dt>
              <dd className="font-semibold text-niyam-text mt-0.5">Ownership (Clear Title 99-Yr)</dd>
            </div>
          </dl>
        </Card>

        <Card title="Statutory Leadership & Signatories" subtitle="Authorized head of institution and society trustees">
          <div className="space-y-3">
            <div className="p-3 rounded bg-slate-50 border border-niyam-border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-niyam-text block">Dr. Arvind Deshmukh, Ph.D.</span>
                <span className="text-xs text-niyam-secondary">Principal & Head of Institution (Appointed 2018)</span>
                <span className="text-[11px] text-niyam-secondary block font-mono">principal@apextmt.edu.in | +91 98230 11223</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                Verified Signatory
              </span>
            </div>

            <div className="p-3 rounded bg-slate-50 border border-niyam-border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-niyam-text block">Shri Suresh K. Sharma</span>
                <span className="text-xs text-niyam-secondary">President, Apex Technical Education Society</span>
                <span className="text-[11px] text-niyam-secondary block font-mono">trustee@apexeducation.org</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                Trustee
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Historical Approvals Table */}
      <Card
        title="Historical Regulatory Approval Records"
        subtitle="Chronological repository of past Extension of Approval (EoA) decisions and official letters"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-niyam-border bg-slate-50 text-niyam-secondary">
                <th className="py-2.5 px-3 font-semibold">Academic Year</th>
                <th className="py-2.5 px-3 font-semibold">Approval Type</th>
                <th className="py-2.5 px-3 font-semibold">Sanctioned Intake</th>
                <th className="py-2.5 px-3 font-semibold">Statutory Order No. & Date</th>
                <th className="py-2.5 px-3 font-semibold">Deficiencies Noted</th>
                <th className="py-2.5 px-3 font-semibold text-right">Official Letter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-niyam-border">
              {history.map((rec) => (
                <tr key={rec.academic_year} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-bold text-niyam-text">{rec.academic_year}</td>
                  <td className="py-3 px-3 text-niyam-text">{rec.approval_type}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-niyam-text">{rec.sanctioned_intake} seats</td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-xs block text-slate-700">{rec.order_number}</span>
                    <span className="text-[11px] text-niyam-secondary">{rec.order_date}</span>
                  </td>
                  <td className="py-3 px-3 text-xs text-niyam-secondary">{rec.deficiencies_noted}</td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<FileText className="w-3.5 h-3.5" />}
                      onClick={() => alert(`Downloading official approval order for ${rec.academic_year}...`)}
                    >
                      View EoA
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
