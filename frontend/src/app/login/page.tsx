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

  // Sign-in form states (clean defaults, no hardcoded demo credentials)
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
    <div
      className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 text-[#14202B] font-sans antialiased overflow-y-auto"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(7, 24, 28, 0.88) 0%, rgba(12, 60, 60, 0.78) 50%, rgba(6, 28, 30, 0.92) 100%), url('/images/aicte-hq.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Centered Single-Column Clean Card */}
      <div className="w-full max-w-md mx-auto relative z-10 py-8">
        <div className="bg-white rounded-3xl border border-white/60 shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Official AICTE Brand Header */}
          <div className="text-center space-y-2 pb-2 border-b border-[#E3E8EE]">
            <div className="w-12 h-12 rounded-2xl bg-[#0F6B6B] flex items-center justify-center text-white font-extrabold text-sm shadow-md mx-auto">
              <span>AICTE</span>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#0F6B6B] uppercase tracking-wider">
                अखिल भारतीय तकनीकी शिक्षा परिषद्
              </div>
              <h1 className="text-lg font-extrabold text-[#14202B] tracking-tight">
                NIYAM Regulatory Portal
              </h1>
              <p className="text-[11px] text-[#5B6B7A]">
                AICTE Institutional Application Review &amp; Compliance Verification
              </p>
            </div>
          </div>

          {/* SIGN-IN FORM */}
          {mode === "signin" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#14202B]">Authorized Sign-In</h2>
                <p className="text-xs text-[#5B6B7A]">
                  Enter your institutional or regulatory credentials.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#14202B]" htmlFor="login-email">
                    Username / AICTE ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
                    <input
                      id="login-email"
                      type="text"
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter username"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border bg-[#F7F9FB] text-[#14202B] focus:outline-none focus:ring-2 focus:ring-[#0F6B6B] border-[#E3E8EE]"
                    />
                  </div>
                </div>

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
                      placeholder="Enter password"
                      className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border bg-[#F7F9FB] text-[#14202B] focus:outline-none focus:ring-2 focus:ring-[#0F6B6B] border-[#E3E8EE]"
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
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-[#0F6B6B] hover:bg-[#0a4f4f] text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{submitting ? "Signing in..." : "Sign In to Workspace"}</span>
                </button>
              </form>

              <p className="text-xs text-center text-[#5B6B7A] pt-2 border-t border-[#E3E8EE]">
                New institutional applicant?{" "}
                <Link href="/auth/register" className="font-bold text-[#0F6B6B] hover:underline">
                  Register institutional account
                </Link>
              </p>
            </div>
          )}

          {/* MFA VERIFICATION FORM */}
          {mode === "mfa" && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F6B6B] flex items-center justify-center mx-auto shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-[#14202B]">
                  Two-Factor Authentication
                </h2>
                <p className="text-xs text-[#5B6B7A] max-w-xs mx-auto">
                  Official regulatory access is protected by RFC 6238 Time-based One-Time Password (TOTP).
                </p>
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
                      <span>Code refresh cycle:</span>
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
                      placeholder="e.g. REC-XXXX-XXXX"
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

          {/* PASSWORD RECOVERY FORM */}
          {mode === "recovery" && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F6B6B] flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-[#14202B]">
                  Reset Password
                </h2>
                <p className="text-xs text-[#5B6B7A] max-w-xs mx-auto">
                  Enter your registered institutional email to receive recovery instructions.
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

          {/* Regulatory Citation Footer */}
          <div className="pt-2 text-center text-[10px] text-[#5B6B7A] border-t border-[#E3E8EE]">
            <span>AICTE Problem Statement 26261 · APH 2025-26</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center text-xs text-[#5B6B7A]">Loading portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
