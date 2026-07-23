import { useCallback, useEffect, useState } from "react";
import { bestProductsService } from "../services/bestProductsService";

const extractErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.message) return err.message;
  return fallback;
};

export function useBestProducts() {
  const [products, setProducts] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    limit: 5,
    page: 1,
  });

  const fetchActiveCategories = useCallback(async () => {
    try {
      const response = await bestProductsService.getActiveCategories();
      if (response && response.success === false) {
        throw new Error(response.message || "تعذر تحميل الأقسام");
      }
      setActiveCategories(response.data || response || []);
    } catch (err) {
      console.error("useBestProducts Categories Error:", err);
    }
  }, []);

  const refetch = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setIsLoading(true);
        setError(null);
        const response = await bestProductsService.getBestSellingProducts({
          search: filters.search,
          category: filters.category,
          limit: filters.limit,
          page: filters.page,
        });
        if (response && response.success === false) {
          throw new Error(response.message || "حدث خطأ من الخادم");
        }
        const data = response.data || response || {};
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("useBestProducts Error:", err);
        setError(extractErrorMessage(err, "حدث خطأ أثناء تحميل المنتجات."));
      } finally {
        if (showLoader) setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchActiveCategories();
  }, [fetchActiveCategories]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  return {
    products,
    activeCategories,
    isLoading,
    isError: Boolean(error),
    error,
    filters,
    totalPages,
    updateFilter,
    refetch,
  };
}
