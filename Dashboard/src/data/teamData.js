import { allPermissionIds } from "./permissionsData";

export const teamData = [
  // ==========================================
  // Owner
  // ==========================================

  {
    id: 1,

    avatar:
      "https://i.pravatar.cc/150?img=68",

    fullName: "mayer",

    email: "owner@dealora.com",

    phone: "+20 100 000 0000",

    password: "123456",

    role: "owner",

    status: "Active",

    permissions: ["*"],

    joinDate: "2026-01-01",
  },

  // ==========================================
  // Admin 1
  // ==========================================

  {
    id: 2,

    avatar:
      "https://i.pravatar.cc/150?img=12",

    fullName: "Ahmed Mohamed",

    email: "ahmed@dealora.com",

    phone: "+20 101 111 1111",

    password: "123456",

    role: "admin",

    status: "Active",

    permissions: [
      "dashboard",
      "products",
      "products.add",
      "products.edit",
      "products.delete",
      "orders",
      "orders.edit",
      "users",
      "users.edit",
      "categories",
      "categories.add",
      "categories.edit",
      "deals",
      "deals.add",
      "deals.edit",
    ],

    joinDate: "2026-02-10",
  },

  // ==========================================
  // Admin 2
  // ==========================================

  {
    id: 3,

    avatar:
      "https://i.pravatar.cc/150?img=32",

    fullName: "Sara Ali",

    email: "sara@dealora.com",

    phone: "+20 102 222 2222",

    password: "123456",

    role: "admin",

    status: "Active",

    permissions: [
      "dashboard",
      "orders",
      "orders.edit",
      "complaints",
      "complaints.edit",
    ],

    joinDate: "2026-03-05",
  },

  // ==========================================
  // Admin 3
  // ==========================================

  {
    id: 4,

    avatar:
      "https://i.pravatar.cc/150?img=45",

    fullName: "Omar Hassan",

    email: "omar@dealora.com",

    phone: "+20 103 333 3333",

    password: "123456",

    role: "admin",

    status: "disabled",

    permissions: [
      "dashboard",
      "products",
      "products.edit",
      "bestSellers",
      "heroSlider",
      "heroSlider.add",
      "heroSlider.edit",
      "heroSlider.delete",
      "footer",
      "footer.edit",
      "deals",
      "deals.edit",
    ],

    joinDate: "2026-04-15",
  },
];

// ==========================================
// Default Owner
// ==========================================

export const defaultOwner = teamData.find(
  (member) => member.role === "owner"
);

// ==========================================
// Default Admins
// ==========================================

export const defaultAdmins = teamData.filter(
  (member) => member.role === "admin"
);

// ==========================================
// Default Permissions
// ==========================================

export const defaultPermissions =
  allPermissionIds;