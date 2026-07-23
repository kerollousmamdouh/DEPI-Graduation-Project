import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { useTeam } from "../Hooks/useTeam";
import { useAuth } from "../context/AuthContext";
import {
  permissionsData,
  buildPermissionId,
  allPermissionIds,
} from "../data/permissionsData";

const ACTION_LABELS = {
  view: "View",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
  managePermissions: "Manage Permissions",
};

export default function TeamPermissions() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { members, updateMember } = useTeam();
  const { isOwner } = useAuth();

  const admin = useMemo(
    () => members.find((a) => String(a.id) === id),
    [members, id]
  );

  const [permissions, setPermissions] = useState(admin?.permissions || []);

  if (!admin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Administrator not found.</h2>
        <button onClick={() => navigate("/team")} className="mt-4 text-blue-600 underline">Back to Team</button>
      </div>
    );
  }

  const togglePermission = (permissionId) => {
    setPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleView = (resourceId) => {
    setPermissions((prev) => {
      const isEnabled = prev.includes(resourceId);
      if (isEnabled) {
        return prev.filter(
          (p) => p !== resourceId && !p.startsWith(`${resourceId}.`)
        );
      }
      return [...prev, resourceId];
    });
  };

  const handleSave = () => {
    updateMember(Number(id), { ...admin, permissions });
    toast.success("Permissions updated successfully.");
    navigate("/team");
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="rounded-xl border p-3 hover:bg-gray-100"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-3xl font-bold">Manage Permissions</h1>
          <p className="mt-2 text-gray-500">{admin.fullName}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow border border-gray-100 space-y-4">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck size={22} className="text-[rgb(0,166,62)]" />
          <h2 className="text-xl font-bold">Dashboard Permissions</h2>
        </div>
        <p className="text-sm text-gray-500 -mt-2">
          Grant page access first, then choose which actions this admin can perform on that page.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {permissionsData.map((resource) => {
            const canView = permissions.includes(resource.id);
            const actionOnlyList = resource.actions.filter((a) => a !== "view");

            return (
              <div
                key={resource.id}
                className={`rounded-2xl border p-4 transition ${
                  canView ? "border-[rgb(0,166,62)]/40 bg-[rgb(0,166,62)]/5" : "border-gray-200"
                }`}
              >
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <h3 className="font-semibold">{resource.name}</h3>
                    <p className="text-sm text-gray-500">{resource.path}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={canView}
                    onChange={() => toggleView(resource.id)}
                    className="h-5 w-5 accent-[rgb(0,166,62)]"
                  />
                </label>

                {actionOnlyList.length > 0 && (
                  <div
                    className={`mt-3 flex flex-wrap gap-2 border-t pt-3 ${
                      !canView ? "opacity-40 pointer-events-none" : ""
                    }`}
                  >
                    {actionOnlyList.map((action) => {
                      const permId = buildPermissionId(resource.id, action);
                      const isManagePermissions = action === "managePermissions";

                      if (isManagePermissions && !isOwner) return null;

                      const checked = permissions.includes(permId);

                      return (
                        <label
                          key={permId}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition ${
                            checked
                              ? "border-[rgb(0,166,62)] bg-[rgb(0,166,62)] text-white"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {isManagePermissions && <Lock size={12} />}
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(permId)}
                            className="sr-only"
                          />
                          {ACTION_LABELS[action] || action}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between border-t pt-6">
          <div className="flex gap-3">
             <button onClick={() => setPermissions(allPermissionIds)} className="rounded-xl border px-5 py-3 hover:bg-gray-100">Select All</button>
             <button onClick={() => setPermissions([])} className="rounded-xl border px-5 py-3 hover:bg-gray-100">Remove All</button>
          </div>
          <button onClick={handleSave} className="rounded-xl bg-[rgb(0,166,62)] px-8 py-3 font-semibold text-white">Save Permissions</button>
        </div>
      </div>
    </div>
  );
}
