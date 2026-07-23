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
};
