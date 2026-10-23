"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserCheck, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login, demoAccounts, isLoading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("officer");
  const [password, setPassword] = useState("password123");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      await login(username, password);
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoSelect = async (demoUsername: string) => {
    setUsername(demoUsername);
    setPassword("password123");
    setSubmitting(true);
    try {
      await login(demoUsername, "password123");
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Error logging into demo account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy-900 text-teal-400 font-bold text-xl mb-3 border border-navy-850 shadow">
          NY
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Niyam — Authentication Gateway
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Server-enforced role-based access for institutions, scrutiny officers, and competent authorities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Login */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Secure Portal Sign-In</span>
          </h2>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Username / AICTE User ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Enter password"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Synthetic demo password: <code className="text-slate-600 font-mono">password123</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-850 text-white font-medium text-xs rounded transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>{submitting ? "Signing In..." : "Sign In to Workspace"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* 1-Click Demo Accounts */}
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-1 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Instant 1-Click Demo Personas</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Select a role below to immediately log in and explore server-enforced role boundaries.
            </p>

            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => handleQuickDemoSelect(acc.username)}
                  className="w-full text-left p-2.5 rounded bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-400 transition flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {acc.role_title} <span className="font-mono font-normal text-slate-400 text-[11px]">({acc.username})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {acc.name} — {acc.organization}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Switch
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-blue-50 rounded border border-blue-200 text-blue-900 text-[11px]">
            <strong>Security Boundary:</strong> Institution applicants are strictly isolated to their own records. Cross-institution access attempts are blocked at the server API layer.
          </div>
        </div>
      </div>
    </div>
  );
}
