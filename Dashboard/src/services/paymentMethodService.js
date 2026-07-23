import { apiClient } from "./apiClient";

export const paymentMethodService = {
  async getPaymentMethods() {
    return apiClient.get("/payment-methods");
  },

  async addPaymentMethod(data) {
    const response = await apiClient.post("/payment-methods", data);
    return response;
  },

  async updatePaymentMethod(id, data) {
    await apiClient.put(`/payment-methods/${id}`, data);
    return true;
  },

  async deletePaymentMethod(id) {
    await apiClient.delete(`/payment-methods/${id}`);
    return true;
  },

  async toggleStatus(id, status) {
    await apiClient.patch(`/payment-methods/${id}/status`, { is_active: status === 'Active' || status === true });
    return true;
  },

  async changePriority(id, newPriority) {
    await apiClient.patch(`/payment-methods/${id}/priority`, { priority: newPriority });
    return true;
  },

  async setDefault(id) {
    await apiClient.patch(`/payment-methods/${id}/default`);
    return true;
  },
};

export default paymentMethodService;
