// src/services/dashboardService.js
import { apiClient } from "./apiClient";

// جاهز للربط مع الباك اند: لو VITE_API_BASE_URL متظبطة هيجيب البيانات من
// /api/dashboard/stats مباشرة. لحد ما الباك اند يجهز، بيتم حساب نفس الشكل
// (title, value, percent, trend, label) من بيانات المتجر الحقيقية
// (orders/users/products) اللي جايه من الهوكس بدل أرقام وهمية ثابتة.
export const fetchDashboardStats = async (liveData = {}) => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return apiClient.get("/dashboard/stats");
  }

  // محاكاة زمن استجابة شبكة بسيط
  await new Promise((resolve) => setTimeout(resolve, 200));

  const {
    totalUsers = 0,
    totalOrders = 0,
    totalRevenue = 0,
    totalPending = 0,
  } = liveData;

  return [
    {
      title: "totalUser",
      value: totalUsers.toLocaleString(),
      percent: "",
      trend: "up",
      label: "liveFromStore",
    },
    {
      title: "totalOrder",
      value: totalOrders.toLocaleString(),
      percent: "",
      trend: "up",
      label: "liveFromStore",
    },
    {
      title: "totalSales",
      value: `EGP ${totalRevenue.toLocaleString()}`,
      percent: "",
      trend: "up",
      label: "liveFromStore",
    },
    {
      title: "totalPending",
      value: totalPending.toLocaleString(),
      percent: "",
      trend: totalPending > 0 ? "down" : "up",
      label: "liveFromStore",
    },
  ];
};
