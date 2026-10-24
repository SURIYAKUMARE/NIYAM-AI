"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  Sliders,
  History,
  BarChart3,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Landmark,
  Lock,
  Mail,
  LogIn,
  CheckCircle2,
  Flame,
  Users2,
  Receipt,
  SearchCode,
  BadgeCheck,
} from "lucide-react";

export default function HomePage() {
  const { user, login, isLoading, getRoleRedirect } = useAuth();
  const router = useRouter();

  // Hero Sign-In States
  const [identifier, setIdentifier] = useState("applicant");
  const [password, setPassword] = useState("password123");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectPersona = (username: string) => {
    setIdentifier(username);
    setPassword("password123");
    setErrorMsg("");
  };

  const handleHeroSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      const result = await login(identifier.trim(), password);
      if (result.mfaRequired) {
        router.push("/login");
      } else {
        const dest = getRoleRedirect(result.user?.role);
        router.push(dest);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please verify your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* =====================================================================
          HERO BANNER: AICTE HEADQUARTERS BACKGROUND WITH AUTHENTICATION DESK
      ===================================================================== */}
      <section
        className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center text-white px-4 sm:px-8 lg:px-12 py-12 lg:py-16 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(7, 30, 34, 0.88) 0%, rgba(15, 107, 107, 0.80) 50%, rgba(10, 79, 79, 0.92) 100%), url('/images/aicte-hq.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
          
          {/* Left Column: Official Mandate & Title */}
          <div className="lg:w-[55%] space-y-5">
            {/* National Emblem & AICTE Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-300 animate-pulse" />
              <span>अखिल भारतीय तकनीकी शिक्षा परिषद् · ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-teal-400/20 text-teal-200 border border-teal-300/30 uppercase tracking-wider">
                  AICTE Problem Statement ID: 26261
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-white/15 text-white border border-white/20">
                  Session 2025-26 (v2025.1)
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Niyam (NIYAM)
                <span className="block text-xl sm:text-2xl lg:text-3xl font-bold text-teal-200 mt-1 font-sans">
                  Institutional Application Review &amp; Compliance Verification
                </span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed max-w-2xl font-normal">
              An institutional regulatory platform where technical institutions submit approval applications and supporting evidence.
              Validates documents against APH 2025-26 clauses, verifies records through authorized registries (DigiLocker, Bharatkosh), and presents evidence-linked findings for official scrutiny.
            </p>

            {/* Core Principle Callout */}
            <div className="p-3.5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/15 text-xs text-teal-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-white font-bold block mb-0.5">Statutory Decision Support:</strong>
                AI advisory validation assists preliminary compliance checks. Final approval, deficiency, and inspection decisions remain strictly with competent AICTE statutory authorities.
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                <div className="text-[10px] font-bold uppercase text-teal-200">Standard</div>
                <div className="text-base font-extrabold text-white font-mono mt-0.5">APH 2025-26</div>
              </div>
              <div className="p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                <div className="text-[10px] font-bold uppercase text-teal-200">Provenance</div>
                <div className="text-base font-extrabold text-white font-mono mt-0.5">SHA-256 Ledger</div>
              </div>
              <div className="p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                <div className="text-[10px] font-bold uppercase text-teal-200">Security</div>
                <div className="text-base font-extrabold text-white font-mono mt-0.5">TOTP MFA + RLS</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Authentication Desk Card */}
          <div className="lg:w-[42%] w-full">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/40 shadow-2xl p-6 sm:p-8 text-[#14202B]">
              {user ? (
                /* Authenticated User Resume Card */
                <div className="space-y-5 text-center py-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0F6B6B] text-white flex items-center justify-center mx-auto shadow-md font-bold text-xl">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F6B6B] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      Active Authenticated Session
                    </span>
                    <h3 className="text-lg font-bold text-[#14202B] mt-2">
                      Welcome, {user.username}
                    </h3>
                    <p className="text-xs text-[#5B6B7A] capitalize mt-0.5">
                      Role: {user.role.replace(/_/g, " ")} · Western Regional Bureau
                    </p>
                  </div>

                  <Link
                    href={getRoleRedirect(user.role)}
                    className="w-full py-3 bg-[#0F6B6B] hover:bg-[#0a4f4f] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>Enter Your Active Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                /* Visitor Hero Sign-In Card */
                <div className="space-y-5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-[#14202B]">Sign in to Portal</h2>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-[#0F6B6B] border border-teal-200">
                        Institutional Access
                      </span>
                    </div>
                    <p className="text-xs text-[#5B6B7A]">
                      Select an authorized persona or enter your institutional credentials.
                    </p>
                  </div>

                  {/* 1-Click Persona Selectors */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-[#5B6B7A] uppercase tracking-wider">
                      Quick Persona Selector:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => selectPersona("applicant")}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                          identifier === "applicant"
                            ? "bg-[#0F6B6B] text-white border-[#0F6B6B]"
                            : "border-[#E3E8EE] bg-white text-[#5B6B7A] hover:bg-teal-50 hover:text-[#0F6B6B]"
                        }`}
                      >
                        Applicant
                      </button>
                      <button
                        type="button"
                        onClick={() => selectPersona("officer")}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                          identifier === "officer"
                            ? "bg-[#0F6B6B] text-white border-[#0F6B6B]"
                            : "border-[#E3E8EE] bg-white text-[#5B6B7A] hover:bg-teal-50 hover:text-[#0F6B6B]"
                        }`}
                      >
                        Scrutiny Officer
                      </button>
                      <button
                        type="button"
                        onClick={() => selectPersona("authority")}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                          identifier === "authority"
                            ? "bg-[#0F6B6B] text-white border-[#0F6B6B]"
                            : "border-[#E3E8EE] bg-white text-[#5B6B7A] hover:bg-teal-50 hover:text-[#0F6B6B]"
                        }`}
                      >
                        Authority
                      </button>
                      <button
                        type="button"
                        onClick={() => selectPersona("admin")}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                          identifier === "admin"
                            ? "bg-[#0F6B6B] text-white border-[#0F6B6B]"
                            : "border-[#E3E8EE] bg-white text-[#5B6B7A] hover:bg-teal-50 hover:text-[#0F6B6B]"
                        }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleHeroSignIn} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-[#14202B] block mb-1">
                        Username / Permanent ID
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
                        <input
                          type="text"
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="applicant"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E3E8EE] bg-[#F7F9FB] text-[#14202B] focus:ring-2 focus:ring-[#0F6B6B] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#14202B] block mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E3E8EE] bg-[#F7F9FB] text-[#14202B] focus:ring-2 focus:ring-[#0F6B6B] outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 bg-[#0F6B6B] hover:bg-[#0a4f4f] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{submitting ? "Signing in..." : "Sign in to Workspace"}</span>
                    </button>
                  </form>

                  <div className="pt-2 border-t border-[#E3E8EE] flex items-center justify-between text-[11px] text-[#5B6B7A]">
                    <Link href="/login" className="text-[#0F6B6B] font-bold hover:underline">
                      Fullscreen Login &amp; MFA
                    </Link>
                    <Link href="/auth/register" className="hover:text-[#14202B] font-medium">
                      Register Institution
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================================
          5-PILLAR APH COMPLIANCE VERIFICATION STANDARDS
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#E3E8EE]">
          <div>
            <h2 className="text-lg font-bold text-[#14202B] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0F6B6B]" />
              <span>5-Pillar Statutory Compliance Standards (APH 2025-26)</span>
            </h2>
            <p className="text-xs text-[#5B6B7A] mt-0.5">
              Deterministic rule evaluation, spatial OCR bounding boxes, and issuing authority verification
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-teal-50 text-[#0F6B6B] border border-teal-200">
            Clause Set 2025-26
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[
            {
              title: "Land & Title Deeds",
              clause: "APH Clause 4.1",
              desc: "Contiguous educational land (min 2.5/5.0 acres) & 30-year registered lease.",
              icon: Landmark,
            },
            {
              title: "Built-up Area Norms",
              clause: "APH Clause 5.3",
              desc: "Classroom, laboratories, computer center, and library carpet area checks.",
              icon: Building2,
            },
            {
              title: "Faculty Cadre & Ratio",
              clause: "APH Clause 6.2",
              desc: "1:15 student-faculty cadre ratio & AICTE qualified Principal verification.",
              icon: Users2,
            },
            {
              title: "Statutory Clearances",
              clause: "APH Clause 4.8",
              desc: "Competent Authority Fire Safety NOC & Structural Stability Certificate.",
              icon: Flame,
            },
            {
              title: "TER Fee Settlement",
              clause: "APH Clause 1.7",
              desc: "Electronic treasury fee reconciliation verified via Bharatkosh gateway.",
              icon: Receipt,
            },
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-[#E3E8EE] shadow-xs hover:border-[#0F6B6B]/40 transition space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-mono font-bold text-[#0F6B6B] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {pillar.clause}
                    </span>
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-teal-50 text-[#0F6B6B] border border-teal-200 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-[#14202B] leading-tight">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#5B6B7A] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          ROLE WORKSPACE HUBS
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#14202B]">
            Regulatory Role Portals &amp; Workspaces
          </h2>
          <p className="text-xs text-[#5B6B7A] mt-0.5">
            Role-based access control with Zero-Trust multi-tenant isolation and append-only audit trail
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/institution/dashboard"
            className="bg-white p-6 rounded-2xl border border-[#E3E8EE] hover:border-[#0F6B6B] hover:shadow-md transition group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F6B6B] border border-teal-200 flex items-center justify-center font-bold group-hover:bg-[#0F6B6B] group-hover:text-white transition">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#14202B] group-hover:text-[#0F6B6B] transition">
                  Institutional Applicant Workspace
                </h3>
                <p className="text-xs text-[#5B6B7A] mt-1 leading-relaxed">
                  Submit approval applications, upload PDF documents, run advisory validation, review deficiencies, and respond to official clarification queries.
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-[#0F6B6B] pt-2 border-t border-[#E3E8EE]/60">
              <span>Enter Applicant Portal</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/officer/queue"
            className="bg-white p-6 rounded-2xl border border-[#E3E8EE] hover:border-[#0F6B6B] hover:shadow-md transition group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F6B6B] border border-teal-200 flex items-center justify-center font-bold group-hover:bg-[#0F6B6B] group-hover:text-white transition">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#14202B] group-hover:text-[#0F6B6B] transition">
                  Regulatory Scrutiny Officer Queue
                </h3>
                <p className="text-xs text-[#5B6B7A] mt-1 leading-relaxed">
                  Review submitted dossiers, inspect dual-pane bounding-box OCR extractions, record manual source confirmations, and schedule Expert Visits.
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-[#0F6B6B] pt-2 border-t border-[#E3E8EE]/60">
              <span>Open Scrutiny Queue</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/audit"
            className="bg-white p-6 rounded-2xl border border-[#E3E8EE] hover:border-[#0F6B6B] hover:shadow-md transition group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F6B6B] border border-teal-200 flex items-center justify-center font-bold group-hover:bg-[#0F6B6B] group-hover:text-white transition">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#14202B] group-hover:text-[#0F6B6B] transition">
                  Tamper-Evident SHA-256 Ledger
                </h3>
                <p className="text-xs text-[#5B6B7A] mt-1 leading-relaxed">
                  Cryptographically chained immutable audit log of all document uploads, validation runs, human corrections, and statutory determination orders.
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-[#0F6B6B] pt-2 border-t border-[#E3E8EE]/60">
              <span>Inspect Audit Ledger</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
