import { useAuth } from "../context/AuthContext";

/**
 * usePermission
 * Thin convenience hook around AuthContext's `can`, for use directly inside
 * components that need to branch on logic (not just show/hide a button) —
 * e.g. disabling a button vs. hiding it, or guarding a handler function.
 *
 * Example:
 *   const { can } = usePermission();
 *   if (!can("products", "delete")) return;
 *   deleteProduct(id);
 */
export function usePermission() {
  const { can, hasPermission, isOwner, isAdmin, user } = useAuth();

  return {
    can,
    hasPermission,
    isOwner,
    isAdmin,
    user,
  };
}

export default usePermission;
