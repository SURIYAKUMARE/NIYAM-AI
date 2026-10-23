"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Lock,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  ArrowRight,
  KeyRound,
  Mail,
  RefreshCw,
  CheckCircle2,
  Smartphone,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { login, demoAccounts } = useAuth();
  const router = useRouter();

  // Mode: "signin" | "mfa" | "recovery"
  const [activeTab, setActiveTab] = useState<"signin" | "recovery">("signin");
  const [showMFA, setShowMFA] = useState(false);

  // Form states
  const [username, setUsername] = useState("officer");
  const [password, setPassword] = useState("password123");
  const [mfaCode, setMfaCode] = useState(["", "", "", "", "", ""]);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mfaTimer, setMfaTimer] = useState(30);

  // TOTP countdown simulation
  useEffect(() => {
    let interval: any;
    if (showMFA && mfaTimer > 0) {
      interval = setInterval(() => setMfaTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showMFA, mfaTimer]);

  const handleInitialSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    // If logging in as official (officer, authority, admin), trigger MFA step
    if (["officer", "authority", "admin"].includes(username.toLowerCase())) {
      setShowMFA(true);
      setMfaTimer(30);
      return;
    }

    // Direct login for applicant and auditor
    performLogin();
  };

  const performLogin = async () => {
    setSubmitting(true);
    try {
      await login(username, password);
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please verify your user ID and password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...mfaCode];
    updated[index] = val;
    setMfaCode(updated);

    // Auto-advance focus to next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`mfa-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = mfaCode.join("");
    if (fullCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }
    performLogin();
  };

  const handleQuickDemoSelect = async (demoUsername: string) => {
    setUsername(demoUsername);
    setPassword("password123");
    setErrorMsg("");

    if (["officer", "authority", "admin"].includes(demoUsername)) {
      setShowMFA(true);
      setMfaCode(["5", "2", "8", "9", "0", "1"]);
      setMfaTimer(30);
    } else {
      setShowMFA(false);
      setSubmitting(true);
      try {
        await login(demoUsername, "password123");
        router.push("/");
      } catch (err: any) {
        setErrorMsg(err.message || "Error logging into demo account");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setRecoverySent(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy-950 text-niyam-accent font-bold text-xl mb-3 border border-niyam-border shadow-subtle">
          NY
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-niyam-text tracking-tight">
          Niyam — Regulatory Authentication Gateway
        </h1>
        <p className="text-sm text-niyam-secondary mt-1 max-w-xl mx-auto">
          AICTE Regulation Bureau Prototype for preliminary institutional validation, document authentication, and statutory scrutiny.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Main Authentication Card */}
        <div className="md:col-span-7 bg-niyam-surface rounded-lg border border-niyam-border p-6 shadow-card">
          {/* Tabs */}
          {!showMFA && (
            <div className="flex border-b border-niyam-border mb-6">
              <button
                onClick={() => {
                  setActiveTab("signin");
                  setErrorMsg("");
                }}
                className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === "signin"
                    ? "border-niyam-accent text-niyam-accent"
                    : "border-transparent text-niyam-secondary hover:text-niyam-text"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setActiveTab("recovery");
                  setErrorMsg("");
                }}
                className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === "recovery"
                    ? "border-niyam-accent text-niyam-accent"
                    : "border-transparent text-niyam-secondary hover:text-niyam-text"
                }`}
              >
                Account Recovery
              </button>
            </div>
          )}

          {errorMsg && (
            <div
              className="mb-4 p-3 bg-semantic-errorBg border border-semantic-errorBorder rounded text-semantic-error text-xs flex items-center gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* State 1: Primary Sign In */}
          {activeTab === "signin" && !showMFA && (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-niyam-text block mb-1">
                  User ID / AICTE Permanent ID
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
                  placeholder="e.g. applicant or officer"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-niyam-text">Password</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab("recovery")}
                    className="text-xs text-niyam-accent hover:underline"
                  >
                    Forgot credentials?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
                  placeholder="Enter password"
                  required
                />
                <span className="text-xs text-niyam-secondary mt-1 block font-mono">
                  Synthetic test password: <span className="font-semibold text-slate-700">password123</span>
                </span>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  className="w-full"
                  isLoading={submitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Workspace
                </Button>
              </div>

              <p className="text-[11px] text-niyam-secondary text-center mt-3">
                Official regulatory accounts (Scrutiny Officers & Authorities) require mandatory two-factor authentication.
              </p>
            </form>
          )}

          {/* State 2: Official User MFA Step */}
          {showMFA && (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="text-center py-2">
                <div className="w-10 h-10 rounded-full bg-niyam-accentLight text-niyam-accent mx-auto flex items-center justify-center mb-2">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-niyam-text">
                  Official Two-Factor Authentication
                </h3>
                <p className="text-xs text-niyam-secondary mt-1">
                  Enter the 6-digit TOTP code from your registered authenticator application for <span className="font-semibold text-niyam-text">{username}</span>.
                </p>
              </div>

              {/* 6 Digit Box */}
              <div className="flex justify-center gap-2 py-2">
                {mfaCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`mfa-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleMfaDigitChange(idx, e.target.value)}
                    className="w-11 h-12 text-center font-mono font-bold text-lg border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-niyam-secondary px-1">
                <span>
                  Resend code in <strong className="font-mono text-niyam-text">{mfaTimer}s</strong>
                </span>
                <button
                  type="button"
                  disabled={mfaTimer > 0}
                  onClick={() => setMfaTimer(30)}
                  className="text-niyam-accent hover:underline disabled:opacity-40"
                >
                  Resend Code
                </button>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setShowMFA(false)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1"
                  isLoading={submitting}
                  rightIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Verify & Access
                </Button>
              </div>

              <div className="p-2.5 bg-blue-50/60 rounded border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Demo auto-filled code: <code className="font-mono font-bold">528901</code>. Statutory officer sessions are cryptographically logged with IP and role signature.
                </span>
              </div>
            </form>
          )}

          {/* State 3: Account Recovery */}
          {activeTab === "recovery" && !showMFA && (
            <div className="space-y-4">
              {recoverySent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-semantic-successBg text-semantic-success mx-auto flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-niyam-text">
                    Recovery Instructions Dispatched
                  </h3>
                  <p className="text-xs text-niyam-secondary max-w-sm mx-auto mt-2 leading-relaxed">
                    If an institutional or regulatory record exists for <strong className="text-niyam-text">{recoveryEmail}</strong>, an authorized reset link has been dispatched with a 15-minute expiry token.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-6"
                    onClick={() => {
                      setRecoverySent(false);
                      setActiveTab("signin");
                    }}
                  >
                    Return to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRecoverySubmit} className="space-y-4">
                  <div className="text-xs text-niyam-secondary leading-relaxed">
                    Institutional users must provide their registered head-of-institution email address. Official regulators must use their authorized <code className="font-mono text-slate-700">@gov.in</code> or <code className="font-mono text-slate-700">@aicte-india.org</code> address.
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-niyam-text block mb-1">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
                      placeholder="principal@institution.edu.in"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      size="md"
                      variant="primary"
                      className="w-full"
                      leftIcon={<Mail className="w-4 h-4" />}
                    >
                      Request Recovery Token
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* 1-Click Persona Demonstrator */}
        <div className="md:col-span-5 bg-slate-50/80 rounded-lg border border-niyam-border p-6 shadow-subtle space-y-4">
          <div>
            <h2 className="text-sm font-bold text-niyam-text flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-niyam-accent" />
              <span>Instant Persona Switcher</span>
            </h2>
            <p className="text-xs text-niyam-secondary mt-1">
              Select an authorized role to test server-enforced access boundaries and workflows.
            </p>
          </div>

          <div className="space-y-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.username}
                onClick={() => handleQuickDemoSelect(acc.username)}
                className="w-full text-left p-3 rounded-md bg-white hover:bg-niyam-accentLight/30 border border-niyam-border hover:border-niyam-accent transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-niyam-text group-hover:text-niyam-accent">
                    {acc.role_title}{" "}
                    <span className="font-mono font-normal text-niyam-secondary text-[11px]">
                      ({acc.username})
                    </span>
                  </div>
                  <div className="text-[11px] text-niyam-secondary">
                    {acc.name} — {acc.organization}
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-niyam-accent bg-niyam-accentLight px-2 py-0.5 rounded border border-niyam-accentMuted flex-shrink-0">
                  Select
                </span>
              </button>
            ))}
          </div>

          <div className="p-3 bg-white rounded border border-niyam-border text-[11px] text-niyam-secondary space-y-1">
            <strong className="text-niyam-text block">Zero-Trust Institutional Isolation:</strong>
            Institution applicants can strictly read and modify only their own institutional records. Cross-institution access returns <code className="font-mono text-semantic-error">403 Forbidden</code> at the API layer.
          </div>
        </div>
      </div>
    </div>
  );
}
