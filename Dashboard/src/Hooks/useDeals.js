import { useMemo, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getDeals,
  createDeal,
  updateDeal,
  deleteDeal,
} from "../services/dealsService";

export function useDeals() {
  const queryClient = useQueryClient();

  // ==========================================
  // Filters
  // ==========================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // ==========================================
  // Get Deals
  // ==========================================

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: getDeals,
  });

  // ==========================================
  // Categories
  // ==========================================

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        deals.map((deal) => deal.category_name).filter(Boolean)
      ),
    ];
  }, [deals]);

  // ==========================================
  // Filter Deals
  // ==========================================

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        (deal.name ?? deal.name_ar ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (deal.category_name ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || deal.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        deal.category_name === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [deals, search, statusFilter, categoryFilter]);

  // ==========================================
  // Statistics
  // ==========================================

  const stats = useMemo(() => {
    const now = new Date();
    return {
      active: deals.filter((d) => {
        if (!d.offer_start_at && !d.offer_end_at) return d.discount_price != null;
        const started = !d.offer_start_at || new Date(d.offer_start_at) <= now;
        const notEnded = !d.offer_end_at || new Date(d.offer_end_at) >= now;
        return d.discount_price != null && started && notEnded;
      }).length,

      scheduled: deals.filter((d) => {
        return d.offer_start_at && new Date(d.offer_start_at) > now;
      }).length,

      expired: deals.filter((d) => {
        return d.offer_end_at && new Date(d.offer_end_at) < now;
      }).length,

      paused: deals.filter((d) => d.discount_price == null).length,

      products: deals.length,

      total: deals.length,
    };
  }, [deals]);

  // ==========================================
  // Mutations
  // ==========================================

  const invalidateDeals = () => {
    queryClient.invalidateQueries({ queryKey: ["deals"] });
  };

  const addMutation = useMutation({
    mutationFn: createDeal,
    onSuccess: invalidateDeals,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateDeal(id, data),
    onSuccess: invalidateDeals,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDeal,
    onSuccess: invalidateDeals,
  });

  // ==========================================
  // Toggle Status
  // ==========================================

  const toggleStatus = (id) => {
    const deal = deals.find((d) => d.id === id);

    if (!deal) return;

    const nextStatus =
      deal.status === "Active" ? "Paused" : "Active";

    updateMutation.mutate({
      id,
      data: { ...deal, status: nextStatus },
    });
  };

  return {
    deals: filteredDeals,
    isLoading,

    stats,

    categories,

    search,
    setSearch,

    statusFilter,
    setStatusFilter,

    categoryFilter,
    setCategoryFilter,

    addDeal: addMutation.mutate,
    updateDeal: updateMutation.mutate,
    deleteDeal: deleteMutation.mutate,

    toggleStatus,
  };
}
