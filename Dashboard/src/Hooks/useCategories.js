import { useCallback, useEffect, useState, useMemo } from "react";
import { categoryService } from "../services/categoryService";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = async (data) => {
    try {
      const newCat = await categoryService.addCategory(data);
      await loadCategories(false);
      return newCat;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateCategory = async (id, data) => {
    try {
      await categoryService.updateCategory(id, data);
      await loadCategories(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
    
  const deleteCategory = async (id) => {
    try {
      await categoryService.deleteCategory(id);
      await loadCategories(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const toggleStatus = async (id, status) => {
    try {
      await categoryService.toggleStatus(id, status);
      await loadCategories(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // 🔽 الفلترة المحدثة والأكثر أماناً: نعتمد مباشرة على الـ State الحالي للـ categories
  const activeCategoriesOnly = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    // فلترة الأقسام التي حالتها "Active" فقط بشكل مباشر وسريع جداً بدون قراءة الـ Storage مجدداً
    return categories.filter(cat => cat.status === "Active");
  }, [categories]);

  return {
    categories, // كاملة (نشط + مخفي) لصفحة الإدارة
    activeCategories: activeCategoriesOnly, // الأقسام النشطة فقط لواجهة المتجر وفورم إضافة المنتجات
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleStatus,
    refresh: loadCategories,
  };
}