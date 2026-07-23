import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

// ==========================================
// Protected Route
// ==========================================

const ProtectedRoute = ({
  permission,
  children,
}) => {
  const {
    user,
    loading,
    hasPermission,
  } = useAuth();

  const { t } = useLanguage();

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">

        <h2 className="text-xl font-bold">

          Loading...

        </h2>

      </div>
    );
  }

  // ==========================================
  // Not Logged In
  // ==========================================

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ==========================================
  // No Permission
  // ==========================================

  if (
    permission &&
    !hasPermission(permission)
  ) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">

        <h1 className="text-7xl font-extrabold text-red-500">

          403

        </h1>

        <h2 className="mt-5 text-3xl font-bold">

          {t("accessDeniedTitle")}

        </h2>

        <p className="mt-3 text-gray-500">

          {t("accessDeniedMessage")}

        </p>

      </div>
    );
  }

  // ==========================================
  // Allowed
  // ==========================================

  return children;
};

export default ProtectedRoute;