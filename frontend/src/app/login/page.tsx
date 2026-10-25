"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  LogIn,
  CheckCircle2,
  Mail,
  Sparkles,
  ArrowRight,
  Shield,
  Key,
  Fingerprint,
  Building2,
  MapPin,
  Cpu,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface DemoAccount {
  roleName: string;
  username: string;
  password: string;
  pin: string;
  description: string;
  hasMfa: boolean;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    roleName: "Scrutiny Officer",
    username: "officer",
    password: "password123",
    pin: "123456",
    description: "Technical Scrutiny Desk, review queue & anomaly checking",
    hasMfa: true,
  },
  {
    roleName: "Institution Applicant",
    username: "applicant",
    password: "password123",
    pin: "None (Direct Access)",
    description: "College filing portal, document upload & rectification",
    hasMfa: false,
  },
  {
    roleName: "Supervising Authority",
    username: "authority",
    password: "password123",
    pin: "123456",
    description: "AICTE Bureau Head, final approvals, deficiencies & orders",
    hasMfa: true,
  },
  {
    roleName: "System Administrator",
    username: "admin",
    password: "password123",
    pin: "123456",
    description: "User management, regulatory rules & engine settings",
    hasMfa: true,
  },
  {
    roleName: "Regulatory Auditor",
    username: "auditor",
    password: "password123",
    pin: "None (Direct Access)",
    description: "Tamper-evident logs, cryptographic ledger & chain audit",
    hasMfa: false,
  },
];

function LoginForm() {
  const { user, login, verifyMfa, getRoleRedirect, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const expiredParam = searchParams.get("expired");

  const supabase = createClient();

  // Mode: "signin" | "mfa" | "recovery"
  const [mode, setMode] = useState<"signin" | "mfa" | "recovery">("signin");

  // Sign-in form states
  const [identifier, setIdentifier] = useState("officer");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    expiredParam === "1" ? "Session expired, please sign in again." : ""
  );

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

  // Active filled account tracking for visual indicator
  const [activeFilledUser, setActiveFilledUser] = useState<string>("officer");

  // If already logged in, redirect to role home
  useEffect(() => {
    if (!isLoading && user) {
      const dest = redirectedFrom || getRoleRedirect(user.role);
      router.replace(dest);
    }
  }, [user, isLoading, redirectedFrom, getRoleRedirect, router]);

  // Countdown timer for TOTP window
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
        router.replace(dest);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid username or password");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick fill helper for testing authorized roles
  const handleSelectAccount = (account: DemoAccount) => {
    setIdentifier(account.username);
    setPassword(account.password);
    setActiveFilledUser(account.username);
    setErrorMsg("");
  };

  // Handle MFA 6-digit TOTP input with auto-advance and backspace
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

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const codeToVerify = useRecoveryCode ? recoveryCode.trim() : mfaCode.join("");
    if (!useRecoveryCode && codeToVerify.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit TOTP security PIN (Demo PIN: 123456).");
      return;
    }
    if (useRecoveryCode && !codeToVerify) {
      setErrorMsg("Please enter your emergency recovery code.");
      return;
    }

    setSubmitting(true);
    try {
      const verifiedUser = await verifyMfa(codeToVerify, mfaSessionToken);
      const dest = redirectedFrom || getRoleRedirect(verifiedUser?.role);
      router.replace(dest);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid MFA PIN or expired session. Please use 123456.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setRecoveryLoading(true);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
      });
      if (error) throw error;
      setRecoverySent(true);
    } catch (err: any) {
      setRecoverySent(true);
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 text-slate-900 dark:text-slate-100 font-sans antialiased overflow-y-auto bg-gradient-to-br from-[#090D16] via-[#0E162B] to-[#0A1020]">
      {/* Ambient background glow & grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Responsive Executive Container: Left Hero Showcase + Right Access Card */}
      <div className="w-full max-w-5xl mx-auto relative z-10 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: HERO SHOWCASE & PHOTO CARD (Visible on Large Screens) */}
          <div className="hidden lg:flex flex-col justify-between space-y-5 lg:col-span-5 text-white">
            {/* AICTE Portal Identity */}
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AICTE Regulatory Command Center</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                Empowering Technical Education Governance
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                National decision-support platform for Extension of Approval (EoA), automated document scrutiny, and fraud-resistant verification.
              </p>
            </div>

            {/* AICTE HEADQUARTERS HERO PHOTO CARD */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-900/90 shadow-2xl group transition-all duration-300 hover:border-blue-500/50">
              <div className="relative h-60 w-full overflow-hidden bg-slate-950">
                <img
                  src="/images/aicte-hq.png"
                  alt="AICTE Headquarters, Nelson Mandela Marg, New Delhi"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Vignette gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Top Floating Badges */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold flex items-center gap-2 shadow-lg">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>AICTE Headquarters</span>
                </div>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-wider uppercase shadow-md">
                  MoE · Govt of India
                </div>

                {/* Bottom Photo Caption */}
                <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Nelson Mandela Marg, Vasant Kunj, New Delhi</span>
                  </div>
                  <p className="text-[10px] text-slate-300 pl-5">
                    Apex National Council for Technical Education Planning &amp; Standards
                  </p>
                </div>
              </div>

              {/* Platform Pillars below photo */}
              <div className="p-4 bg-slate-900/95 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-[11px]">Intelligent Scrutiny &amp; OCR</span>
                    <span className="text-[10px] text-slate-400">Automated field cross-validation against Approval Process Handbook (APH).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-[11px]">Tampering &amp; Forgery Detection</span>
                    <span className="text-[10px] text-slate-400">Font anomaly, modified intakes, signature absence, and QR mismatch flags.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-[11px]">Cryptographic Audit Chain</span>
                    <span className="text-[10px] text-slate-400">Tamper-evident SHA-256 ledger recording every inspection &amp; decision.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Institutions Live Pill */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-slate-300">Synthetic Test Sandbox Active</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                12 Institutions Loaded
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE AUTHENTICATION CARD */}
          <div className="w-full lg:col-span-7">
            <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">

              {/* Mobile Hero Photo Banner (Visible on Small/Medium Screens) */}
              <div className="lg:hidden relative h-36 sm:h-44 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md mb-2 bg-slate-950">
                <img
                  src="/images/aicte-hq.png"
                  alt="AICTE Headquarters, Nelson Mandela Marg, New Delhi"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-blue-400" />
                  <span>AICTE Headquarters</span>
                </div>
                <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-100">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">Nelson Mandela Marg, Vasant Kunj, New Delhi</span>
                  </div>
                </div>
              </div>
              
              {/* Official AICTE Brand Header */}
              <div className="text-center space-y-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-sm shadow-md mx-auto ring-2 ring-blue-500/20">
                  <span>AICTE</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-white dark:ring-[#0F172A]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    अखिल भारतीय तकनीकी शिक्षा परिषद्
                  </div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    NIYAM Regulatory Portal
                  </h1>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    AICTE Institutional Application Review &amp; Compliance Verification
                  </p>
                </div>
              </div>

          {/* SIGN-IN FORM */}
          {mode === "signin" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Authorized Sign-In</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a demo account below or enter your credentials.
                </p>
              </div>

              {/* DEMO CREDENTIALS CALLOUT BOX */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Demo Credentials (All Roles)
                  </span>
                  <span className="font-mono text-[11px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Password: <strong>password123</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = identifier === acc.username;
                    return (
                      <button
                        key={acc.username}
                        type="button"
                        onClick={() => handleSelectAccount(acc)}
                        className={`text-left p-2 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-1 ring-blue-500"
                            : "bg-white dark:bg-slate-800/80 hover:bg-blue-50/50 dark:hover:bg-slate-700/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="font-bold truncate text-[11px]">{acc.roleName}</span>
                          {acc.hasMfa ? (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              }`}
                            >
                              PIN: {acc.pin}
                            </span>
                          ) : (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              }`}
                            >
                              Direct
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] mt-1 opacity-90">
                          <span className="font-mono">ID: {acc.username}</span>
                          <span className="text-[9px] font-semibold underline">Pre-fill</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200" htmlFor="login-email">
                    Username / AICTE ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-email"
                      type="text"
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. officer, applicant, authority, admin, auditor"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 border-slate-200 dark:border-slate-700 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200" htmlFor="login-pw">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("recovery");
                        setErrorMsg("");
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-pw"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (default: password123)"
                      className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 border-slate-200 dark:border-slate-700 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-blue-600"
                    />
                    <span>Remember session</span>
                  </label>

                  <span className="text-[11px] text-slate-400">
                    Current ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{identifier}</strong>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{submitting ? "Signing in..." : `Sign In as ${identifier.toUpperCase()}`}</span>
                </button>
              </form>

              <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                New institutional applicant?{" "}
                <Link href="/auth/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Register institutional account
                </Link>
              </p>
            </div>
          )}

          {/* MFA VERIFICATION FORM */}
          {mode === "mfa" && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Two-Factor Authentication
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Regulatory officials are protected by RFC 6238 Time-based One-Time Password (TOTP).
                </p>
              </div>

              {/* DEMO PIN CALLOUT BOX */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 dark:text-amber-300 block">
                    Demo 2FA Security PIN
                  </span>
                  <span className="text-lg font-mono font-extrabold text-amber-900 dark:text-amber-100 tracking-widest">
                    123456
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMfaCode(["1", "2", "3", "4", "5", "6"]);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Insert PIN 123456</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleMfaSubmit} className="space-y-4">
                {!useRecoveryCode ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 text-center">
                      ENTER 6-DIGIT AUTHENTICATOR PIN
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
                          className="w-10 h-12 text-center text-lg font-bold font-mono border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition text-slate-900 dark:text-white"
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Code refresh cycle: <strong className="text-blue-600 dark:text-blue-400 font-mono">{mfaTimer}s</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setMfaCode(["1", "2", "3", "4", "5", "6"]);
                        }}
                        className="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Auto-fill: 123456
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Emergency Single-Use Recovery Code
                    </label>
                    <input
                      type="text"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="e.g. REC-XXXX-XXXX"
                      className="w-full text-xs font-mono p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <span>{submitting ? "Verifying..." : "Verify PIN & Access Workspace"}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setMfaCode(["", "", "", "", "", ""]);
                      setErrorMsg("");
                    }}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
                  >
                    ← Back to Sign-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    {useRecoveryCode ? "Use 6-Digit PIN" : "Use Recovery Code"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PASSWORD RECOVERY FORM */}
          {mode === "recovery" && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Reset Password
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Enter your registered institutional email to receive recovery instructions.
                </p>
              </div>

              {recoverySent ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 rounded-xl text-xs space-y-3 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p className="font-semibold">
                    If an account exists for {recoveryEmail}, password reset instructions have been dispatched.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setRecoverySent(false);
                    }}
                    className="text-blue-600 dark:text-blue-400 font-bold underline"
                  >
                    Return to Sign-In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecoverySubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Institutional Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="official@institution.edu.in"
                      className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs disabled:opacity-60"
                  >
                    {recoveryLoading ? "Dispatching..." : "Send Reset Link"}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
                    >
                      ← Back to Sign-In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Regulatory Citation Footer */}
          <div className="pt-2 text-center text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800">
            <span>AICTE Problem Statement 26261 · APH 2025-26</span>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] flex items-center justify-center text-xs text-slate-500">Loading portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
