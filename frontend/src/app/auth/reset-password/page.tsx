"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
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

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded bg-[#167D8D] flex items-center justify-center text-white font-mono font-bold text-lg">
            N
          </div>
          <span className="text-xl font-bold tracking-tight text-[#17212B]">NIYAM</span>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#17212B]">
          Set new regulatory account password
        </h2>
        <p className="mt-2 text-center text-xs text-[#526170]">
          Please establish a secure password for your verified institutional credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#DCE3E9] rounded-lg sm:px-10">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#17212B]">Password updated successfully</h3>
              <p className="text-xs text-[#526170] mt-1">
                Your credentials have been securely updated. Redirecting to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#17212B] mb-1">
                  New Password
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
                    className="absolute right-3 top-2.5 text-[#526170] hover:text-[#17212B] focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#17212B] mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  className="w-full h-10 px-3 rounded border border-[#DCE3E9] text-sm text-[#17212B] placeholder:text-[#526170]/60 focus:outline-none focus:ring-1 focus:ring-[#167D8D] focus:border-[#167D8D]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-2 bg-[#167D8D] hover:bg-[#126875] text-white text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Password"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-[#167D8D] hover:underline font-medium"
                >
                  Return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
