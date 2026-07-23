import { useCallback, useEffect, useState } from "react";
import { heroSliderService } from "../services/heroSliderService";

export function useHeroSlider() {
  const [slides, setSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const [slidesData, categoriesData] = await Promise.all([
        heroSliderService.getSlides(),
        heroSliderService.getCategories(),
      ]);
      setSlides(slidesData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load hero slider.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addSlide = async (data) => {
    try {
      await heroSliderService.addSlide(data);
      await loadData(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateSlide = async (id, data) => {
    try {
      await heroSliderService.updateSlide(id, data);
      await loadData(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteSlide = async (id) => {
    try {
      await heroSliderService.deleteSlide(id);
      await loadData(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const toggleStatus = async (id, status) => {
    try {
      await heroSliderService.toggleStatus(id, status);
      await loadData(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const changePriority = async (id, newPriority) => {
    try {
      await heroSliderService.changePriority(id, newPriority);
      await loadData(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
  slides, // المصفوفة كاملة (Active + Hidden) لصفحة الإدارة بتاعتك
  // 👈 الميزة الجديدة: مصفوفة مصفاة جاهزة للـ Home Page بره ومترتبة بالـ Priority
  activeSlides: slides
    .filter((slide) => slide.status === "Active")
    .sort((a, b) => a.priority - b.priority), 
  categories, 
  loading,
  error,
  addSlide,
  updateSlide,
  deleteSlide,
  toggleStatus,
  changePriority,
  refresh: loadData,
};
}