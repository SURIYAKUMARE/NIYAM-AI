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
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
  const handleQuickFill = (roleUser: string) => {
    setIdentifier(roleUser);
    setPassword("password123");
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
      setErrorMsg("Please enter the complete 6-digit TOTP authenticator code.");
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
      setErrorMsg(err.message || "Invalid MFA verification code or expired session.");
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

      {/* Centered Single-Column Executive Card */}
      <div className="w-full max-w-md mx-auto relative z-10 py-8">
        <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
          
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
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
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
                  Enter your institutional or regulatory credentials.
                </p>
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
                      placeholder="e.g. officer_rajesh or applicant_apex"
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
                      placeholder="Enter password"
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
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{submitting ? "Signing in..." : "Sign In to Workspace"}</span>
                </button>
              </form>

              {/* Quick Role Selectors for Convenient Review */}
              <div className="pt-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 text-center">
                  Quick Role Switcher (Pre-fill Credentials)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("officer_rajesh")}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition text-center truncate"
                    title="Scrutiny Officer (Requires TOTP 123456)"
                  >
                    Scrutiny Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("applicant_apex")}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition text-center truncate"
                    title="Institution Applicant"
                  >
                    Applicant
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("authority_sharma")}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition text-center truncate"
                    title="Supervising Authority"
                  >
                    Authority
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("admin_super")}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition text-center truncate"
                    title="System Admin"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("auditor_verma")}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition text-center truncate col-span-2 sm:col-span-1"
                    title="Statutory Auditor"
                  >
                    Auditor
                  </button>
                </div>
              </div>

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
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Two-Factor Authentication
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Official regulatory access is protected by RFC 6238 Time-based One-Time Password (TOTP).
                </p>
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
                  <span>{submitting ? "Verifying..." : "Verify & Access"}</span>
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
                    {useRecoveryCode ? "Use TOTP Code" : "Use Recovery Code"}
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
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] flex items-center justify-center text-xs text-slate-500">Loading portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
