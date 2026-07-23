import { apiClient } from "./apiClient";

export const userService = {
  async getUsers() {
    const response = await apiClient.get("/users-management");
    return response;
  },

  async addUser(data) {
    const response = await apiClient.post("/users-management", data);
    return response;
  },

  async updateUser(id, data) {
    await apiClient.put(`/users-management/${id}`, data);
    return true;
  },

  async deleteUser(id) {
    await apiClient.delete(`/users-management/${id}`);
    return true;
  },

  async toggleStatus(id) {
    await apiClient.patch(`/users-management/${id}/toggle-status`);
    return true;
  },

  async sendMessage(userIds, messageText) {
    for (const userId of userIds) {
      await apiClient.post(`/complaints/direct-message`, { userId, message: messageText });
    }
    return true;
  },
};
