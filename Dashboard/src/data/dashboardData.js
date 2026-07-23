import { productsData } from "./productsData";
import { ordersData } from "./ordersData";
import { usersData } from "./usersData";
import { dealsData } from "./dealsData";
import { categoriesData } from "./categoriesData";
import { complaintsData } from "./complaintsData";
import { teamData } from "./teamData";

export const dashboardStats = {
  products: productsData.length,

  orders: ordersData.length,

  users: usersData.length,

  categories: categoriesData.length,

  deals: dealsData.filter(
    (deal) => deal.status === "Active"
  ).length,

  complaints: complaintsData.filter(
    (item) => item.status !== "Resolved"
  ).length,

  admins: teamData.filter(
    (member) => member.role === "admin"
  ).length,

  revenue: ordersData.reduce(
    (sum, order) => sum + order.total,
    0
  ),
};