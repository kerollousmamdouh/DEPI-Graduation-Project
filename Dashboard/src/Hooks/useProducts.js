import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; 
import { productsService } from "../services/productsService";

export function useProducts() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // جلب المنتجات من الباك إند
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const raw = await productsService.getProducts();
      return raw.map(p => ({
        ...p,
        name: typeof p.name === 'object' ? p.name : {
          ar: p.name_ar || p.name || "",
          en: p.name_en || p.name || "",
        },
        categoryId: p.categoryId || p.category_id,
        offerPrice: p.offerPrice || p.discount_price || null,
        offerStock: p.offerStock || p.offer_max_quantity || null,
        offerExpiresAt: p.offerExpiresAt || p.offer_end_at || null,
      }));
    },
  });

  // إضافة منتج جديد
  const addMutation = useMutation({
    mutationFn: productsService.addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("حدث خطأ أثناء الإضافة"),
  });

  // تحديث منتج (Edit)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productsService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("حدث خطأ أثناء التحديث"),
  });

  // حذف منتج (Delete)
  const deleteMutation = useMutation({
    mutationFn: productsService.deleteProduct,
    onSuccess: (id) => {
      queryClient.setQueryData(["products"], (old = []) =>
        old.filter((p) => p.id !== id)
      );
      toast.success("تم حذف المنتج بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  // استخراج الأقسام الفريدة المتاحة في المنتجات لعمل الفلترة
  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.categoryId))], [products]);

  // فلترة المنتجات مع دعم ذكي وآمن لهيكل الاسم الجديد (عربي/إنجليزي)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const searchText = search.toLowerCase();
      
      // التعامل المرن مع الأسامي سواء كانت Object (عربي وإنجليزي) أو String عادي لمنع أي Crash
      let nameAr = "";
      let nameEn = "";

      if (p.name && typeof p.name === "object") {
        nameAr = p.name.ar ? p.name.ar.toLowerCase() : "";
        nameEn = p.name.en ? p.name.en.toLowerCase() : "";
      } else if (typeof p.name === "string") {
        nameAr = p.name.toLowerCase();
      }

      const matchesSearch = nameAr.includes(searchText) || nameEn.includes(searchText);
      const matchesCategory = categoryFilter === "All" || p.categoryId === Number(categoryFilter);
      
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  return {
    products: filteredProducts,
    isLoading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    addProduct: addMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
  };
}