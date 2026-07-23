import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

/**
 * <HasPermission resource="products" action="edit">
 *   <button>Edit</button>
 * </HasPermission>
 *
 * Wrap any view/edit/delete/add button (or any UI at all) with this to show
 * it only to users who hold that specific permission. Defaults to "view" if
 * no action is given, i.e. <HasPermission resource="products"> checks
 * page-level access.
 *
 * Props:
 * - resource:   permission resource id, e.g. "products", "team", "deals"
 * - action:     "view" | "add" | "edit" | "delete" | "managePermissions" (default "view")
 * - fallback:   optional element rendered instead when the check fails
 *               (omit it to render nothing, which is the common case for
 *               hiding action buttons)
 * - disableInstead: if true, instead of hiding children, wraps them in a
 *               visually-disabled, pointer-events-none span with a tooltip.
 *               Useful for buttons you want visible-but-inert rather than
 *               hidden (e.g. a status toggle that should still show state).
 */
export default function HasPermission({
  resource,
  action = "view",
  fallback = null,
  disableInstead = false,
  children,
}) {
  const { can } = useAuth();
  const { t } = useLanguage();
  const allowed = can(resource, action);

  if (allowed) return children;

  if (disableInstead && children) {
    return (
      <span
        title={t("noPermissionTooltip")}
        className="pointer-events-none inline-block cursor-not-allowed opacity-40"
      >
        {children}
      </span>
    );
  }

  return fallback;
}
