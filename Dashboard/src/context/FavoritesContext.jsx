import React, { createContext, useContext, useEffect, useState } from "react";

const FavoritesContext = createContext(null);

/**
 * FavoritesProvider
 * يدير قائمة المنتجات المفضّلة (بالـ id) في كل التطبيق، ويحفظها في
 * localStorage عشان تفضل محفوظة بين الزيارات. أي كومبوننت (زي ProductCard
 * في صفحة Products) بيقدر يضيف/يشيل منتج من المفضلة، وصفحة Favorites
 * بتعرض المنتجات اللي فيها.
 */
export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const stored = localStorage.getItem("dealora-favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("dealora-favorites", JSON.stringify(favoriteIds));
    } catch {
      // localStorage غير متاح — نتجاهل بأمان
    }
  }, [favoriteIds]);

  const isFavorite = (id) => favoriteIds.includes(id);

  const toggleFavorite = (id) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
