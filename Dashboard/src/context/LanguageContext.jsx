import { createContext, useContext, useEffect, useState } from "react";
import en from "../translation/en";
import ar from "../translation/ar";

const translations = { en, ar };

const LanguageContext = createContext(null);

/**
 * LanguageProvider
 * يدير لغة الواجهة الحالية (en/ar)، يحفظها في localStorage، ويضبط
 * اتجاه الصفحة (dir="rtl") تلقائيًا عند اختيار العربية.
 * يوفّر دالة t(key) لترجمة أي نص مُعرّف في src/i18n/translations.js
 */
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("dealora-lang") || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("dealora-lang", lang);
    } catch {
      // localStorage غير متاح — نتجاهل بأمان
    }
  }, [lang]);

  const toggleLanguage = () => setLang((prev) => (prev === "en" ? "ar" : "en"));

  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key;

  return (
    <LanguageContext.Provider
      value={{ lang, isRTL: lang === "ar", setLang, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
