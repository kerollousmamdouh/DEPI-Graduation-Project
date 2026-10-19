import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// ==========================================
// Protected Route
// ==========================================

const ProtectedRoute = ({ permission, children }) => {
  const { user, loading, hasPermission } = useAuth();

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h2 className="text-xl font-bold">Loading...</h2>
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
  // No Permission — bounce back quietly instead
  // of flashing an "Access Denied" page.
  // ==========================================

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }

  // ==========================================
  // Allowed
  // ==========================================

  return children;
};

export default ProtectedRoute;
