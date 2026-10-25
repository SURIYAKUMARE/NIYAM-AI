"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { StateFeedback } from "@/components/ui/StateFeedback";
import {
  Users,
  Shield,
  UserCheck,
  Lock,
  RefreshCw,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Building2,
  KeyRound,
  ShieldCheck,
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

  // Role Edit Modal
  const [editUser, setEditUser] = useState<any | null>(null);
  const [targetRole, setTargetRole] = useState("scrutiny_officer");
  const [isActive, setIsActive] = useState(true);
  const [savingUser, setSavingUser] = useState(false);

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

  const handleOpenEdit = (target: any) => {
    setEditUser(target);
    setTargetRole(target.role);
    setIsActive(target.is_active);
  };

  const handleSaveUserRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSavingUser(true);
    try {
      await fetchApi(`/users/${editUser.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({
          role: targetRole,
          is_active: isActive,
        }),
      });
      setEditUser(null);
      loadUsersAndApps();
    } catch (err: any) {
      alert(`Role update error: ${err.message}`);
    } finally {
      setSavingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
              Administration Workspace
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Welcome, <strong className="text-slate-900 dark:text-white">{user?.full_name || "Administrator"}</strong> ({user?.role || "admin"})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            National Informatics &amp; Infrastructure Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Manage institutional user accounts, APH compliance rule engines, system parameters, and scrutiny officer distribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
          <Link
            href="/admin/rules"
            className="px-3 py-1.5 text-xs font-semibold text-[#14202B] bg-white hover:bg-[#F7F9FB] border border-[#E3E8EE] rounded-lg transition-colors"
          >
            Rules &amp; Checklists
          </Link>
          <Link
            href="/admin/settings"
            className="px-3 py-1.5 text-xs font-semibold text-[#14202B] bg-white hover:bg-[#F7F9FB] border border-[#E3E8EE] rounded-lg transition-colors"
          >
            Settings
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadUsersAndApps}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAssignModalOpen(true)}
            leftIcon={<UserCheck className="w-3.5 h-3.5" />}
          >
            Assign Officer
          </Button>
        </div>
      </div>

      {/* Role Boundary Enforcement Card */}
      <div className="bg-slate-50 border border-niyam-border p-4 rounded-lg text-xs sm:text-sm text-niyam-secondary flex items-start gap-3 shadow-subtle">
        <Lock className="w-5 h-5 text-niyam-accent flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-niyam-text font-bold block mb-0.5">
            Strict Zero-Trust Role Boundaries:
          </strong>
          Administrators maintain authority over user provisioning and application dispatch. Institution applicants access exclusively their own college records. Scrutiny officers access assigned regional cases. Statutory decisions are reserved strictly for Competent Authorities.
        </div>
      </div>

      {/* Users Table */}
      <Card
        padding="none"
        title={`Registered System Users & Role Profiles (${usersList.length})`}
        subtitle="Cryptographically verified accounts with JWT claim enforcement"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-niyam-secondary font-semibold border-b border-niyam-border">
              <tr>
                <th className="px-4 py-3">User & Contact</th>
                <th className="px-4 py-3">Server-Enforced Role</th>
                <th className="px-4 py-3">Bureau / Designation</th>
                <th className="px-4 py-3">Institutional Affiliation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-niyam-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-niyam-secondary">
                    Loading system users...
                  </td>
                </tr>
              ) : (
                usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-niyam-text">{u.full_name}</div>
                      <div className="font-mono text-niyam-secondary text-xs">
                        {u.username} • {u.email}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-niyam-border capitalize inline-block">
                        {u.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-niyam-text">
                      {u.designation || "AICTE Regulation Bureau"}
                    </td>
                    <td className="px-4 py-3.5 text-niyam-secondary">
                      {u.institution_id ? (
                        <span className="text-niyam-accent font-semibold flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Apex Institute (inst-101)</span>
                        </span>
                      ) : (
                        <span className="font-mono text-xs">Regulation Bureau HQ</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEdit(u)}
                      >
                        Modify Role
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modify Role Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-niyam-border max-w-md w-full p-6 shadow-dialog space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-niyam-text">
                Modify Role & Privileges: {editUser.full_name}
              </h3>
              <p className="text-xs text-niyam-secondary mt-0.5 font-mono">
                Username: {editUser.username} | User ID: #{editUser.id}
              </p>
            </div>

            <form onSubmit={handleSaveUserRole} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-niyam-text block mb-1">
                  Assigned Statutory Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
                >
                  <option value="applicant">Institution Applicant (Colleges)</option>
                  <option value="scrutiny_officer">Scrutiny Officer (Evaluation)</option>
                  <option value="supervising_authority">Competent Authority (Statutory Mandate)</option>
                  <option value="admin">System Administrator (Platform Ops)</option>
                  <option value="auditor">Statutory Auditor (Read-Only Traceability)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="active-toggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-niyam-accent rounded border-niyam-border focus:ring-niyam-accent"
                />
                <label htmlFor="active-toggle" className="text-xs text-niyam-text font-semibold cursor-pointer">
                  Account Active and Permitted Access
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-niyam-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={savingUser}
                >
                  Update Privileges
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-niyam-border max-w-md w-full p-6 shadow-dialog space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-niyam-text">
                Assign Scrutiny Officer to Application
              </h3>
              <p className="text-xs text-niyam-secondary mt-0.5">
                Distribute institutional dossiers for official regulatory scrutiny.
              </p>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-niyam-text block mb-1">
                  Select Institutional Application
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.application_number} — {app.institution?.name || "Apex Institute"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-niyam-text block mb-1">
                  Assign to Authorized Scrutiny Officer
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-niyam-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent text-niyam-text bg-white"
                >
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.full_name} ({o.username}) — {o.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-niyam-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAssignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Confirm Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
