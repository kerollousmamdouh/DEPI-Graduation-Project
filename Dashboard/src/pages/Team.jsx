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
import HasPermission from "../components/HasPermission";

function Team() {
  const { members, loading, deleteMember, toggleStatus } = useTeam();

  // 1. حالة التحميل
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xl text-gray-500">
        جاري تحميل بيانات الفريق...
      </div>
    );
  }

  // 2. فصل الـ Owner عن الـ Admins
  const owner = members?.find((m) => m.role === "Owner" || m.role === "owner") || members[0] || {};
  const admins = members?.filter((m) => m.id !== owner.id) || [];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500 mt-2">Manage your administrators and their permissions.</p>
        </div>

        <HasPermission resource="team" action="add">
          <Link
            to="/team/add"
            className="flex items-center gap-2 rounded-xl bg-[rgb(0,166,62)] px-5 py-3 font-semibold text-white hover:bg-[rgb(0,145,55)] transition-all shadow-lg shadow-green-200"
          >
            <Plus size={18} />
            Add Admin
          </Link>
        </HasPermission>
      </div>

      {/* Owner Section */}
      <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Crown size={20} className="text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold">System Owner</h2>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-5 flex items-center justify-between border border-gray-100">
          <div className="flex items-center gap-4">
             {/* Owner Avatar */}
             <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-white">
                {owner?.avatar ? (
                  <img src={owner.avatar} alt={owner.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-gray-400">{owner?.fullName?.charAt(0)}</span>
                )}
             </div>
             <div>
                <h3 className="text-lg font-bold">{owner?.fullName}</h3>
                <p className="text-sm text-gray-500">{owner?.jobTitle || "Owner"}</p>
             </div>
          </div>
          <span className="rounded-full bg-white border px-4 py-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
            Full Access
          </span>
        </div>
      </div>

      {/* Admins Table */}
      <div className="rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Shield size={20} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold">Administrators</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Admin</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Permissions</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50/50 transition">
                  {/* Admin Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                           {admin.avatar ? (
                              <img src={admin.avatar} alt={admin.fullName} className="w-full h-full object-cover" />
                           ) : (
                              <User size={18} className="text-gray-400" />
                           )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{admin.fullName}</h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <Briefcase size={12} />
                                <span>{admin.jobTitle || "No Job Title"}</span>
                            </div>
                        </div>
                    </div>
                  </td>
                  
                  {/* Status Column */}
                  <td className="px-6 py-4">
                    <HasPermission
                      resource="team"
                      action="edit"
                      disableInstead
                      fallback={
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            admin.status === "Active"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {admin.status}
                        </span>
                      }
                    >
                      <button
                        onClick={() => toggleStatus(admin.id)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                          admin.status === "Active"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {admin.status}
                      </button>
                    </HasPermission>
                  </td>
                  
                  {/* Permissions Column */}
                  <td className="px-6 py-4 text-center">
                    <HasPermission resource="team" action="managePermissions">
                      <Link
                        to={`/team/permissions/${admin.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
                      >
                        <Lock size={14} />
                        Manage
                      </Link>
                    </HasPermission>
                  </td>
                  
                  {/* Actions Column */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <HasPermission resource="team" action="edit">
                        <Link
                          to={`/team/edit/${admin.id}`}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Pencil size={18} />
                        </Link>
                      </HasPermission>
                      <HasPermission resource="team" action="delete">
                        <button
                          onClick={() => deleteMember(admin.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </HasPermission>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {admins.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Shield size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-700">No Administrators Yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create your first administrator and assign permissions.</p>
          <Link
            to="/team/add"
            className="inline-flex items-center gap-2 rounded-xl bg-[rgb(0,166,62)] px-6 py-3 font-semibold text-white hover:bg-[rgb(0,145,55)]"
          >
            <Plus size={18} />
            Add Admin
          </Link>
        </div>
      )}
    </div>
  );
}

export default Team;