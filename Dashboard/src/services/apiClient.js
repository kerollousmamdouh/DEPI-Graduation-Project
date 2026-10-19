import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true, // send httpOnly cookies cross-origin
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor: centralised error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const serverMessage = error.response.data?.message || error.response.data?.error;

      if (status === 401) {
        localStorage.removeItem("currentUser");
        // Do NOT redirect here — AuthContext handles it gracefully.
        // Redirecting here causes an infinite loop on page load.
      }

      const apiError = new Error(serverMessage || `API Error ${status}`);
      apiError.status = status;

      // 403 means the UI let someone attempt something they don't have
      // permission for (e.g. a direct URL visit that bypassed a disabled
      // button). This should never surface as a raw "Access denied" error
      // message — components should check `error.status === 403` and show
      // a forbidden/blocked state (or just redirect back) instead of an
      // error toast/banner.
      apiError.isForbidden = status === 403;

      return Promise.reject(apiError);
    } else if (error.request) {
      return Promise.reject(new Error("No response from server. Check your internet connection."));
    } else {
      return Promise.reject(new Error(error.message));
    }
  }
);

export const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || "/";