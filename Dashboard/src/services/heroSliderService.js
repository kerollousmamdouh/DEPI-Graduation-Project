import { apiClient } from "./apiClient";

export const heroSliderService = {
  async getSlides() {
    return apiClient.get("/banners");
  },

  async getCategories() {
    return apiClient.get("/categories/admin");
  },

  async addSlide(data) {
    return apiClient.post("/banners", data);
  },

  async updateSlide(id, data) {
    return apiClient.put(`/banners/${id}`, data);
  },

  async deleteSlide(id) {
    return apiClient.delete(`/banners/${id}`);
  },

  async toggleStatus(id, status) {
    return apiClient.patch(`/banners/${id}/status`, { is_active: status === 'Active' || status === true });
  },

  async changePriority(id, newPriority) {
    return apiClient.patch(`/banners/${id}/priority`, { priority: newPriority });
  }
};
