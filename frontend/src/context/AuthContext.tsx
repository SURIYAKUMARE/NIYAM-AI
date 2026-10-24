"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL, fetchApi } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

export interface User {
  id: number;
  auth_user_id?: string;
  username: string;
  email: string;
  full_name: string;
  role: "applicant" | "scrutiny_officer" | "supervising_authority" | "admin" | "auditor";
  institution_id?: number | null;
  institution_name?: string | null;
  designation?: string | null;
  mfa_enrolled?: boolean;
}

export interface DemoAccount {
  username: string;
  role: string;
  role_title: string;
  name: string;
  organization: string;
  description: string;
}

export interface MfaChallengeState {
  required: boolean;
  factorId?: string;
  sessionToken?: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  demoAccounts: DemoAccount[];
  login: (emailOrUsername: string, password?: string) => Promise<{ mfaRequired?: boolean; sessionToken?: string; user?: User }>;
  verifyMfa: (code: string, sessionToken?: string) => Promise<User | void>;
  switchRole: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  activeScenario: number | null;
  setActiveScenario: (scenarioNum: number | null) => void;
  getRoleRedirect: (role?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_SCENARIOS = [
  {
    num: 1,
    appNumber: "AICTE-2025-APP-001",
    title: "1. Complete Application (Fully Verified)",
    category: "Extension of Approval",
    tag: "Passed",
    tagColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "All statutory documents uploaded, valid, authenticated via DigiLocker and Bharatkosh."
  },
  {
    num: 2,
    appNumber: "AICTE-2025-APP-002",
    title: "2. Missing Mandatory Document",
    category: "Extension of Approval",
    tag: "Missing Doc",
    tagColor: "bg-rose-100 text-rose-800 border-rose-300",
    description: "Municipal Sanctioned Building Plan (DOC-BUILDING-PLAN) missing from checklist."
  },
  {
    num: 3,
    appNumber: "AICTE-2025-APP-003",
    title: "3. Expired Safety Certificate",
    category: "Extension of Approval",
    tag: "Expired NOC",
    tagColor: "bg-rose-100 text-rose-800 border-rose-300",
    description: "Fire & Life Safety NOC expired on 31-Mar-2024. Advisory deficiency flagged."
  },
  {
    num: 4,
    appNumber: "AICTE-2025-APP-004",
    title: "4. Cross-Document Entity Mismatch",
    category: "Increase in Intake",
    tag: "Entity Conflict",
    tagColor: "bg-amber-100 text-amber-800 border-amber-300",
    description: "Land Deed registered to commercial developer instead of applicant sponsoring society."
  },
  {
    num: 5,
    appNumber: "AICTE-2025-APP-005",
    title: "5. Exact Duplicate Document (SHA-256)",
    category: "New Institution",
    tag: "Hash Collision",
    tagColor: "bg-purple-100 text-purple-800 border-purple-300",
    description: "Cryptographic hash match detected with a document uploaded by another institution."
  },
  {
    num: 6,
    appNumber: "AICTE-2025-APP-006",
    title: "6. Low-Confidence OCR Extraction",
    category: "Extension of Approval",
    tag: "Low OCR Conf",
    tagColor: "bg-blue-100 text-blue-800 border-blue-300",
    description: "Scanned fax artifact has 45% OCR confidence. Flagged for human review and correction."
  },
  {
    num: 7,
    appNumber: "AICTE-2025-APP-007",
    title: "7. External Source Outage",
    category: "Extension of Approval",
    tag: "Source 504",
    tagColor: "bg-slate-100 text-slate-800 border-slate-300",
    description: "DigiLocker returned 504 Gateway Timeout. Document not rejected; queued for retry."
  },
  {
    num: 8,
    appNumber: "AICTE-2025-APP-008",
    title: "8. Infrastructure Discrepancy",
    category: "Increase in Intake",
    tag: "Physical Inspection",
    tagColor: "bg-amber-100 text-amber-800 border-amber-300",
    description: "Computer Vision detected 42 terminals vs 90 reported. Physical inspection flagged."
  },
  {
    num: 9,
    appNumber: "AICTE-2025-APP-009",
    title: "9. Corrected & Resubmitted Application",
    category: "Extension of Approval",
    tag: "Rectified V2",
    tagColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "Applicant uploaded Version 2 (Renewed Fire Safety NOC). Clear audit trail preserved."
  }
];

export function getRoleRedirect(role?: string): string {
  switch (role) {
    case "applicant":
      return "/institution/dashboard";
    case "scrutiny_officer":
      return "/officer/queue";
    case "supervising_authority":
      return "/authority/dashboard";
    case "admin":
      return "/admin/rules";
    case "auditor":
      return "/auditor/logs";
    default:
      return "/institution/dashboard";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // 1. Fetch demo personas for quick auditor switching
    fetch(`${API_BASE_URL}/auth/demo-accounts`)
      .then((res) => res.json())
      .then((data) => setDemoAccounts(data))
      .catch(() => {});

    // 2. Check for active Supabase Auth session
    const checkSupabaseSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setToken(session.access_token);
          // Query user profile
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("auth_user_id", session.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              auth_user_id: session.user.id,
              username: profile.username,
              email: profile.email,
              full_name: profile.full_name,
              role: profile.role,
              institution_id: profile.institution_id,
              designation: profile.designation,
              mfa_enrolled: profile.mfa_enrolled,
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fallback to backend session check
      }

      // 3. Fallback: Check backend session from cookies / local session storage
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("aicte_token") : null;
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("aicte_user") : null;
      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {}
      }
      setIsLoading(false);
    };

    checkSupabaseSession();

    // 4. Supabase Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setToken(session.access_token);
        try {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("auth_user_id", session.user.id)
            .single();
          if (profile) {
            setUser({
              id: profile.id,
              auth_user_id: session.user.id,
              username: profile.username,
              email: profile.email,
              full_name: profile.full_name,
              role: profile.role,
              institution_id: profile.institution_id,
              designation: profile.designation,
              mfa_enrolled: profile.mfa_enrolled,
            });
          }
        } catch (err) {}
      } else if (event === "SIGNED_OUT") {
        setToken(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (emailOrUsername: string, password = "password123") => {
    setIsLoading(true);
    try {
      // Step A: Attempt Supabase Auth if configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && emailOrUsername.includes("@")) {
        const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
          email: emailOrUsername,
          password,
        });

        if (!supaError && supaData.session) {
          // Check MFA AAL level
          const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (aalData?.nextLevel === "aal2" && aalData.currentLevel !== "aal2") {
            // Official account requires MFA challenge
            return { mfaRequired: true };
          }

          setToken(supaData.session.access_token);
          return { mfaRequired: false };
        }
      }

      // Step B: Authenticate via NIYAM backend API
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: emailOrUsername, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid user credentials. Please check your username and password.");
      }

      const data = await res.json();
      if (data.mfa_required) {
        setCurrentSessionToken(data.mfa_session_token);
        return { mfaRequired: true, sessionToken: data.mfa_session_token, user: data.user };
      }

      setToken(data.access_token);
      setUser(data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("aicte_token", data.access_token);
        localStorage.setItem("aicte_user", JSON.stringify(data.user));
      }
      return { mfaRequired: false, user: data.user };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMfa = async (code: string, sessionToken?: string) => {
    setIsLoading(true);
    try {
      const tokenToUse = sessionToken || currentSessionToken;
      if (!tokenToUse) {
        throw new Error("No active MFA challenge session found. Please sign in again.");
      }

      const res = await fetch(`${API_BASE_URL}/auth/mfa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfa_session_token: tokenToUse, code }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid verification code or expired session.");
      }

      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("aicte_token", data.access_token);
        localStorage.setItem("aicte_user", JSON.stringify(data.user));
      }
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (username: string) => {
    // Quick persona switch for demonstration and audit evaluation
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: "password123" }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.mfa_required) {
        // Complete with demo TOTP secret
        const totpRes = await fetch(`${API_BASE_URL}/auth/mfa/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mfa_session_token: data.mfa_session_token, code: "REC-DEMO-2025" }),
        });
        if (totpRes.ok) {
          const verified = await totpRes.json();
          setToken(verified.access_token);
          setUser(verified.user);
          localStorage.setItem("aicte_token", verified.access_token);
          localStorage.setItem("aicte_user", JSON.stringify(verified.user));
          return;
        }
      }
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("aicte_token", data.access_token);
      localStorage.setItem("aicte_user", JSON.stringify(data.user));
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setToken(null);
    setUser(null);
    setCurrentSessionToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("aicte_token");
      localStorage.removeItem("aicte_user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        demoAccounts,
        login,
        verifyMfa,
        switchRole,
        logout,
        activeScenario,
        setActiveScenario,
        getRoleRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
