import { apiClient } from "./apiClient";

export const teamService = {
  async getMembers() {
    const response = await apiClient.get("/team");
    return response;
  },

  async addMember(data) {
    const response = await apiClient.post("/team", data);
    return response;
  },

  async updateMember(id, data) {
    await apiClient.put(`/team/${id}`, data);
    return true;
  },

  async deleteMember(id) {
    await apiClient.delete(`/team/${id}`);
    return true;
  },

  async toggleStatus(id) {
    await apiClient.patch(`/team/${id}/toggle-status`);
    return true;
  },

  async updatePermissions(id, permissions) {
    await apiClient.put(`/team/${id}`, { permissions });
    return true;
  },

  // Verifies the OWNER's password (used to confirm sensitive actions
  // performed by non-owner team members: adding/editing members,
  // updating their own profile, etc.). The server checks the password
  // against the owner's bcrypt hash and never returns any password data.
  // NOTE: requires a backend route, e.g. POST /team/verify-owner-password
  // -> { valid: boolean }
  async verifyOwnerPassword(password) {
    const response = await apiClient.post("/team/verify-owner-password", { password });
    return response;
  },
};