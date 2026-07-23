import { apiClient } from "./apiClient";

export const footerService = {
  async getFooter() {
    return apiClient.get("/footer-settings");
  },

  async saveFooter(data) {
    return apiClient.put("/footer-settings", data);
  },
};