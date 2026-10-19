import { Link } from "react-router-dom";
import {
  Crown,
  Shield,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Briefcase,
  User,
} from "lucide-react";

import { useTeam } from "../Hooks/useTeam";
import { useAuth } from "../context/AuthContext";
import HasPermission from "../components/HasPermission";

function Team() {
  const { members, loading, deleteMember, toggleStatus } = useTeam();
  const { isOwner } = useAuth();

  // 1. حالة التحميل
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[rgb(0,166,62)]" />
          <span className="text-lg font-medium">
            جاري تحميل بيانات الفريق...
          </span>
        </div>
      </div>
    );
  }

  // 2. فصل الـ Owner عن الـ Members
  const owner = members?.find((m) => m.jobTitle === "Owner") || {};
  const teamMembers = members?.filter((m) => m.id !== owner.id) || [];
  const activeCount = teamMembers.filter((m) => m.status === "Active").length;
  const totalCount = teamMembers.length + (owner?.id ? 1 : 0);

  return (
    <div className="space-y-6 p-6">
      {/* Command bar */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] px-8 py-10 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[rgb(0,166,62)]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[rgb(0,166,62)]/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-white/50">Team Management</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Your administrators
            </h1>
            <p className="mt-3 max-w-md text-white/60">
              Who has the keys to the dashboard, and what they're allowed to
              touch.
            </p>
          </div>

          <HasPermission resource="team" action="add">
            <Link
              to="/team/add"
              className="group inline-flex items-center gap-2 rounded-2xl bg-[rgb(0,166,62)] px-6 py-3.5 font-semibold text-white transition-all hover:bg-[rgb(0,145,55)] hover:shadow-lg hover:shadow-[rgb(0,166,62)]/30 active:scale-[0.98]"
            >
              <Plus
                size={18}
                className="transition-transform duration-200 group-hover:rotate-90"
              />
              Add Admin
            </Link>
          </HasPermission>
        </div>

        <div className="relative mt-8 flex flex-wrap gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
            <p className="text-2xl font-bold leading-none">{totalCount}</p>
            <p className="mt-1 text-xs text-white/50">Total members</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
            <p className="text-2xl font-bold leading-none text-[rgb(52,211,130)]">
              {activeCount}
            </p>
            <p className="mt-1 text-xs text-white/50">Active now</p>
          </div>
        </div>
      </div>

      {/* Owner spotlight */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-1">
        <div
          className={!isOwner ? "blur-sm select-none pointer-events-none" : ""}
        >
          <div className="flex flex-col gap-5 rounded-[1.35rem] bg-gradient-to-br from-amber-50 via-white to-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="h-14 w-14 overflow-hidden rounded-2xl border-2 border-white shadow-md ring-1 ring-amber-200">
                  {owner?.avatar ? (
                    <img
                      src={owner.avatar}
                      alt={owner.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-amber-100 text-xl font-bold text-amber-700">
                      {owner?.fullName?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 ring-2 ring-white">
                  <Crown size={12} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {owner?.fullName}
                </h3>
                <p className="text-sm text-gray-500">
                  {owner?.jobTitle || "Owner"} · Full system access
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-amber-700 shadow-sm ring-1 ring-amber-200">
              <Crown size={12} /> Owner
            </span>
          </div>
        </div>

        {!isOwner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
              <Lock size={14} className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-600">
                Owner information is restricted
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Administrators roster */}
      <div className="relative">
        <div
          className={
            !isOwner
              ? "pointer-events-none select-none grayscale opacity-40 saturate-0"
              : ""
          }
        >
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900">
                  Administrators
                </h2>
              </div>
              <span className="text-sm text-gray-400">
                {teamMembers.length}{" "}
                {teamMembers.length === 1 ? "member" : "members"}
              </span>
            </div>

            {teamMembers.length > 0 && (
              <div className="hidden border-b border-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:flex">
                <span className="flex-1">Admin</span>
                <span className="w-28">Status</span>
                <span className="w-36">Permissions</span>
                <span className="w-20 text-right">Actions</span>
              </div>
            )}

            <div>
              {teamMembers.map((admin, i) => (
                <div
                  key={admin.id}
                  className={`group flex flex-wrap items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80 ${
                    i !== teamMembers.length - 1
                      ? "border-b border-gray-50"
                      : ""
                  }`}
                >
                  {/* Admin */}
                  <div className="flex min-w-[220px] flex-1 items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-50">
                      {admin.avatar ? (
                        <img
                          src={admin.avatar}
                          alt={admin.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {admin.fullName}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Briefcase size={11} />
                        {admin.jobTitle || "No job title"}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="w-28">
                    <HasPermission resource="team" action="edit" disableInstead>
                      <button
                        onClick={() => toggleStatus(admin.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                          admin.status === "Active"
                            ? "bg-[rgb(0,166,62)]/10 text-[rgb(0,145,55)] hover:bg-[rgb(0,166,62)]/20"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            admin.status === "Active"
                              ? "bg-[rgb(0,166,62)]"
                              : "bg-red-500"
                          }`}
                        />
                        {admin.status}
                      </button>
                    </HasPermission>
                  </div>

                  {/* Permissions */}
                  <div className="w-36">
                    <HasPermission
                      resource="team"
                      action="managePermissions"
                      disableInstead
                    >
                      <Link
                        to={`/team/permissions/${admin.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Lock size={12} /> Permissions
                      </Link>
                    </HasPermission>
                  </div>

                  {/* Actions */}
                  <div className="ml-auto flex items-center gap-1">
                    <HasPermission resource="team" action="edit" disableInstead>
                      <Link
                        to={`/team/edit/${admin.id}`}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={16} />
                      </Link>
                    </HasPermission>
                    <HasPermission
                      resource="team"
                      action="delete"
                      disableInstead
                    >
                      <button
                        onClick={() => deleteMember(admin.id)}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </HasPermission>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {teamMembers.length === 0 && (
            <div className="mt-6 rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
              <Shield size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-700">
                No Administrators Yet
              </h3>
              <p className="mb-6 text-sm text-gray-500">
                Create your first administrator and assign permissions.
              </p>
              <Link
                to="/team/add"
                className="inline-flex items-center gap-2 rounded-xl bg-[rgb(0,166,62)] px-6 py-3 font-semibold text-white transition hover:bg-[rgb(0,145,55)]"
              >
                <Plus size={18} />
                Add Admin
              </Link>
            </div>
          )}
        </div>

        {!isOwner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl bg-white/40">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
              <Lock size={14} className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-600">
                Admin management is restricted. Only the owner can modify the
                team.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Team;
