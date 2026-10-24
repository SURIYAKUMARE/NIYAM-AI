"use client";

import React, { useState } from "react";
import { useAuth, DEMO_SCENARIOS } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { PlayCircle, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export const DemoScenarioBar: React.FC = () => {
  const { activeScenario, setActiveScenario, switchRole, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSelectScenario = async (scenario: typeof DEMO_SCENARIOS[0]) => {
    setActiveScenario(scenario.num);
    // If user is currently applicant and views an application outside their inst, automatically switch to officer to inspect
    if (user?.role === "applicant" && (scenario.num === 2 || scenario.num === 3 || scenario.num === 5 || scenario.num === 8)) {
      await switchRole("officer");
    }
    // Route to application detail
    router.push(`/applications/${scenario.num}`);
  };

  const currentScenarioObj = DEMO_SCENARIOS.find((s) => s.num === activeScenario);

  return (
    <div className="bg-navy-900 border-b border-navy-800 text-white text-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500 text-white tracking-wide uppercase">
            Synthetic Demo Mode
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Official Evaluation Scenarios:
          </span>
          <span className="text-slate-100 font-medium truncate max-w-[140px] sm:max-w-none">
            {currentScenarioObj ? currentScenarioObj.title : "Select Scenario (1 to 9)"}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-navy-850 hover:bg-navy-800 text-slate-200 border border-slate-700 transition"
            aria-expanded={isOpen}
          >
            <PlayCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="truncate">Scenarios ({DEMO_SCENARIOS.length})</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="bg-navy-950 border-t border-navy-800 p-4 transition-all">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="font-semibold text-slate-200">
                Niyam Validation & Scrutiny Test Scenarios (Section 10 & 16 Specification)
              </span>
              <span className="text-slate-400 text-[11px]">
                Click any scenario to immediately load simulated evidence & findings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {DEMO_SCENARIOS.map((s) => {
                const isActive = activeScenario === s.num;
                return (
                  <button
                    key={s.num}
                    onClick={() => {
                      handleSelectScenario(s);
                      setIsOpen(false);
                    }}
                    className={`text-left p-2.5 rounded border transition flex flex-col justify-between ${
                      isActive
                        ? "bg-navy-850 border-blue-500 ring-1 ring-blue-500"
                        : "bg-navy-900 border-slate-800 hover:border-slate-700 hover:bg-navy-850"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 w-full mb-1">
                      <span className="font-medium text-slate-100 text-xs leading-snug">
                        {s.title}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${s.tagColor}`}>
                        {s.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {s.description}
                    </p>
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
