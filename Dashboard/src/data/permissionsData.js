// ==========================================
// Dashboard Permissions
// ==========================================

// ==========================================
// Available fine-grained actions
// ==========================================
// "view" is always implicit — it is what gates the route/page itself and is
// represented by the *bare* resource id, e.g. "products".
// Anything beyond that is expressed as "<resourceId>.<action>",
// e.g. "products.edit", "products.delete", "team.managePermissions".
export const PERMISSION_ACTIONS = {
  VIEW: "view",
  ADD: "add",
  EDIT: "edit",
  DELETE: "delete",
};

export const permissionsData = [
  {
    id: "dashboard",
    name: "Dashboard",
    path: "/",
    group: "Main",
    actions: ["view"],
  },

  {
    id: "products",
    name: "Products",
    path: "/products",
    group: "Main",
    actions: ["view", "add", "edit", "delete"],
  },

  {
    id: "bestSellers",
    name: "Best Sellers",
    path: "/best-sellers",
    group: "Main",
    actions: ["view"],
  },

  {
    id: "orders",
    name: "Orders",
    path: "/orders",
    group: "Main",
    // Orders are placed by customers; admins can only view / update status.
    actions: ["view", "edit"],
  },

  {
    id: "users",
    name: "Users",
    path: "/orders-by-users",
    group: "Management",
    // Users register themselves; admins can edit or remove accounts.
    actions: ["view", "edit", "delete"],
  },

  {
    id: "team",
    name: "Team",
    path: "/team",
    group: "Management",
    // "managePermissions" is intentionally separate from "edit": being able
    // to edit an admin's profile (name/photo) should NOT automatically let
    // you regrant their permissions — that is a privilege-escalation risk.
    actions: ["view", "add", "edit", "delete", "managePermissions"],
  },

  {
    id: "categories",
    name: "Categories",
    path: "/add-category",
    group: "Management",
    actions: ["view", "add", "edit", "delete"],
  },

  {
    id: "heroSlider",
    name: "Hero Slider",
    path: "/hero-slider",
    group: "Content",
    actions: ["view", "add", "edit", "delete"],
  },

  {
    id: "footer",
    name: "Footer Settings",
    path: "/FooterSettings",
    group: "Content",
    actions: ["view", "edit"],
  },

  {
    id: "paymentMethods",
    name: "Payment Methods",
    path: "/payment-methods",
    group: "Content",
    actions: ["view", "add", "edit", "delete"],
  },

  {
    id: "complaints",
    name: "Complaints",
    path: "/complaints",
    group: "Support",
    actions: ["view", "edit"],
  },

  {
    id: "settings",
    name: "Settings",
    path: "/settings",
    group: "System",
    actions: ["view", "edit"],
  },
  {
    id: "deals",
    name: "Deals",
    path: "/deals",
    group: "Content",
    actions: ["view", "add", "edit", "delete"],
  },
  {
    id: "announcement",
    name: "Announcement",
    path: "/announcement",
    group: "Content",
    actions: ["view", "add", "delete"],
  },
];

// ==========================================
// Permission Groups
// ==========================================

export const permissionGroups = [
  "Main",
  "Management",
  "Content",
  "Support",
  "System",
];

// ==========================================
// Get Permission By ID
// ==========================================

export const getPermission = (id) =>
  permissionsData.find(
    (permission) => permission.id === id
  );

// ==========================================
// Get Permissions By Group
// ==========================================

export const getPermissionsByGroup = (
  group
) =>
  permissionsData.filter(
    (permission) =>
      permission.group === group
  );

// ==========================================
// Build / parse scoped permission ids
// ==========================================
// buildPermissionId("products", "edit")  -> "products.edit"
// buildPermissionId("products", "view")  -> "products"  (bare id = view/page access)
export const buildPermissionId = (
  resourceId,
  action = PERMISSION_ACTIONS.VIEW
) =>
  action === PERMISSION_ACTIONS.VIEW
    ? resourceId
    : `${resourceId}.${action}`;

// parsePermissionId("products.edit") -> { resourceId: "products", action: "edit" }
export const parsePermissionId = (permissionId) => {
  const [resourceId, action = PERMISSION_ACTIONS.VIEW] =
    permissionId.split(".");
  return { resourceId, action };
};

// ==========================================
// Get Actions Available For A Resource
// ==========================================
export const getResourceActions = (resourceId) =>
  getPermission(resourceId)?.actions ?? ["view"];

// ==========================================
// Get All Permission IDs (view + every action)
// ==========================================
// Includes both the bare resource id (view/page access) AND every scoped
// "<resource>.<action>" id, so "Select All" in the permissions UI grants
// full CRUD, not just page visibility.
export const allPermissionIds = permissionsData.flatMap((permission) =>
  (permission.actions ?? ["view"]).map((action) =>
    buildPermissionId(permission.id, action)
  )
);

// Bare/page-level ids only (kept for places that only care about page access,
// e.g. the sidebar).
export const allPagePermissionIds = permissionsData.map(
  (permission) => permission.id
);