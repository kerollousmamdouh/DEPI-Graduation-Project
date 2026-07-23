import { useEffect, useMemo, useState } from "react";

import { useOrders } from "./useOrders";
import { useProducts } from "./useProducts";
import { useUsers } from "./useUsers";
import { useDeals } from "./useDeals";
import { useBestProducts } from "./useBestProducts";
import { useComplaints } from "./useComplaints";
import { useHeroSlider } from "./useHeroSlider";
import { useFooter } from "./useFooter";
import { usePaymentMethods } from "./usePaymentMethods";
import { useTeam } from "./useTeam";
import { useCategories } from "./useCategories";

import { fetchDashboardStats } from "../services/dashboardService";

const LOW_STOCK_THRESHOLD = 10;
const EXPIRING_SOON_DAYS = 3;

// حقول الطلب مختلفة الشكل حسب المصدر (Mock الحالي بيرجع customerDetails.name
// و totalPrice)، الدالتين دول بيوحدوا الشكل عشان أي Widget يقدر يعتمد عليهم
// من غير ما يفهم تفاصيل مصدر البيانات.
const getOrderTotal = (order) =>
  Number(order?.totalPrice ?? order?.total ?? 0);

const getOrderCustomerName = (order) =>
  order?.customerDetails?.name ||
  order?.customerName ||
  order?.name ||
  "Unknown Customer";

export default function useDashboard() {
  const orders = useOrders();
  const products = useProducts();
  const users = useUsers();
  const deals = useDeals();
  const bestProducts = useBestProducts();
  const complaints = useComplaints();
  const heroSlider = useHeroSlider();
  const footer = useFooter();
  const paymentMethods = usePaymentMethods();
  const team = useTeam();
  const categories = useCategories();

  // ==========================================
  // Store Overview (stats + charts)
  // ==========================================

  const totalRevenue = useMemo(
    () => (orders.orders ?? []).reduce((sum, order) => sum + getOrderTotal(order), 0),
    [orders.orders]
  );

  const pendingOrdersCount = useMemo(
    () => (orders.orders ?? []).filter((order) => order.status === "PENDING").length,
    [orders.orders]
  );

  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    setStatsLoading(true);

    fetchDashboardStats({
      totalUsers: (users.users ?? []).length,
      totalOrders: (orders.orders ?? []).length,
      totalRevenue,
      totalPending: pendingOrdersCount,
    }).then((data) => {
      if (!ignore) {
        setStats(data);
        setStatsLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [(users.users ?? []).length, (orders.orders ?? []).length, totalRevenue, pendingOrdersCount]);

  // آخر 7 أيام: عدد الطلبات في كل يوم
  const ordersChartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date;
    });

    return days.map((date) => {
      const count = (orders.orders ?? []).filter((order) => {
        const createdAt = new Date(order.createdAt);
        return createdAt.toDateString() === date.toDateString();
      }).length;

      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        orders: count,
      };
    });
  }, [orders.orders]);

  // آخر 6 شهور: إجمالي الإيراد في كل شهر
  const revenueChartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return date;
    });

    return months.map((date) => {
      const revenue = (orders.orders ?? [])
        .filter((order) => {
          const createdAt = new Date(order.createdAt);
          return (
            createdAt.getMonth() === date.getMonth() &&
            createdAt.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, order) => sum + getOrderTotal(order), 0);

      return {
        month: date.toLocaleDateString("en-US", { month: "short" }),
        revenue,
      };
    });
  }, [orders.orders]);

  // ==========================================
  // Orders Overview
  // ==========================================

  const latestOrders = useMemo(
    () =>
      [...(orders.orders ?? [])]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((order) => ({
          ...order,
          customerName: getOrderCustomerName(order),
          total: getOrderTotal(order),
        })),
    [orders.orders]
  );

  // ==========================================
  // Inventory / Store Health
  // ==========================================

  const lowStockProducts = useMemo(
    () =>
      (products.products ?? []).filter(
        (product) => (product.stock ?? 0) <= LOW_STOCK_THRESHOLD
      ),
    [products.products]
  );

  const pendingComplaintsCount = useMemo(
    () =>
      (complaints.complaints ?? []).filter((item) => item.status === "PENDING").length,
    [complaints.complaints]
  );

  const expiringDealsCount = useMemo(() => {
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + EXPIRING_SOON_DAYS);

    return (deals.deals ?? []).filter((deal) => {
      if (deal.status !== "Active" || !deal.endDate) return false;
      const endDate = new Date(deal.endDate);
      return endDate >= now && endDate <= soon;
    }).length;
  }, [deals.deals]);

  // ==========================================
  // Engagement widgets (Deals + Recent Activity)
  // ==========================================

  const activeDeals = useMemo(
    () => (deals.deals ?? []).filter((deal) => deal.status === "Active").slice(0, 4),
    [deals.deals]
  );

  const recentActivity = useMemo(() => {
    const events = [];

    (orders.orders ?? []).forEach((order) => {
      events.push({
        type: "order",
        title: `New order #${order.id}`,
        date: new Date(order.createdAt),
      });
    });

    (users.users ?? []).forEach((user) => {
      events.push({
        type: "user",
        title: `${user.name || "New customer"} joined`,
        date: new Date(user.joinDate || user.createdAt || 0),
      });
    });

    (deals.deals ?? []).forEach((deal) => {
      events.push({
        type: "deal",
        title:
          deal.status === "Active"
            ? `Deal "${deal.title}" is now active`
            : `Deal "${deal.title}" was created`,
        date: new Date(deal.createdAt || 0),
      });
    });

    return events
      .filter(
        (event) =>
          event.date instanceof Date &&
          !Number.isNaN(event.date.getTime()) &&
          event.date.getTime() > 0
      )
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
  }, [orders.orders, users.users, deals.deals]);

  return {
    overview: {
      orders,
      stats,
      statsLoading,
      revenueChartData,
      ordersChartData,
    },

    health: {
      products,
      lowStockProducts,
      complaints,
      pendingComplaintsCount,
      expiringDealsCount,
    },

    orders: {
      orders,
      latestOrders,
    },

    inventory: {
      products,
      bestProducts,
      lowStockProducts,
      categories,
    },

    customers: {
      users,
    },

    deals: {
      deals,
      activeDeals,
    },

    marketing: {
      heroSlider,
    },

    team: {
      team,
    },

    complaints: {
      complaints,
    },

    website: {
      heroSlider,
      footer,
      paymentMethods,
    },

    engagement: {
      activeDeals,
      recentActivity,
    },

    quickActions: {},
  };
}
