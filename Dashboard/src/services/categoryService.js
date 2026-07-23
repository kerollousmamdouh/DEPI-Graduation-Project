import { apiClient } from "./apiClient";

export const categoryService = {
  async getCategories() {
    const response = await apiClient.get("/categories/admin");
    return response;
  },

  async addCategory(data) {
    const response = await apiClient.post("/categories", data);
    return response;
  },

  async updateCategory(id, data) {
    await apiClient.put(`/categories/${id}`, data);
    return true;
  },

  async deleteCategory(id) {
    await apiClient.delete(`/categories/${id}`);
    return true;
  },

  async toggleStatus(id, status) {
    await apiClient.patch(`/categories/${id}/status`, { is_active: status === 'Active' || status === true });
    return true;
  }
};