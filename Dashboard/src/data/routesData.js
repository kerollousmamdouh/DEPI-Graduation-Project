// ==========================================
// Pages Imports
// ==========================================
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import BestProducts from "../pages/BestProducts";
import OrderLists from "../pages/OrderLists";
import OrderDetails from "../pages/OrderDetails";

import Users from "../pages/Users";
import Team from "../pages/Team";
import AddTeamMember from "../pages/AddTeamMember";
import TeamPermissions from "../pages/TeamPermissions";

import Categories from "../pages/Categories";
import HeroSlider from "../pages/HeroSlider";
import FooterSettings from "../pages/FooterSettings";

import Deals from "../pages/Deals";
import AddDeal from "../pages/AddDeal";
import EditDeal from "../pages/EditDeal";

import PaymentMethods from "../pages/PaymentMethods";
import Complaints from "../pages/Complaints";
import Settings from "../pages/Settings";

import AnnouncementBanner from "../pages/AnnouncementBanner";

// ==========================================
// All Dashboard Routes Configuration
// ==========================================
export const routesData = [
  // ------------------------------------------
  // Main Routes
  // ------------------------------------------
  {
    title: "Dashboard",
    path: "/",
    component: Dashboard,
    permission: "dashboard",
    showInSidebar: true,
    group: "Main",
  },
  {
    title: "Products",
    path: "/products",
    component: Products,
    permission: "products",
    showInSidebar: true,
    group: "Main",
  },
  {
    title: "Best products",
    path: "/best-products",
    component: BestProducts,
    permission: "bestProducts",
    showInSidebar: true,
    group: "Main",
  },
  {
    title: "Orders",
    path: "/orders",
    component: OrderLists,
    permission: "orders",
    showInSidebar: true,
    group: "Main",
  },
  {
    title: "Order Details",
    path: "/orders/:id",
    component: OrderDetails,
    permission: "orders",
    showInSidebar: false,
    group: "Main",
  },

  // ------------------------------------------
  // Management & Users
  // ------------------------------------------
  {
    title: "Users",
    path: "/orders-by-users",
    component: Users,
    permission: "users",
    showInSidebar: true,
    group: "Management",
  },
  {
    title: "Team",
    path: "/team",
    component: Team,
    permission: "team",
    showInSidebar: true,
    group: "Management",
  },
  {
    title: "Add Team Member",
    path: "/team/add",
    component: AddTeamMember,
    permission: "team.add",
    showInSidebar: false,
    group: "Management",
  },
  {
    title: "Edit Team Member",
    path: "/team/edit/:id",
    component: AddTeamMember,
    permission: "team.edit",
    showInSidebar: false,
    group: "Management",
  },
  {
    title: "Team Permissions",
    path: "/team/permissions/:id",
    component: TeamPermissions,
    // Deliberately its own permission — being able to edit an admin's
    // profile must not imply being able to regrant their permissions.
    permission: "team.managePermissions",
    showInSidebar: false,
    group: "Management",
  },

  // ------------------------------------------
  // Content & Marketing
  // ------------------------------------------
  {
    title: "Categories",
    path: "/add-category",
    component: Categories,
    permission: "categories",
    showInSidebar: true,
    group: "Content",
  },
  {
    title: "Hero Slider",
    path: "/hero-slider",
    component: HeroSlider,
    permission: "heroSlider",
    showInSidebar: true,
    group: "Content",
  },
  {
    title: "Deals",
    path: "/deals",
    component: Deals,
    permission: "deals",
    showInSidebar: true,
    group: "Content",
  },
  {
    title: "Add Deal",
    path: "/deals/add",
    component: AddDeal,
    permission: "deals.add",
    showInSidebar: false,
    group: "Content",
  },
  {
    title: "Edit Deal",
    path: "/deals/edit/:id",
    component: EditDeal,
    permission: "deals.edit",
    showInSidebar: false,
    group: "Content",
  },
  {
    title: "Footer",
    path: "/FooterSettings",
    component: FooterSettings,
    permission: "footer",
    showInSidebar: true,
    group: "Content",
  },

  // ------------------------------------------
  // Store & System
  // ------------------------------------------
  {
    title: "Payment Methods",
    path: "/payment-methods",
    component: PaymentMethods,
    permission: "paymentMethods",
    showInSidebar: true,
    group: "Store",
  },
  {
    title: "Complaints",
    path: "/complaints",
    component: Complaints,
    permission: "complaints",
    showInSidebar: true,
    group: "Store",
  },
  {
    title: "Settings",
    path: "/settings",
    component: Settings,
    permission: "settings",
    showInSidebar: false,
    group: "System",
  },
  
  {
    title: "Announcement",
    path: "/announcement",
    component: AnnouncementBanner,
    permission: "announcement",
    showInSidebar: true,
    group: "Content",
  },
];