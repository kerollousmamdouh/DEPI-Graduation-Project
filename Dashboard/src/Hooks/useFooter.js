import { useEffect, useState, useCallback } from "react";
import { footerService } from "../services/footerService";

export const useFooter = () => {
  const [footer, setFooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFooter = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const data = await footerService.getFooter();
      setFooter(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load footer settings.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFooter();
  }, [loadFooter]);

  const saveFooter = async (data) => {
    try {
      await footerService.saveFooter(data);
      await loadFooter(false);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const resetFooter = async () => {
    try {
      const data = await footerService.resetFooter();
      setFooter(data);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    footer,
    loading,
    error,
    saveFooter,
    resetFooter,
    refreshFooter: loadFooter,
  };
};