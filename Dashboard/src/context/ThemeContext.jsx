import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

/**
 * ThemeProvider
 * يدير حالة الوضع الداكن (dark mode) لكل التطبيق، ويحفظ الاختيار في
 * localStorage عشان يفضل محفوظ لما المستخدم يرجع تاني، ويحترم كمان
 * إعداد نظام التشغيل (prefers-color-scheme) كقيمة افتراضية.
 */
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem("dealora-theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("dealora-theme", isDark ? "dark" : "light");
    } catch {
      // localStorage غير متاح (مثلاً وضع تصفح خاص) — نتجاهل الخطأ بأمان
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
