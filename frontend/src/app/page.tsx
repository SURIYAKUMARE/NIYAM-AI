"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getRoleHome } from "@/lib/roles";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace(getRoleHome(user.role));
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-[#0F6B6B] flex items-center justify-center text-white font-extrabold shadow-md animate-pulse">
        <span>NY</span>
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold text-[#5B6B7A]">
        <div className="w-3.5 h-3.5 border-2 border-[#0F6B6B] border-t-transparent rounded-full animate-spin" />
        <span>Redirecting to authorized portal...</span>
      </div>
    </div>
  );
}
