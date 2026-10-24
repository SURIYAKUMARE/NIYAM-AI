"use client";

import React, { useState } from "react";
import { useAuth, DEMO_SCENARIOS } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { PlayCircle, ChevronDown, ChevronUp, CheckCircle2, ShieldAlert } from "lucide-react";

export const DemoScenarioBar: React.FC = () => {
  const { activeScenario, setActiveScenario, switchRole, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Hide entirely on login or auth pages
  if (pathname === "/login" || pathname.startsWith("/auth")) {
    return null;
  }

  const handleSelectScenario = async (scenario: (typeof DEMO_SCENARIOS)[0]) => {
    setActiveScenario(scenario.num);
    if (
      user?.role === "applicant" &&
      (scenario.num === 2 || scenario.num === 3 || scenario.num === 5 || scenario.num === 8)
    ) {
      await switchRole("officer");
    }
    router.push(`/applications/${scenario.num}`);
  };

  const currentScenarioObj = DEMO_SCENARIOS.find((s) => s.num === activeScenario);

  return (
    <div className="no-print bg-[#F7F9FB] border-b border-[#E3E8EE] text-[#14202B] text-xs">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#0F6B6B] text-white tracking-wide uppercase shadow-xs">
            Evaluation Suite
          </span>
          <span className="text-[#5B6B7A] hidden sm:inline text-xs">
            Statutory Test Scenarios:
          </span>
          <span className="text-[#14202B] font-semibold truncate max-w-[140px] sm:max-w-none text-xs">
            {currentScenarioObj ? currentScenarioObj.title : "Select Evaluator Scenario (1 to 9)"}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#F7F9FB] text-[#14202B] border border-[#E3E8EE] transition shadow-xs text-xs font-medium"
            aria-expanded={isOpen}
          >
            <PlayCircle className="w-3.5 h-3.5 text-[#0F6B6B] flex-shrink-0" />
            <span className="truncate">Scenarios ({DEMO_SCENARIOS.length})</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />}
          </button>
        </div>
      </div>

      {/* Expanded Scenario Grid */}
      {isOpen && (
        <div className="border-t border-[#E3E8EE] bg-white p-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-[11px] font-semibold text-[#5B6B7A] uppercase tracking-wider mb-2">
              Select AICTE Statutory Scenarios to Inspect Real Processing Outcomes:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {DEMO_SCENARIOS.map((s) => {
                const isSelected = activeScenario === s.num;
                return (
                  <button
                    key={s.num}
                    onClick={() => {
                      handleSelectScenario(s);
                      setIsOpen(false);
                    }}
                    className={`text-left p-2.5 rounded-lg border transition text-xs ${
                      isSelected
                        ? "bg-teal-50/70 border-[#0F6B6B] shadow-xs"
                        : "bg-white border-[#E3E8EE] hover:bg-[#F7F9FB] hover:border-[#0F6B6B]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-[#14202B] truncate">{s.title}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${s.tagColor}`}>
                        {s.tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5B6B7A] line-clamp-2 leading-relaxed">
                      {s.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
