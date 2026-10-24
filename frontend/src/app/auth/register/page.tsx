"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, CheckCircle2, AlertCircle, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [aictePermanentId, setAictePermanentId] = useState("");
  const [designation, setDesignation] = useState("Authorized Institutional Representative");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!aictePermanentId.trim()) {
      setErrorMsg("AICTE Permanent Institute ID is required for institutional onboarding.");
      return;
    }

    setLoading(true);
    try {
      // Supabase Auth sign up
      // Note: User metadata specifies aicte_permanent_id and fullName.
      // Database trigger automatically forces role = 'applicant'.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: email.split("@")[0],
            aicte_permanent_id: aictePermanentId.trim(),
            designation: designation,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create institutional account. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded bg-[#167D8D] flex items-center justify-center text-white font-mono font-bold text-lg">
            N
          </div>
          <span className="text-xl font-bold tracking-tight text-[#17212B]">NIYAM</span>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#17212B]">
          Institutional Representative Registration
        </h2>
        <p className="mt-1 text-center text-xs text-[#526170]">
          Create a verified applicant account for technical institution approval submissions.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#DCE3E9] rounded-lg sm:px-10">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#17212B]">Registration Initiated</h3>
              <p className="text-xs text-[#526170] mt-2 leading-relaxed">
                A verification link has been dispatched to <strong className="text-[#17212B]">{email}</strong>. 
                Please confirm your official email to activate regulatory portal access.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="w-full inline-flex justify-center items-center h-10 px-4 bg-[#167D8D] hover:bg-[#126875] text-white text-xs font-semibold rounded transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Security Boundary Notice */}
              <div className="p-3 rounded bg-slate-50 border border-[#DCE3E9] text-[11px] text-[#526170] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#167D8D] mt-0.5" />
                <span>
                  Self-registration grants <strong>Institutional Applicant</strong> permissions only. Regulatory scrutiny and audit roles require official AICTE Bureau administrative appointment.
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#17212B] mb-1">
                  AICTE Permanent Institute ID *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={aictePermanentId}
                    onChange={(e) => setAictePermanentId(e.target.value)}
                    placeholder="e.g. 1-492048123"
                    className="w-full h-10 px-3 pl-9 font-mono rounded border border-[#DCE3E9] text-sm text-[#17212B] placeholder:text-[#526170]/60 focus:outline-none focus:ring-1 focus:ring-[#167D8D] focus:border-[#167D8D]"
                  />
                  <Building2 className="w-4 h-4 text-[#526170] absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#17212B] mb-1">
                  Representative Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Rajeshwari Sharma"
                    autoComplete="name"
                    className="w-full h-10 px-3 pl-9 rounded border border-[#DCE3E9] text-sm text-[#17212B] placeholder:text-[#526170]/60 focus:outline-none focus:ring-1 focus:ring-[#167D8D] focus:border-[#167D8D]"
                  />
                  <User className="w-4 h-4 text-[#526170] absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#17212B] mb-1">
                  Official Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="registrar@institution.edu.in"
                    autoComplete="email"
                    className="w-full h-10 px-3 pl-9 rounded border border-[#DCE3E9] text-sm text-[#17212B] placeholder:text-[#526170]/60 focus:outline-none focus:ring-1 focus:ring-[#167D8D] focus:border-[#167D8D]"
                  />
                  <Mail className="w-4 h-4 text-[#526170] absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#17212B] mb-1">
                  Designation / Capacity
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Principal / Registrar"
                  className="w-full h-10 px-3 rounded border border-[#DCE3E9] text-sm text-[#17212B] placeholder:text-[#526170]/60 focus:outline-none focus:ring-1 focus:ring-[#167D8D] focus:border-[#167D8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#17212B] mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    className="w-full h-10 px-3 pr-10 rounded border border-[#DCE3E9] text-sm text-[#17212B] placeholder:text-[#526170]/60 focus:outline-none focus:ring-1 focus:ring-[#167D8D] focus:border-[#167D8D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#526170] hover:text-[#17212B]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#17212B] mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  className="w-full h-10 px-3 rounded border border-[#DCE3E9] text-sm text-[#17212B] placeholder:text-[#526170]/60 focus:outline-none focus:ring-1 focus:ring-[#167D8D] focus:border-[#167D8D]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-2 bg-[#167D8D] hover:bg-[#126875] text-white text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "Registering..." : "Complete Registration"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-[#526170]">Already registered? </span>
                <Link
                  href="/login"
                  className="text-xs text-[#167D8D] hover:underline font-semibold"
                >
                  Sign in here
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
