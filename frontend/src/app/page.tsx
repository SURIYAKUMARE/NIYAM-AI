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
  KeyRound,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

export default function HomePage() {
  const { user, login, verifyMfa, isLoading, getRoleRedirect } = useAuth();
  const router = useRouter();

  // Hero Sign-In States
  const [heroMode, setHeroMode] = useState<"signin" | "mfa">("signin");
  const [identifier, setIdentifier] = useState("applicant");
  const [password, setPassword] = useState("password123");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Hero MFA States
  const [mfaCode, setMfaCode] = useState(["", "", "", "", "", ""]);
  const [mfaSessionToken, setMfaSessionToken] = useState<string | undefined>(undefined);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectPersona = (username: string) => {
    setIdentifier(username);
    setPassword("password123");
    setErrorMsg("");
    setHeroMode("signin");
  };

  const handleHeroSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      const result = await login(identifier.trim(), password);
      if (result.mfaRequired) {
        setMfaSessionToken(result.sessionToken);
        setMfaCode(["", "", "", "", "", ""]);
        setHeroMode("mfa");
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

  const handleHeroMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const codeToVerify = mfaCode.join("");
    if (codeToVerify.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit TOTP code.");
      return;
    }

    setSubmitting(true);
    try {
      const verifiedUser = await verifyMfa(codeToVerify, mfaSessionToken);
      const dest = getRoleRedirect((verifiedUser as any)?.role);
      router.push(dest);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...mfaCode];
    updated[index] = val;
    setMfaCode(updated);

    if (val && index < 5) {
      document.getElementById(`hero-mfa-${index + 1}`)?.focus();
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !mfaCode[index] && index > 0) {
      document.getElementById(`hero-mfa-${index - 1}`)?.focus();
    }
  };

  const fillDemoCode = (code = "555555") => {
    setMfaCode(code.split(""));
    setErrorMsg("");
  };

  const copyMfaCode = (code = "555555") => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePasteMfa = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const digits = pastedData.split("");
      const updated = ["", "", "", "", "", ""];
      for (let i = 0; i < digits.length; i++) {
        updated[i] = digits[i];
      }
      setMfaCode(updated);
      const targetFocusIdx = Math.min(digits.length, 5);
      document.getElementById(`hero-mfa-${targetFocusIdx}`)?.focus();
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* =====================================================================
          HERO BANNER: AICTE HEADQUARTERS BACKGROUND WITH AUTHENTICATION DESK
      ===================================================================== */}
      <section
        className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center text-white px-4 sm:px-8 lg:px-12 py-10 lg:py-14 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(7, 24, 28, 0.84) 0%, rgba(12, 60, 60, 0.70) 50%, rgba(6, 28, 30, 0.90) 100%), url('/images/aicte-hq.png')`,
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
                  {heroMode === "signin" ? (
                    <>
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
                          {[
                            { id: "applicant", label: "Applicant" },
                            { id: "officer", label: "Scrutiny Officer" },
                            { id: "authority", label: "Authority" },
                            { id: "admin", label: "Admin" },
                          ].map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => selectPersona(p.id)}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                                identifier === p.id
                                  ? "bg-[#0F6B6B] text-white border-[#0F6B6B] shadow-xs"
                                  : "border-[#E3E8EE] bg-white text-[#5B6B7A] hover:bg-teal-50 hover:text-[#0F6B6B]"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
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
                            Username / AICTE ID
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
                          Fullscreen Login Page
                        </Link>
                        <Link href="/auth/register" className="hover:text-[#14202B] font-medium">
                          Register Institution
                        </Link>
                      </div>

                      {/* Demonstration Accounts & Login Codes (Official Evaluator Matrix) */}
                      <div className="pt-3 border-t border-[#E3E8EE] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#14202B] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#0F6B6B]" />
                            <span>Demonstration Accounts &amp; Login Codes</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            TOTP: 555555
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          {[
                            { role: "applicant", label: "Applicant", user: "applicant" },
                            { role: "officer", label: "Scrutiny Officer", user: "officer" },
                            { role: "authority", label: "Authority", user: "authority" },
                            { role: "admin", label: "Admin", user: "admin" },
                          ].map((acc) => (
                            <button
                              key={acc.role}
                              type="button"
                              onClick={() => selectPersona(acc.role)}
                              className={`p-1.5 text-left rounded-lg border transition ${
                                identifier === acc.role
                                  ? "bg-teal-50 border-[#0F6B6B] shadow-xs"
                                  : "bg-[#F7F9FB] border-[#E3E8EE] hover:bg-white hover:border-[#0F6B6B]"
                              }`}
                            >
                              <div className="font-bold text-[#14202B] truncate">{acc.label}</div>
                              <div className="text-[9px] text-[#5B6B7A] font-mono">
                                {acc.user} · 555555
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Hero Inline MFA View */
                    <div className="space-y-4">
                      <div className="text-center space-y-1">
                        <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F6B6B] flex items-center justify-center mx-auto shadow-xs">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <h2 className="text-base font-bold text-[#14202B]">
                          Two-Factor Authentication
                        </h2>
                        <p className="text-xs text-[#5B6B7A] max-w-xs mx-auto">
                          Enter 6-digit TOTP code for <span className="font-semibold text-[#14202B]">{identifier}</span>.
                        </p>
                      </div>

                      {/* High-Visibility Login Code & 1-Click Auto-Fill */}
                      <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[9px] uppercase font-bold tracking-wider text-[#0F6B6B]">
                              Evaluator Login Code
                            </div>
                            <div className="text-lg font-mono font-extrabold text-[#14202B] tracking-widest">
                              555555
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyMfaCode("555555")}
                            className="text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-teal-200 text-[#0F6B6B] hover:bg-teal-50 flex items-center gap-1 transition shadow-xs"
                            title="Click to copy code"
                          >
                            {copiedCode ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 text-[10px]">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#0F6B6B]" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => fillDemoCode("555555")}
                          className="w-full py-1.5 bg-[#0F6B6B] hover:bg-[#0a4f4f] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <span>⚡ Click to Auto-Fill Code (555555)</span>
                        </button>
                      </div>

                      {errorMsg && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      <form onSubmit={handleHeroMfaSubmit} className="space-y-3.5">
                        <div className="flex justify-center gap-2" onPaste={handlePasteMfa}>
                          {mfaCode.map((digit, idx) => (
                            <input
                              key={idx}
                              id={`hero-mfa-${idx}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleMfaDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleMfaKeyDown(idx, e)}
                              className="w-9 h-11 text-center text-lg font-bold font-mono border border-[#E3E8EE] rounded-xl bg-[#F7F9FB] focus:border-[#0F6B6B] focus:ring-2 focus:ring-[#0F6B6B] outline-none text-[#14202B]"
                            />
                          ))}
                        </div>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full py-2.5 bg-[#0F6B6B] hover:bg-[#0a4f4f] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          <span>{submitting ? "Verifying..." : "Verify & Access Workspace"}</span>
                        </button>

                        <div className="text-center pt-1 space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              setHeroMode("signin");
                              setMfaCode(["", "", "", "", "", ""]);
                              setErrorMsg("");
                            }}
                            className="text-xs text-[#5B6B7A] hover:text-[#14202B] font-semibold"
                          >
                            ← Back to Sign-In
                          </button>
                          <div className="text-[10px] text-[#5B6B7A] pt-1 border-t border-[#E3E8EE] flex items-center justify-between">
                            <span>Alternative: <strong className="font-mono text-[#14202B]">123456</strong></span>
                            <span>Recovery: <strong className="font-mono text-[#14202B]">REC-DEMO-2025</strong></span>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
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
