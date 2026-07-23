import { apiClient } from "./apiClient";
import { INITIAL_BEST_PRODUCTS, ACTIVE_CATEGORIES } from "../data/bestProducts";

const USE_MOCK = false; // Always use backend API
const MOCK_DELAY = 400;

const mockRequest = (operation) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const data = operation();
        resolve({ success: true, data, message: null });
      } catch (error) {
        reject(new Error(error?.message || "Unexpected mock DB error"));
      }
    }, MOCK_DELAY);
  });

export const bestProductsService = {
  async getActiveCategories() {
    if (USE_MOCK) {
      return mockRequest(() => ACTIVE_CATEGORIES);
    }
    return apiClient.get("/categories");
  },

  async getBestSellingProducts({ search = "", category = "", limit = 5, page = 1 } = {}) {
    if (USE_MOCK) {
      return mockRequest(() => {
        const q = String(search || "").trim().toLowerCase();

        const filtered = INITIAL_BEST_PRODUCTS.filter((p) => {
          const matchesCategory = !category || String(p.category_id) === String(category);
          const matchesSearch =
            !q ||
            p.name_ar.toLowerCase().includes(q) ||
            p.name_en.toLowerCase().includes(q);
          return matchesCategory && matchesSearch;
        }).sort((a, b) => b.units_sold - a.units_sold);

        const totalItems = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));
        const safePage = Math.min(Math.max(1, page), totalPages);
        const start = (safePage - 1) * limit;

        return {
          products: filtered.slice(start, start + limit),
          totalItems,
          totalPages,
          page: safePage,
        };
      });
    }

    return apiClient.get("/products/best-sellers", {
      params: { search, category, limit, page },
    });
  },
};

export default bestProductsService;
