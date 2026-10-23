"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Shield,
  UserCheck,
  Lock,
  RefreshCw,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Building2
} from "lucide-react";

export default function UserManagementPage() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Assignment Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number>(1);
  const [selectedOfficerId, setSelectedOfficerId] = useState<number>(2);

  const loadUsersAndApps = async () => {
    setLoading(true);
    try {
      const [usersData, appsData] = await Promise.all([
        fetchApi("/users"),
        fetchApi("/applications"),
      ]);
      setUsersList(usersData);
      setApplications(appsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersAndApps();
  }, []);

  const officers = usersList.filter((u) => u.role === "scrutiny_officer");

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi("/users/assign-officer", {
        method: "POST",
        body: JSON.stringify({
          application_id: Number(selectedAppId),
          officer_user_id: Number(selectedOfficerId),
        }),
      });
      alert(res.message);
      setAssignModalOpen(false);
      loadUsersAndApps();
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    }
  };

  const handleToggleUserRole = async (targetUser: any) => {
    const newRole = prompt(
      `Update role for ${targetUser.username} (applicant, scrutiny_officer, supervising_authority, admin, auditor):`,
      targetUser.role
    );
    if (!newRole) return;

    try {
      await fetchApi(`/users/${targetUser.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({
          role: newRole.trim(),
          is_active: targetUser.is_active,
        }),
      });
      alert(`Role updated for ${targetUser.username}.`);
      loadUsersAndApps();
    } catch (err: any) {
      alert(`Role update error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            System Administration
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            User, Role & Assignment Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Server-enforced role assignments, institution affiliations, and scrutiny case distribution
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadUsersAndApps}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setAssignModalOpen(true)}
            className="px-4 py-2 bg-navy-900 hover:bg-navy-850 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Officer to Application</span>
          </button>
        </div>
      </div>

      {/* Privilege Separation Notice */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs text-slate-700 flex items-start space-x-3">
        <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 font-semibold block mb-0.5">Role Boundary Enforcement:</strong>
          Administrators maintain authority over user provisioning, assignments, and rule publication. Institutional data isolation ensures that institution applicants cannot access other colleges&apos; submissions, and administrative accounts do not bypass document privacy protections.
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            System User Accounts & Scrutiny Roles ({usersList.length})
          </h3>
          <span className="text-xs text-slate-500">
            RBAC Enforced via JWT Claims
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">User & Email</th>
              <th className="px-6 py-3">Assigned Role</th>
              <th className="px-6 py-3">Designation / Bureau</th>
              <th className="px-6 py-3">Institutional Affiliation</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Loading system users...
                </td>
              </tr>
            ) : (
              usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3.5">
                    <div className="font-bold text-slate-900">{u.full_name}</div>
                    <div className="font-mono text-slate-400 text-[11px]">{u.username} | {u.email}</div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 capitalize">
                      {u.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-700">
                    {u.designation || "AICTE Official"}
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">
                    {u.institution_id ? (
                      <span className="text-blue-700 font-medium">Apex Institute of Technology</span>
                    ) : (
                      <span className="text-slate-400">Regulatory Oversight Bureau</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleToggleUserRole(u)}
                      className="px-2.5 py-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:bg-blue-50 rounded transition"
                    >
                      Edit Role
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assignment Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden">
            <div className="bg-navy-950 text-white px-6 py-4 flex items-center justify-between border-b border-navy-850">
              <h3 className="text-sm font-bold text-white">Assign Scrutiny Officer</h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Select Institutional Application
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.application_number} — {app.institution?.name || "Institution"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Assign to Authorized Scrutiny Officer
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.full_name} ({o.username}) — {o.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-navy-900 text-white font-medium rounded hover:bg-navy-850 transition"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
