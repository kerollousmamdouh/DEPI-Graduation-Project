import { useContext } from "react";
import { SiteContext } from "../../Store/SiteContext"; // 👈 الاستيراد الصحيح

const LanguageToggle = ({ lang, setLang }) => {
  const { adminData } = useContext(SiteContext); // 👈 استخدام Context وليس Provider

  // إذا كانت الخاصية غير موجودة أو false، لن يظهر الزر
  if (!adminData?.isMultiLanguage) return null;  return (
    <button
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      className="relative flex items-center justify-center w-11 h-11 rounded-2xl text-gray-500 hover:text-[#00a650] bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-green-100 transition-all duration-300 shadow-2xs hover:shadow-md hover:shadow-green-100/50 active:scale-95 font-black text-[10px] sm:text-xs tracking-wider"
    >
      {lang === 'ar' ? 'EN' : 'AR'}
    </button>
  );
};

export default LanguageToggle;