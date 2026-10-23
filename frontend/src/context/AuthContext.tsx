"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL, fetchApi } from "@/lib/api";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: "applicant" | "scrutiny_officer" | "supervising_authority" | "admin" | "auditor";
  institution_id?: number | null;
  institution_name?: string | null;
  designation?: string | null;
}

export interface DemoAccount {
  username: string;
  role: string;
  role_title: string;
  name: string;
  organization: string;
  description: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  demoAccounts: DemoAccount[];
  login: (username: string, password?: string) => Promise<void>;
  switchRole: (username: string) => Promise<void>;
  logout: () => void;
  activeScenario: number | null;
  setActiveScenario: (scenarioNum: number | null) => void;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [activeScenario, setActiveScenario] = useState<number | null>(null);

  useEffect(() => {
    // Load demo accounts
    fetch(`${API_BASE_URL}/auth/demo-accounts`)
      .then((res) => res.json())
      .then((data) => setDemoAccounts(data))
      .catch(() => {});

    // Check stored token
    const storedToken = localStorage.getItem("aicte_token");
    const storedUser = localStorage.getItem("aicte_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    } else {
      // Auto-login as Scrutiny Officer by default so user immediately sees rich overview
      login("officer", "password123").catch(() => {});
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password = "password123") => {
    setIsLoading(true);
    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("aicte_token", data.access_token);
      localStorage.setItem("aicte_user", JSON.stringify(data.user));
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (username: string) => {
    await login(username, "password123");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("aicte_token");
    localStorage.removeItem("aicte_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        demoAccounts,
        login,
        switchRole,
        logout,
        activeScenario,
        setActiveScenario,
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
