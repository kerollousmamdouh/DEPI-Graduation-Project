import { apiClient } from "./apiClient";

export const productsService = {
  async getProducts() {
    const response = await apiClient.get("/products", { params: { all: true } });
    return response;
  },

  async addProduct(data) {
    const response = await apiClient.post("/products", data);
    return response;
  },

  async updateProduct(id, data) {
    await apiClient.put(`/products/${id}`, data);
    return { id, ...data };
  },

  async deleteProduct(id) {
    await apiClient.delete(`/products/${id}`);
    return id;
  },

  async updateStock(id, stock) {
    await apiClient.put(`/products/${id}`, { available_quantity: Number(stock) || 0 });
    return { id, stock };
  },
};
