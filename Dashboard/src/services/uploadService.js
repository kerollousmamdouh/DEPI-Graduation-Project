import { apiClient } from "./apiClient";

const USE_MOCK = false; // Always use backend API

export const uploadService = {
  async uploadImage(file) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ url: reader.result });
        reader.readAsDataURL(file);
      });
    }
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },

  async uploadMultiple(files) {
    if (USE_MOCK) {
      const results = [];
      for (const file of files) {
        const result = await this.uploadImage(file);
        results.push(result);
      }
      return results;
    }
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const response = await apiClient.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },
};
