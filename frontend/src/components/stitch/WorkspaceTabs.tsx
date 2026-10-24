"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ElementType;
}

interface WorkspaceTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const WorkspaceTabs: React.FC<WorkspaceTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-t-xl border border-b-0 border-[#E3E8EE] px-4 pt-1 flex items-center gap-1 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            aria-selected={isActive}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap -mb-px ${
              isActive
                ? "border-[#0F6B6B] text-[#0F6B6B]"
                : "border-transparent text-[#5B6B7A] hover:text-[#14202B] hover:border-[#E3E8EE]"
            }`}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#0F6B6B]" : "text-[#5B6B7A]"}`} />}
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-teal-50 text-[#0F6B6B] border border-teal-200"
                    : "bg-[#F7F9FB] text-[#5B6B7A] border border-[#E3E8EE]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
