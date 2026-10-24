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
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const { login, verifyMfa, getRoleRedirect } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const errorParam = searchParams.get("error");

  const supabase = createClient();

  // Mode: "signin" | "mfa" | "recovery"
  const [mode, setMode] = useState<"signin" | "mfa" | "recovery">("signin");

  // Sign-in form states
  const [identifier, setIdentifier] = useState("applicant");
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

  // Password recovery states
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Countdown timer for TOTP window
  useEffect(() => {
    let interval: any;
    if (mode === "mfa" && mfaTimer > 0) {
      interval = setInterval(() => setMfaTimer((t) => (t > 0 ? t - 1 : 30)), 1000);
    }
    return () => clearInterval(interval);
  }, [mode, mfaTimer]);

  // Handle Primary Sign-in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const result = await login(identifier.trim(), password);
      if (result.mfaRequired) {
        setMfaSessionToken(result.sessionToken);
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

  // Handle MFA 6-digit TOTP input
  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...mfaCode];
    updated[index] = val;
    setMfaCode(updated);

    if (val && index < 5) {
      const nextInput =
        document.getElementById(`mfa-input-${index + 1}`) ||
        document.getElementById(`totp-input-${index + 1}`);
      nextInput?.focus();
    }
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
      className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-10 text-[#14202B] font-sans antialiased overflow-y-auto"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(7, 30, 34, 0.88) 0%, rgba(15, 107, 107, 0.80) 50%, rgba(10, 79, 79, 0.92) 100%), url('/images/aicte-hq.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Outer Container with Max Width */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-12 relative z-10 py-6">
        
        {/* LEFT PANEL: Official AICTE Identity & Bureau Mandate */}
        <div className="lg:w-[50%] text-white flex flex-col justify-between p-6 sm:p-10 rounded-3xl bg-black/35 backdrop-blur-md border border-white/20 shadow-2xl">
          <div>
            {/* National Header Banner */}
            <div className="flex items-center gap-3.5 pb-6 border-b border-white/15">
              <div className="w-12 h-12 rounded-2xl bg-white/95 p-1 shadow-md flex items-center justify-center shrink-0">
                {/* Emblem / Shield Badge */}
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
            <div className="mt-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-200 text-[11px] font-bold backdrop-blur-xs border border-teal-300/30">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>AICTE Problem Statement 26261 · Approval Portal</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white">
                NIYAM
                <span className="block text-lg sm:text-xl font-semibold text-teal-200 mt-1">
                  Institutional Validation &amp; Regulatory Scrutiny
                </span>
              </h1>

              <p className="text-sm text-teal-100/90 leading-relaxed max-w-lg">
                Automated application compliance verification, official document authentication via DigiLocker and Bharatkosh, and transparent evidence-linked scrutiny for competent authorities.
              </p>

              {/* 5-Pillar APH Verification Norms */}
              <div className="pt-4 space-y-2.5">
                <div className="text-[10px] font-bold text-teal-200 uppercase tracking-wider">
                  Approval Process Handbook (APH 2025-26) Verified Norms:
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
                    <span>Fire NOC &amp; Structural Safety</span>
                  </li>
                  <li className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10 sm:col-span-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    <span>Bharatkosh Electronic Regulatory Fee Settlement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Statutory Footer Citation */}
          <div className="pt-6 mt-8 border-t border-white/15 text-[11px] text-teal-200/90 flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">Nelson Mandela Marg, Vasant Kunj, New Delhi</span>
            <span className="font-mono text-teal-300 font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">
              Session 2025-26
            </span>
          </div>
        </div>

        {/* RIGHT PANEL: Focused Authentication Desk Card */}
        <div className="lg:w-[48%] flex items-center justify-center">
          <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl border border-white/40 shadow-2xl p-6 sm:p-8 space-y-6">
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
                    Enter your regulatory credentials or select an authorized evaluator persona below.
                  </p>
                </div>

                {/* Quick Role Selector (Verified Accounts) */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-[#5B6B7A] uppercase tracking-wider">
                    Quick Role Selector (Verified Accounts)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => selectPersona("applicant")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        identifier === "applicant"
                          ? "bg-[#0F6B6B] text-white border-[#0F6B6B] shadow-xs"
                          : "border-[#E3E8EE] bg-white text-[#5B6B7A] hover:border-[#0F6B6B] hover:text-[#0F6B6B] hover:bg-teal-50/50"
                      }`}
                    >
                      Applicant
                    </button>
                    <button
                      type="button"
                      onClick={() => selectPersona("officer")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        identifier === "officer"
                          ? "bg-[#0F6B6B] text-white border-[#0F6B6B] shadow-xs"
                          : "border-[#E3E8EE] bg-white text-[#5B6B7A] hover:border-[#0F6B6B] hover:text-[#0F6B6B] hover:bg-teal-50/50"
                      }`}
                    >
                      Scrutiny Officer
                    </button>
                    <button
                      type="button"
                      onClick={() => selectPersona("authority")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        identifier === "authority"
                          ? "bg-[#0F6B6B] text-white border-[#0F6B6B] shadow-xs"
                          : "border-[#E3E8EE] bg-white text-[#5B6B7A] hover:border-[#0F6B6B] hover:text-[#0F6B6B] hover:bg-teal-50/50"
                      }`}
                    >
                      Supervising Authority
                    </button>
                    <button
                      type="button"
                      onClick={() => selectPersona("admin")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        identifier === "admin"
                          ? "bg-[#0F6B6B] text-white border-[#0F6B6B] shadow-xs"
                          : "border-[#E3E8EE] bg-white text-[#5B6B7A] hover:border-[#0F6B6B] hover:text-[#0F6B6B] hover:bg-teal-50/50"
                      }`}
                    >
                      System Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => selectPersona("auditor")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        identifier === "auditor"
                          ? "bg-[#0F6B6B] text-white border-[#0F6B6B] shadow-xs"
                          : "border-[#E3E8EE] bg-white text-[#5B6B7A] hover:border-[#0F6B6B] hover:text-[#0F6B6B] hover:bg-teal-50/50"
                      }`}
                    >
                      Statutory Auditor
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Identifier */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#14202B]" htmlFor="login-email">
                      Username or Email
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
                        placeholder="e.g. applicant or applicant@apexinstitute.edu.in"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border bg-[#F7F9FB] text-[#14202B] focus:outline-none focus:ring-2 focus:ring-[#0F6B6B] focus:border-[#0F6B6B] transition-colors border-[#E3E8EE]"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
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
                        className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border bg-[#F7F9FB] text-[#14202B] focus:outline-none focus:ring-2 focus:ring-[#0F6B6B] focus:border-[#0F6B6B] transition-colors border-[#E3E8EE]"
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
                  <label className="flex items-center gap-2 text-xs text-[#14202B] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E3E8EE] accent-[#0F6B6B]"
                    />
                    <span>Remember me on this institutional device</span>
                  </label>

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
              </>
            )}

            {/* MFA VIEW */}
            {mode === "mfa" && (
              <div>
                <div className="mb-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 text-[#0F6B6B] flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-[#14202B]">
                    Two-Factor Authentication Required
                  </h2>
                  <p className="text-xs text-[#5B6B7A] mt-1 max-w-xs mx-auto">
                    Regulatory official access is protected by RFC 6238 Multi-Factor Authentication.
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleMfaSubmit} className="space-y-4">
                  {!useRecoveryCode ? (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#14202B] mb-2 text-center">
                        6-Digit Authenticator Code
                      </label>
                      <div className="flex justify-center gap-2 sm:gap-3">
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
                            className="w-10 h-12 text-center text-lg font-bold font-mono border border-[#E3E8EE] rounded-xl bg-[#F7F9FB] focus:border-[#0F6B6B] focus:ring-2 focus:ring-[#0F6B6B] outline-none transition"
                          />
                        ))}
                      </div>
                      <div className="mt-3 text-center text-[11px] text-[#5B6B7A]">
                        Window refreshes in: <span className="font-mono font-bold text-[#0F6B6B]">{mfaTimer}s</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#14202B] mb-1">
                        Emergency Single-Use Recovery Code
                      </label>
                      <input
                        type="text"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="e.g. REC-7F89A-4B2C"
                        className="w-full text-xs font-mono p-2.5 border border-[#E3E8EE] rounded-xl bg-[#F7F9FB] text-[#14202B] focus:ring-2 focus:ring-[#0F6B6B] outline-none"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-[#0F6B6B] hover:bg-[#0a4f4f] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <span>{submitting ? "Verifying..." : "Verify & Access"}</span>
                  </button>

                  <div className="pt-2 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                      className="text-[#0F6B6B] hover:underline font-semibold"
                    >
                      {useRecoveryCode ? "Use Authenticator App TOTP" : "Use Emergency Recovery Code"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PASSWORD RECOVERY VIEW */}
            {mode === "recovery" && (
              <div>
                <div className="mb-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 text-[#0F6B6B] flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-[#14202B]">
                    Reset Password
                  </h2>
                  <p className="text-xs text-[#5B6B7A] mt-1 max-w-xs mx-auto">
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
                  <form onSubmit={handleRecoverySubmit} className="space-y-4">
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

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setMode("signin")}
                        className="text-xs text-[#5B6B7A] hover:text-[#14202B] font-semibold"
                      >
                        Back to Login
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
