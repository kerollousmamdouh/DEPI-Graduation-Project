import { apiClient } from "./apiClient";

const normalizeDeal = (d) => {
  const now = new Date();
  const hasDiscount = d.discount_price != null;
  const started = !d.offer_start_at || new Date(d.offer_start_at) <= now;
  const notEnded = !d.offer_end_at || new Date(d.offer_end_at) >= now;

  let status = "Active";
  if (!hasDiscount) status = "Paused";
  else if (d.offer_start_at && new Date(d.offer_start_at) > now) status = "Scheduled";
  else if (d.offer_end_at && new Date(d.offer_end_at) < now) status = "Expired";

  return {
    id: d.id,
    title: d.name || d.name_ar || "Untitled Deal",
    name: d.name || d.name_ar,
    name_ar: d.name_ar,
    name_en: d.name_en,
    banner: d.product_image || "",
    category: d.category_name || "",
    category_name: d.category_name,
    discountType: "Fixed",
    discountValue: d.discount_price || 0,
    discount_price: d.discount_price,
    products: 1,
    startDate: d.offer_start_at
      ? new Date(d.offer_start_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "-",
    endDate: d.offer_end_at
      ? new Date(d.offer_end_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "-",
    offer_start_at: d.offer_start_at,
    offer_end_at: d.offer_end_at,
    offer_until_stock_out: d.offer_until_stock_out,
    offer_max_quantity: d.offer_max_quantity,
    price: d.price,
    slug: d.slug,
    status,
    product_id: d.id,
  };
};

export const getDeals = async () => {
  const response = await apiClient.get("/deals");
  if (Array.isArray(response)) {
    return response.map(normalizeDeal);
  }
  return [];
};

export const createDeal = async (deal) => {
  const response = await apiClient.post("/deals", deal);
  return response;
};

export const updateDeal = async (id, data) => {
  await apiClient.put(`/deals/${id}`, data);
  return { id, ...data };
};

export const deleteDeal = async (id) => {
  await apiClient.delete(`/deals/${id}`);
  return id;
};
