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
  shortRole: string;
  username: string;
  password: string;
  pin: string;
  description: string;
  hasMfa: boolean;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    roleName: "Scrutiny Officer",
    shortRole: "Officer",
    username: "officer",
    password: "password123",
    pin: "123456",
    description: "Technical Scrutiny Desk & Deficiencies",
    hasMfa: true,
  },
  {
    roleName: "Institution Applicant",
    shortRole: "Applicant",
    username: "applicant",
    password: "password123",
    pin: "None (Direct Access)",
    description: "College Filing Portal & Upload Scrutiny",
    hasMfa: false,
  },
  {
    roleName: "Supervising Authority",
    shortRole: "Authority",
    username: "authority",
    password: "password123",
    pin: "123456",
    description: "AICTE Bureau Head, Deficiencies & Approvals",
    hasMfa: true,
  },
  {
    roleName: "System Administrator",
    shortRole: "Admin",
    username: "admin",
    password: "password123",
    pin: "123456",
    description: "User Management & Regulatory Rules Engine",
    hasMfa: true,
  },
  {
    roleName: "Regulatory Auditor",
    shortRole: "Auditor",
    username: "auditor",
    password: "password123",
    pin: "None (Direct Access)",
    description: "Tamper-Evident SHA-256 Ledger Audit",
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

  const selectedAccount = DEMO_ACCOUNTS.find((a) => a.username === identifier) || DEMO_ACCOUNTS[0];

  return (
    <div className="min-h-screen relative flex flex-col justify-between p-4 sm:p-6 text-slate-900 dark:text-slate-100 font-sans antialiased overflow-y-auto">
      {/* FULL-SCREEN BACKGROUND PHOTOGRAPH OF AICTE HEADQUARTERS - HIGH FIDELITY */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img
          src="/images/aicte-hq.png"
          alt="AICTE Headquarters Campus, Nelson Mandela Marg, New Delhi"
          className="w-full h-full object-cover object-center filter brightness-[0.96] contrast-[1.04] saturate-[1.12]"
        />
        {/* Subtle, translucent vignette gradient so campus & building are 100% visible while preserving text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/25 to-slate-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(37,99,235,0.12),transparent)]" />
      </div>

      {/* TOP FLOATING REGULATORY STATUS BAR */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between py-2 sm:py-3">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/15 text-white shadow-xl text-xs">
          <div className="w-5 h-5 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0 shadow-xs">
            <img src="/images/aicte-logo.png" alt="AICTE Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold hidden sm:inline text-slate-200 text-xs">
            All India Council for Technical Education
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          <span className="text-[11px] font-semibold text-emerald-300">Live Regulatory Portal</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/15 text-white shadow-xl text-xs">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-medium text-slate-200 hidden sm:inline">Nelson Mandela Marg, New Delhi</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-600/90 font-bold">MoE</span>
        </div>
      </header>

      {/* CENTERED EXECUTIVE GLASSMORPHIC LOGIN CARD (GOLDEN RATIO PROPORTIONS) */}
      <div className="relative z-10 w-full max-w-[460px] mx-auto my-auto py-4 sm:py-6">
        <div className="bg-white/95 dark:bg-[#0C1222]/92 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-slate-700/80 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.2)_inset] p-6 sm:p-8 space-y-5">
          
          {/* Official AICTE Brand Header */}
          <div className="text-center space-y-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div
              className="relative w-11 h-11 rounded-xl bg-white dark:bg-slate-800 p-1.5 shadow-md mx-auto ring-2 ring-blue-500/20 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0"
              style={{ width: "44px", height: "44px" }}
            >
              <img
                src="/images/aicte-logo.png"
                alt="AICTE Official Logo"
                className="w-full h-full object-contain"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0C1222]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">
                अखिल भारतीय तकनीकी शिक्षा परिषद्
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                NIYAM Regulatory Portal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AICTE Application Review &amp; Compliance Verification
              </p>
            </div>
          </div>

          {/* SIGN-IN FORM */}
          {mode === "signin" && (
            <div className="space-y-4">
              {/* EXECUTIVE DEMO ROLE SELECTOR */}
              <div className="rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-2.5 space-y-2">
                <div className="flex items-center justify-between text-xs px-0.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Quick Demo Access
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    PW: <strong className="text-slate-800 dark:text-slate-200">password123</strong>
                  </span>
                </div>

                {/* 5-Role Segmented Selector */}
                <div className="grid grid-cols-5 gap-1 p-0.5 bg-slate-200/70 dark:bg-slate-950/70 rounded-xl">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = identifier === acc.username;
                    return (
                      <button
                        key={acc.username}
                        type="button"
                        onClick={() => handleSelectAccount(acc)}
                        className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center truncate ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-500"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60"
                        }`}
                        title={`${acc.roleName} (${acc.username})`}
                      >
                        {acc.shortRole}
                      </button>
                    );
                  })}
                </div>

                {/* Active Role Feedback Context Bar */}
                {selectedAccount && (
                  <div className="flex items-center justify-between text-[11px] px-1 pt-0.5 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {selectedAccount.roleName}
                      </span>
                      <span className="font-mono text-slate-500">
                        ({selectedAccount.username})
                      </span>
                    </div>
                    {selectedAccount.hasMfa ? (
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shrink-0">
                        PIN: 123456
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                        Direct Access
                      </span>
                    )}
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block" htmlFor="login-email">
                    Username / AICTE Official ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-email"
                      type="text"
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter username (e.g. officer, applicant)"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/80 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 dark:focus:border-blue-500 border-slate-200 dark:border-slate-700 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="login-pw">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("recovery");
                        setErrorMsg("");
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-pw"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50/80 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 dark:focus:border-blue-500 border-slate-200 dark:border-slate-700 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
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
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-blue-600 cursor-pointer"
                    />
                    <span>Remember active session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-600/25 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{submitting ? "Authenticating..." : `Sign In to Workspace`}</span>
                </button>
              </form>

              <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800">
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
              <div className="text-center space-y-1.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Two-Factor Authentication
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Protected by RFC 6238 Time-based One-Time Password (TOTP)
                </p>
              </div>

              {/* DEMO PIN CALLOUT BOX */}
              <div className="p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 dark:text-amber-300 block">
                    Demo Security PIN
                  </span>
                  <span className="text-lg font-mono font-black text-amber-900 dark:text-amber-100 tracking-widest">
                    123456
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMfaCode(["1", "2", "3", "4", "5", "6"]);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-sm transition flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Insert 123456</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleMfaSubmit} className="space-y-4">
                {!useRecoveryCode ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5 text-center">
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
                          className="w-10 sm:w-11 h-12 sm:h-13 text-center text-lg sm:text-xl font-bold font-mono border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 outline-none transition text-slate-900 dark:text-white shadow-xs"
                        />
                      ))}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                      <span>Window: <strong className="text-blue-600 dark:text-blue-400 font-mono font-bold">{mfaTimer}s</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setMfaCode(["1", "2", "3", "4", "5", "6"]);
                        }}
                        className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Auto-fill: 123456
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Emergency Single-Use Recovery Code
                    </label>
                    <input
                      type="text"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="e.g. REC-XXXX-XXXX"
                      className="w-full text-sm font-mono py-2.5 px-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{submitting ? "Verifying..." : "Verify PIN & Access Workspace"}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 dark:border-slate-800">
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
              <div className="text-center space-y-1.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Reset Password
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Enter your registered institutional email to receive recovery instructions.
                </p>
              </div>

              {recoverySent ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 rounded-2xl text-xs space-y-3 text-center">
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
                <form onSubmit={handleRecoverySubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Institutional Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="official@institution.edu.in"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 outline-none transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
                  >
                    <span>{recoveryLoading ? "Dispatching..." : "Send Reset Link"}</span>
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
          <div className="pt-2 text-center text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-200/80 dark:border-slate-800">
            <span>AICTE Problem Statement 26261 · APH 2025-26</span>
          </div>

        </div>
      </div>

      {/* BOTTOM CAMPUS PHOTO ATTRIBUTION */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto py-2 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/10 text-slate-300 text-[11px] shadow-lg">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span>AICTE Headquarters Campus, Nelson Mandela Marg, New Delhi</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Decision-Support &amp; Fraud-Resistant Verification</span>
        </div>
      </footer>
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
