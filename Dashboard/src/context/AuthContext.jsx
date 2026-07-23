import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiClient } from "../services/apiClient";
import { buildPermissionId } from "../data/permissionsData";

const AuthContext = createContext();

// ==========================================
// Provider
// ==========================================

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // Restore Session
  // ==========================================

  useEffect(() => {
    const restoreSession = async () => {
      const stored =
        localStorage.getItem(
          "currentUser"
        );

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.token) {
            const profile = await apiClient.get("/auth/profile");
            const restoredUser = { ...parsed, ...profile, token: parsed.token };
            localStorage.setItem("currentUser", JSON.stringify(restoredUser));
            setUser(restoredUser);
          } else {
            setUser(parsed);
          }
        } catch {
          localStorage.removeItem("currentUser");
          setUser(null);
        }
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  // ==========================================
  // Login
  // ==========================================

  const login = async (identifier, password) => {
    const username = identifier.trim();

    const data = await apiClient.post("/auth/login", {
      username,
      password,
    });

    if (!data.token) {
      throw new Error(data.message || "Invalid username or password.");
    }

    const adminRoles = ["super_admin", "store_manager"];
    if (!adminRoles.includes(data.user.role)) {
      throw new Error("Access denied. Admin privileges required.");
    }

    const userWithToken = { ...data.user, token: data.token };

    localStorage.setItem("currentUser", JSON.stringify(userWithToken));
    setUser(userWithToken);
    return userWithToken;
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  const isOwner = user?.role === "super_admin";
  const isAdmin = user?.role === "store_manager" || user?.role === "super_admin";

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === "super_admin") return true;
    if (user.role === "store_manager") return true;
    return user.permissions?.includes(permission) ?? false;
  };

  // ==========================================
  // Fine-grained action permission check
  // ==========================================
  const can = (resourceId, action = "view") => {
    if (!user) return false;
    if (isOwner) return true;
    if (isAdmin) return true;
    if (user.permissions?.includes("*")) return true;

    const scopedId = buildPermissionId(resourceId, action);
    if (user.permissions?.includes(scopedId)) return true;

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
        isOwner,
        isAdmin,
        hasPermission,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// Hook
// ==========================================

export const useAuth = () =>
  useContext(AuthContext);