import { apiClient } from "./apiClient";

export const orderService = {
  async getOrders() {
    return apiClient.get("/admin/orders");
  },

  async getOrderById(id) {
    return apiClient.get(`/admin/orders/${id}`);
  },

  async updateOrderStatus(id, newStatus) {
    const status = String(newStatus || "").toLowerCase();
    return apiClient.patch(`/admin/orders/${id}/status`, { status });
  },

  async cancelOrder(id) {
    return this.updateOrderStatus(id, "canceled");
  }
};

export default orderService;
