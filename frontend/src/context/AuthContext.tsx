"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { getRoleHome, UserRole } from "@/lib/roles";

export interface User {
  id: number;
  auth_user_id?: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  institution_id?: number | null;
  institution_name?: string | null;
  designation?: string | null;
  mfa_enrolled?: boolean;
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
  login: (username: string, password?: string) => Promise<{ mfaRequired?: boolean; sessionToken?: string; user?: User }>;
  verifyMfa: (code: string, sessionToken?: string) => Promise<User>;
  logout: () => Promise<void>;
  getRoleRedirect: (role?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(null);

  const supabase = createClient();

  // Validate session on mount via GET /auth/me
  useEffect(() => {
    let mounted = true;

    const validateSession = async () => {
      try {
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("aicte_token") : null;
        if (!storedToken) {
          if (mounted) {
            setUser(null);
            setToken(null);
            setIsLoading(false);
          }
          return;
        }

        // Validate token with backend GET /auth/me
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const profile = await res.json();
          if (mounted) {
            setUser(profile);
            setToken(storedToken);
            localStorage.setItem("aicte_user", JSON.stringify(profile));
          }
        } else {
          // Token is invalid or expired
          if (mounted) {
            setUser(null);
            setToken(null);
            localStorage.removeItem("aicte_token");
            localStorage.removeItem("aicte_user");
          }
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("aicte_token");
          localStorage.removeItem("aicte_user");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    validateSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (username: string, password = "") => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid username or password");
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

  const verifyMfa = async (code: string, sessionToken?: string): Promise<User> => {
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
        throw new Error(err.detail || "Invalid MFA verification code or expired session.");
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

  const logout = async () => {
    try {
      const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("aicte_token") : null);
      if (currentToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }).catch(() => {});
      }
      await supabase.auth.signOut().catch(() => {});
    } catch {}

    setToken(null);
    setUser(null);
    setCurrentSessionToken(null);
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.replace("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        verifyMfa,
        logout,
        getRoleRedirect: getRoleHome,
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
