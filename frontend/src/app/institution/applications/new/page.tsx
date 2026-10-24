"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  PlusCircle,
  CheckCircle,
  FileText,
  Building,
  Layers,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check
} from "lucide-react";

export default function NewApplicationWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  // Form State
  const [categoryCode, setCategoryCode] = useState("EXTENSION_OF_APPROVAL");
  const [academicYear, setAcademicYear] = useState("2025-26");
  const [notes, setNotes] = useState("");
  const [programmes, setProgrammes] = useState([
    { name: "Computer Science & Engineering", intake: 120, faculty_count: 8 },
    { name: "Artificial Intelligence & Machine Learning", intake: 60, faculty_count: 4 },
  ]);
  const [newProgName, setNewProgName] = useState("");
  const [newProgIntake, setNewProgIntake] = useState(60);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    {
      code: "EXTENSION_OF_APPROVAL",
      title: "Extension of Approval (EoA)",
      desc: "Annual continuation of existing technical courses and approved intake.",
      checklistCount: 6,
    },
    {
      code: "INCREASE_IN_INTAKE",
      title: "Increase in Intake / Additional Course",
      desc: "Expansion of approved intake or introduction of new emerging engineering branches.",
      checklistCount: 7,
    },
    {
      code: "NEW_INSTITUTION",
      title: "Establishment of New Technical Institution",
      desc: "Fresh Letter of Intent (LoI) and Letter of Approval (LoA) for starting new colleges.",
      checklistCount: 9,
    },
    {
      code: "CHANGE_OF_SITE",
      title: "Change of Site / Relocation",
      desc: "Transfer of approved campus infrastructure to an alternative municipal sanctioned land parcel.",
      checklistCount: 8,
    },
  ];

  const handleAddProgramme = () => {
    if (!newProgName.trim()) return;
    setProgrammes([
      ...programmes,
      {
        name: newProgName.trim(),
        intake: Number(newProgIntake) || 60,
        faculty_count: Math.ceil((Number(newProgIntake) || 60) / 15),
      },
    ]);
    setNewProgName("");
    setNewProgIntake(60);
  };

  const handleRemoveProgramme = (idx: number) => {
    setProgrammes(programmes.filter((_, i) => i !== idx));
  };

  const handleCreateApplication = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetchApi("/applications", {
        method: "POST",
        body: JSON.stringify({
          category_code: categoryCode,
          academic_year: academicYear,
          approved_programmes: programmes,
          notes: notes.trim() || undefined,
        }),
      });
      router.push(`/applications/${res.id}`);
    } catch (err: any) {
      alert(`Error creating application: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Wizard Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Application Submission Wizard
          </span>
          <span className="text-xs text-slate-500">Step {step} of 3</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-1">
          Initiate New Regulatory Approval Application
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Select category, configure courses/intake, and verify applicable statutory checklist items
        </p>
      </div>

      {/* Steps Progress */}
      <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-4 text-xs font-semibold">
        <div className={`p-2.5 rounded flex items-center space-x-2 ${step >= 1 ? "bg-navy-900 text-white" : "bg-slate-100 text-slate-500"}`}>
          <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">1</span>
          <span>Category & Year</span>
        </div>
        <div className={`p-2.5 rounded flex items-center space-x-2 ${step >= 2 ? "bg-navy-900 text-white" : "bg-slate-100 text-slate-500"}`}>
          <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">2</span>
          <span>Programmes & Intake</span>
        </div>
        <div className={`p-2.5 rounded flex items-center space-x-2 ${step >= 3 ? "bg-navy-900 text-white" : "bg-slate-100 text-slate-500"}`}>
          <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">3</span>
          <span>Checklist & Launch</span>
        </div>
      </div>

      {/* Step 1: Category & Academic Year */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Select Regulatory Application Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((c) => {
              const isSelected = categoryCode === c.code;
              return (
                <div
                  key={c.code}
                  onClick={() => setCategoryCode(c.code)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/40 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{c.title}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.desc}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Applicable Checklist Items: {c.checklistCount}</span>
                    <span className="text-blue-600 font-semibold">{isSelected ? "Selected" : "Select"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Approval Academic Session
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="2025-26">Academic Year 2025-26 (Current)</option>
                <option value="2026-27">Academic Year 2026-27 (Advance)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Application Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="e.g., Annual Renewal with NBA accredited CSE course"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2 bg-navy-900 text-white rounded text-xs font-medium hover:bg-navy-850 transition flex items-center space-x-1.5"
            >
              <span>Continue to Course Configuration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Programmes & Approved Intake */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Configure Approved Engineering Programmes & Intake
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Faculty cadre ratios and laboratory norms will be calibrated against configured intake
              </p>
            </div>
          </div>

          {/* Table of configured courses */}
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Programme / Course Title</th>
                  <th className="px-4 py-2.5">Sanctioned Intake</th>
                  <th className="px-4 py-2.5">Cadre Faculty (1:15)</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programmes.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">{p.intake} seats</td>
                    <td className="px-4 py-3 text-slate-600">{p.faculty_count} Required</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemoveProgramme(idx)}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Course Row */}
          <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Add Additional Course</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newProgName}
                  onChange={(e) => setNewProgName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Mechanical & Automation Engineering"
                />
              </div>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={newProgIntake}
                  onChange={(e) => setNewProgIntake(Number(e.target.value))}
                  className="w-24 text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Intake"
                />
                <button
                  type="button"
                  onClick={handleAddProgramme}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition"
                >
                  Add Course
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-100 transition flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2 bg-navy-900 text-white rounded text-xs font-medium hover:bg-navy-850 transition flex items-center space-x-1.5"
            >
              <span>Review Checklist Requirements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Checklist & Launch */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Checklist & Application Confirmation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review required documents automatically calibrated under Rule Set v2025.1
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Application Summary</span>
              <div className="flex justify-between text-slate-600">
                <span>Category:</span>
                <strong className="text-slate-800 capitalize">{categoryCode.replace(/_/g, " ")}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Academic Session:</span>
                <strong className="text-slate-800">{academicYear}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Courses:</span>
                <strong className="text-slate-800">{programmes.length} Programmes</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Intake:</span>
                <strong className="text-slate-800">
                  {programmes.reduce((sum, p) => sum + p.intake, 0)} Seats
                </strong>
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 rounded border border-blue-200 space-y-2">
              <span className="font-bold text-blue-900 block">Mandatory Checklist Preview</span>
              <ul className="space-y-1.5 text-blue-800 text-[11px]">
                <li className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Previous Year AICTE Extension of Approval (EoA)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Fire & Life Safety Clearance NOC</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Registered Land Ownership Sale / Lease Deed</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Sanctioned Architectural Building Floor Plan</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Affiliating University Provisional NOC</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>TER Electronic Fee Payment Receipt</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-100 transition flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleCreateApplication}
              className="px-6 py-2 bg-navy-900 text-white rounded text-xs font-semibold hover:bg-navy-850 transition shadow-sm"
            >
              {isSubmitting ? "Initiating Application..." : "Create Application & Open Checklist"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
