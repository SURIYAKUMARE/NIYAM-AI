"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Building2,
  FileCheck2,
  Scale,
  RefreshCw,
  ExternalLink,
  LogIn,
  Landmark,
  BadgeCheck,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const { login, verifyMfa, getRoleRedirect } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const errorParam = searchParams.get("error");
  const defaultUserParam = searchParams.get("user");

  const supabase = createClient();

  // Mode: "signin" | "mfa" | "recovery"
  const [mode, setMode] = useState<"signin" | "mfa" | "recovery">("signin");

  // Sign-in form states
  const [identifier, setIdentifier] = useState(defaultUserParam || "applicant");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(errorParam || "");

  // MFA challenge states
  const [mfaCode, setMfaCode] = useState(["", "", "", "", "", ""]);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [mfaSessionToken, setMfaSessionToken] = useState<string | undefined>(undefined);
  const [mfaTimer, setMfaTimer] = useState(30);
  const [copiedCode, setCopiedCode] = useState(false);

  // Password recovery states
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Countdown timer for TOTP window (smoothly resets when reaching 0)
  useEffect(() => {
    let interval: any;
    if (mode === "mfa") {
      interval = setInterval(() => {
        setMfaTimer((t) => (t > 1 ? t - 1 : 30));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode]);

  // Handle Primary Sign-in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const result = await login(identifier.trim(), password);
      if (result.mfaRequired) {
        setMfaSessionToken(result.sessionToken);
        setMfaCode(["", "", "", "", "", ""]);
        setMode("mfa");
        setMfaTimer(30);
      } else {
        const dest = redirectedFrom || getRoleRedirect(result.user?.role);
        router.push(dest);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please verify your identity and password.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle MFA 6-digit TOTP input with auto-advance and backspace support
  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...mfaCode];
    updated[index] = val;
    setMfaCode(updated);

    if (val && index < 5) {
      const nextInput = document.getElementById(`mfa-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !mfaCode[index] && index > 0) {
      const prevInput = document.getElementById(`mfa-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Paste support: filling all 6 digits when copied
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
      document.getElementById(`mfa-input-${targetFocusIdx}`)?.focus();
    }
  };

  // Auto-fill evaluator demo code
  const fillDemoMfaCode = (code = "555555") => {
    setMfaCode(code.split(""));
    setErrorMsg("");
  };

  const copyMfaCode = (code = "555555") => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const codeToVerify = useRecoveryCode ? recoveryCode.trim() : mfaCode.join("");
    if (!useRecoveryCode && codeToVerify.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit TOTP authenticator code.");
      return;
    }
    if (useRecoveryCode && !codeToVerify) {
      setErrorMsg("Please provide your single-use emergency recovery code.");
      return;
    }

    setSubmitting(true);
    try {
      const verifiedUser = await verifyMfa(codeToVerify, mfaSessionToken);
      const dest = redirectedFrom || getRoleRedirect((verifiedUser as any)?.role);
      router.push(dest);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid MFA verification code or expired challenge.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Password Recovery Request
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setRecoveryLoading(true);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
      });

      if (error) {
        throw error;
      }
      setRecoverySent(true);
    } catch (err: any) {
      setRecoverySent(true);
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Quick Evaluator Persona Selector
  const selectPersona = (username: string) => {
    setIdentifier(username);
    setPassword("password123");
    setErrorMsg("");
    setMode("signin");
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 text-[#14202B] font-sans antialiased overflow-y-auto"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(7, 24, 28, 0.84) 0%, rgba(12, 60, 60, 0.70) 50%, rgba(6, 28, 30, 0.90) 100%), url('/images/aicte-hq.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Outer Container with Responsive Max Width */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10 py-6">
        
        {/* LEFT PANEL: Official AICTE Identity & Bureau Mandate */}
        <div className="lg:w-[48%] w-full text-white flex flex-col justify-between p-6 sm:p-8 lg:p-10 rounded-3xl bg-black/40 backdrop-blur-md border border-white/20 shadow-2xl space-y-6">
          <div>
            {/* National Header Banner */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-white/15">
              <div className="w-12 h-12 rounded-2xl bg-white/95 p-1 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-xl bg-[#0F6B6B] flex flex-col items-center justify-center text-white font-extrabold text-xs">
                  <span>AICTE</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-teal-200 tracking-wider uppercase">
                  अखिल भारतीय तकनीकी शिक्षा परिषद्
                </div>
                <div className="text-sm font-extrabold tracking-tight text-white">
                  ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
                </div>
                <div className="text-[10px] text-teal-100/90 font-medium">
                  Statutory Bureau of Regulation · New Delhi Headquarters
                </div>
              </div>
            </div>

            {/* Portal Headline */}
            <div className="mt-6 space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-200 text-[11px] font-bold backdrop-blur-xs border border-teal-300/30">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>AICTE Problem Statement 26261 · Approval Portal</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white">
                NIYAM
                <span className="block text-base sm:text-lg font-semibold text-teal-200 mt-1">
                  Institutional Validation &amp; Regulatory Scrutiny
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
                Deterministic compliance engine comparing institutional applications against APH 2025-26 norms.
                Direct verification via DigiLocker and Bharatkosh, dual-pane OCR bounding boxes, and SHA-256 audit ledger.
              </p>

              {/* 5-Pillar APH Verification Norms */}
              <div className="pt-3 space-y-2">
                <div className="text-[10px] font-bold text-teal-200 uppercase tracking-wider">
                  Verified Approval Norms (APH 2025-26):
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white">
                  <li className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    <span>Land &amp; Title Verification</span>
                  </li>
                  <li className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    <span>Built-up Area Norms</span>
                  </li>
                  <li className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    <span>1:15 Faculty Cadre Ratio</span>
                  </li>
                  <li className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    <span>Fire NOC &amp; Safety Proof</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Statutory Footer Citation */}
          <div className="pt-4 border-t border-white/15 text-[11px] text-teal-200/90 flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">Nelson Mandela Marg, Vasant Kunj, New Delhi</span>
            <span className="font-mono text-teal-300 font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">
              Session 2025-26
            </span>
          </div>
        </div>

        {/* RIGHT PANEL: Focused Authentication Desk Card */}
        <div className="lg:w-[48%] w-full flex items-center justify-center">
          <div className="w-full bg-white rounded-3xl border border-white/60 shadow-2xl p-6 sm:p-8 space-y-5">
            {mode === "signin" && (
              <>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#14202B]">Portal Sign-In</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-[#0F6B6B] border border-teal-200">
                      Authorized Access
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6B7A]">
                    Select an evaluator persona or enter authorized credentials.
                  </p>
                </div>

                {/* Quick Role Selector (Verified Accounts) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#5B6B7A] uppercase tracking-wider">
                      Quick Persona Selector:
                    </span>
                    <span className="text-[10px] font-semibold text-[#0F6B6B]">
                      Pre-filled password: password123
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "applicant", label: "Applicant" },
                      { id: "officer", label: "Scrutiny Officer" },
                      { id: "authority", label: "Supervising Authority" },
                      { id: "admin", label: "System Admin" },
                      { id: "auditor", label: "Statutory Auditor" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectPersona(p.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          identifier === p.id
                            ? "bg-[#0F6B6B] text-white border-[#0F6B6B] shadow-xs"
                            : "border-[#E3E8EE] bg-white text-[#5B6B7A] hover:border-[#0F6B6B] hover:text-[#0F6B6B] hover:bg-teal-50/50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-3.5">
                  {/* Identifier */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14202B]" htmlFor="login-email">
                      Username / AICTE ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
                      <input
                        id="login-email"
                        type="text"
                        required
                        autoComplete="username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. applicant or officer"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-[#F7F9FB] text-[#14202B] focus:outline-none focus:ring-2 focus:ring-[#0F6B6B] border-[#E3E8EE]"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#14202B]" htmlFor="login-pw">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("recovery");
                          setErrorMsg("");
                        }}
                        className="text-[11px] text-[#0F6B6B] hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
                      <input
                        id="login-pw"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border bg-[#F7F9FB] text-[#14202B] focus:outline-none focus:ring-2 focus:ring-[#0F6B6B] border-[#E3E8EE]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6B7A] hover:text-[#14202B]"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between text-xs text-[#5B6B7A]">
                    <label className="flex items-center gap-2 text-xs text-[#14202B] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#E3E8EE] accent-[#0F6B6B]"
                      />
                      <span>Remember session</span>
                    </label>
                    <span className="text-[10px] text-[#5B6B7A]">Demo password: password123</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-[#0F6B6B] hover:bg-[#0a4f4f] text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{submitting ? "Signing in..." : "Sign in to Workspace"}</span>
                  </button>
                </form>

                {/* Registration link */}
                <p className="text-xs text-center text-[#5B6B7A]">
                  New institutional applicant?{" "}
                  <Link href="/auth/register" className="font-bold text-[#0F6B6B] hover:underline">
                    Register institutional account
                  </Link>
                </p>

                {/* Demonstration Accounts & Login Codes (Official Evaluator Matrix) */}
                <div className="pt-3.5 border-t border-[#E3E8EE] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#14202B] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0F6B6B]" />
                      <span>Demonstration Accounts &amp; Login Codes</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      TOTP Code: 555555
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {[
                      { role: "applicant", label: "Applicant", user: "applicant", pw: "password123", totp: "555555" },
                      { role: "officer", label: "Scrutiny Officer", user: "officer", pw: "password123", totp: "555555" },
                      { role: "authority", label: "Supervising Authority", user: "authority", pw: "password123", totp: "555555" },
                      { role: "admin", label: "System Admin", user: "admin", pw: "password123", totp: "555555" },
                    ].map((acc) => (
                      <div
                        key={acc.role}
                        onClick={() => selectPersona(acc.role)}
                        className={`p-2 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          identifier === acc.role
                            ? "bg-teal-50 border-[#0F6B6B] shadow-xs"
                            : "bg-[#F7F9FB] border-[#E3E8EE] hover:bg-white hover:border-[#0F6B6B]"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-[#14202B]">{acc.label}</div>
                          <div className="text-[10px] text-[#5B6B7A] font-mono">
                            {acc.user} · {acc.pw}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-white text-[#0F6B6B] px-1.5 py-0.5 rounded border border-[#E3E8EE]">
                          {acc.totp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* MFA VIEW WITH 1-CLICK DEMO AUTO-FILL & PASTE */}
            {mode === "mfa" && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F6B6B] flex items-center justify-center mx-auto shadow-xs">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-[#14202B]">
                    Multi-Factor Authentication
                  </h2>
                  <p className="text-xs text-[#5B6B7A] max-w-xs mx-auto leading-relaxed">
                    Official regulatory access is protected by RFC 6238 Time-based One-Time Password (TOTP).
                  </p>
                </div>

                {/* High-Visibility Login Code & 1-Click Auto-Fill */}
                <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#0F6B6B]">
                        Evaluator Login Code
                      </div>
                      <div className="text-xl font-mono font-extrabold text-[#14202B] tracking-widest mt-0.5">
                        555555
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyMfaCode("555555")}
                      className="text-xs font-bold bg-white px-3 py-1.5 rounded-xl border border-teal-200 text-[#0F6B6B] hover:bg-teal-50 flex items-center gap-1.5 transition shadow-xs"
                      title="Click to copy login code"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#0F6B6B]" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => fillDemoMfaCode("555555")}
                    className="w-full py-2 bg-[#0F6B6B] hover:bg-[#0a4f4f] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>⚡ Click to Auto-Fill Code (555555)</span>
                  </button>

                  <div className="text-[10px] text-[#5B6B7A] flex items-center justify-between pt-1 border-t border-teal-100">
                    <span>Alternative code: <strong className="font-mono text-[#14202B]">123456</strong></span>
                    <span>Emergency recovery: <strong className="font-mono text-[#14202B]">REC-DEMO-2025</strong></span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleMfaSubmit} className="space-y-4">
                  {!useRecoveryCode ? (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#14202B] mb-2 text-center">
                        ENTER 6-DIGIT AUTHENTICATOR CODE
                      </label>
                      <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePasteMfa}>
                        {mfaCode.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`mfa-input-${idx}`}
                            data-testid={`totp-input-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className="w-10 h-12 text-center text-lg font-bold font-mono border border-[#E3E8EE] rounded-xl bg-[#F7F9FB] focus:border-[#0F6B6B] focus:ring-2 focus:ring-[#0F6B6B] outline-none transition text-[#14202B]"
                          />
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#5B6B7A]">
                        <span>Security window:</span>
                        <span className="font-mono font-bold bg-[#F7F9FB] px-2 py-0.5 rounded border border-[#E3E8EE] text-[#0F6B6B]">
                          {mfaTimer}s
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#14202B] mb-1">
                        Emergency Single-Use Recovery Code
                      </label>
                      <input
                        type="text"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="REC-DEMO-2025"
                        className="w-full text-xs font-mono p-2.5 border border-[#E3E8EE] rounded-xl bg-[#F7F9FB] text-[#14202B] focus:ring-2 focus:ring-[#0F6B6B] outline-none"
                      />
                      <span className="text-[10px] text-[#5B6B7A] block mt-1">
                        Demo recovery code: <code className="font-bold text-[#0F6B6B]">REC-DEMO-2025</code>
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-[#0F6B6B] hover:bg-[#0a4f4f] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <span>{submitting ? "Verifying..." : "Verify & Access"}</span>
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E3E8EE]">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setMfaCode(["", "", "", "", "", ""]);
                        setErrorMsg("");
                      }}
                      className="text-[#5B6B7A] hover:text-[#14202B] font-semibold"
                    >
                      ← Back to Sign-In
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                      className="text-[#0F6B6B] hover:underline font-semibold"
                    >
                      {useRecoveryCode ? "Use TOTP Code" : "Use Recovery Code"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PASSWORD RECOVERY VIEW */}
            {mode === "recovery" && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F6B6B] flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-[#14202B]">
                    Reset Password
                  </h2>
                  <p className="text-xs text-[#5B6B7A] max-w-xs mx-auto">
                    Enter your registered institutional email to receive secure recovery instructions.
                  </p>
                </div>

                {recoverySent ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs space-y-3 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="font-semibold">
                      If an account exists for {recoveryEmail}, password reset instructions have been dispatched.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setRecoverySent(false);
                      }}
                      className="text-[#0F6B6B] font-bold underline"
                    >
                      Return to Sign-In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRecoverySubmit} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-[#14202B] block mb-1">
                        Institutional Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="official@institution.edu.in"
                        className="w-full text-xs p-2.5 border border-[#E3E8EE] rounded-xl bg-[#F7F9FB] text-[#14202B] focus:ring-2 focus:ring-[#0F6B6B] outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={recoveryLoading}
                      className="w-full py-2.5 bg-[#0F6B6B] hover:bg-[#0a4f4f] text-white font-bold text-xs rounded-xl transition shadow-xs disabled:opacity-60"
                    >
                      {recoveryLoading ? "Dispatching..." : "Send Reset Link"}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setMode("signin")}
                        className="text-xs text-[#5B6B7A] hover:text-[#14202B] font-semibold"
                      >
                        ← Back to Sign-In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-white">Loading Portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
