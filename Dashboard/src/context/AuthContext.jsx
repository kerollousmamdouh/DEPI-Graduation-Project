import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiClient } from "../services/apiClient";
import { buildPermissionId } from "../data/permissionsData";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("dash_token") || null);
  const [loading, setLoading] = useState(true);

  // Sync token to Authorization header
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Restore Session
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await apiClient.get("/auth/dashboard/profile");
        setUser(profile);
      } catch {
        setToken(null);
        localStorage.removeItem("dash_token");
        setUser(null);
      }
      setLoading(false);
    };
    restoreSession();
  }, [token]);

  // Login
  const login = async (identifier, password) => {
    const data = await apiClient.post("/auth/dashboard/login", {
      email: identifier.trim(),
      password,
    });

    if (!data.user) {
      throw new Error(data.message || "Invalid email or password.");
    }

    if (data.token) {
      localStorage.setItem("dash_token", data.token);
      setToken(data.token);
    }
    setUser(data.user);
    return data.user;
  };

  // Logout
  const logout = async () => {
    try {
      await apiClient.post("/auth/dashboard/logout");
    } catch {
      // Even if the call fails, clear local state
    }
    localStorage.removeItem("dash_token");
    localStorage.removeItem("currentUser");
    delete apiClient.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  // Permissions
  const isOwner = user?.role === "super_admin";
  const isAdmin = user?.role === "team_member" || user?.role === "super_admin";

  const hasPermission = (permission) => {
    if (!user) return false;
    if (isOwner) return true;
    return user.permissions?.includes(permission) ?? false;
  };

  const can = (resourceId, action = "view") => {
    if (!user) return false;
    if (isOwner) return true;
    if (user.permissions?.includes("*")) return true;

    const scopedId = buildPermissionId(resourceId, action);
    if (user.permissions?.includes(scopedId)) return true;

    if (user.permissions?.includes(resourceId)) return true;

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

export const useAuth = () => useContext(AuthContext);
