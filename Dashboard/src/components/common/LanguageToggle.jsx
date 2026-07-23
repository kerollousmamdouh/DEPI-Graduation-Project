import { useLanguage } from "../../context/LanguageContext";

/**
 * LanguageToggle — زرار "ترجمة" عام لكل الموقع.
 *
 * 🌟 الترجمة هنا بتحصل بس لما المستخدم يدوس الزرار ده بنفسه (toggleLanguage
 * جوه الـ LanguageContext مش بتتنفذ إلا من هنا). لما يتدوس، اللغة بتتغير
 * لكل الصفحات والكومبوننتات اللي بتستخدم useLanguage() فورًا — يعني ترجمة
 * شاملة لكل الموقع مش مقتصرة على صفحة معينة.
 */
export default function LanguageToggle() {
  const { lang, toggleLanguage, t } = useLanguage();
  const nextLangLabel = lang === "ar" ? "English" : "العربية";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={t("translate")}
      aria-label={t("translate")}
      className="group flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border border-[rgb(0,166,62)]/30 text-[rgb(0,166,62)] bg-[rgb(0,166,62)]/5 hover:bg-[rgb(0,166,62)] hover:text-white hover:border-[rgb(0,166,62)] transition-colors duration-200"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0"
      >
        <path
          d="M4 5h7M7.5 3v2M10 5c-.5 3-2 5.5-4.5 7M6 8.5c1 1.5 2.5 2.5 4 3M13 21l4-9 4 9M14.5 18h5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="hidden sm:inline">{t("translate")}</span>
      <span className="hidden sm:inline text-xs font-normal opacity-70 group-hover:opacity-90">
        ({nextLangLabel})
      </span>
      <span className="sm:hidden">{lang === "ar" ? "EN" : "AR"}</span>
    </button>
  );
}
