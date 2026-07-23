import { apiClient } from "./apiClient";

export const announcementService = {
  async getCurrentAnnouncement() {
    return apiClient.get("/announcements/current");
  },

  async publishAnnouncement(payload) {
    let multiplier = 1000 * 60 * 60;
    if (payload.durationUnit === "m") multiplier = 1000 * 60;
    if (payload.durationUnit === "s") multiplier = 1000;
    const totalMs = parseInt(payload.durationValue, 10) * multiplier;

    return apiClient.post("/announcements", {
      title_ar: payload.titleAr,
      message_ar: payload.text,
      title_en: payload.titleEn,
      message_en: payload.text,
      start_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + totalMs).toISOString(),
      bg_color: payload.colors?.bgColor || "#064e3b",
      text_color: payload.colors?.textColor || "#f0fdf4",
      title_color: payload.colors?.titleColor || "#34d399",
    });
  },

  async clearAnnouncement() {
    return apiClient.delete("/announcements/current");
  },
};

export default announcementService;
