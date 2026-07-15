import { useState, useRef, useEffect, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { LayoutGrid, ChevronDown } from "lucide-react";
import { SiteContext } from "../../Store/SiteContext"; // 👈 تأكد من صحة مسار الـ Context عندك

const Links = ({ lang = "ar" }) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // 📥 سحب البيانات مباشرة من الـ Context بديل الملف الثابت
  const { adminData } = useContext(SiteContext);
  const categories = adminData?.categories || [];
  
   useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🌟 الستايل المودرن الجديد
  const getNavLinkClass = ({ isActive }) =>
    `transition-all duration-300 px-4 py-1.5 rounded-xl text-sm md:text-base font-bold whitespace-nowrap ${
      isActive
        ? "bg-green-50 text-[#00a650] border border-green-100/30 shadow-2xs"
        : "text-slate-600 hover:text-[#00a650] hover:bg-slate-50"
    }`;

  return (
    <div className="border-t border-gray-100 bg-white w-full relative z-40">
      <div className="container mx-auto px-4 py-3 md:relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 min-h-14">
        

        {/* 1. زرار الأقسام */}
        <div className="relative w-full md:w-64 z-50" ref={dropdownRef}>
          <button
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            className="w-full bg-[#00a650] hover:bg-green-600 text-white px-4 py-2.5 rounded-md flex items-center justify-between transition shadow-sm text-sm cursor-pointer"
          >
            <div className="flex items-center gap-2 font-medium">
              <LayoutGrid size={18} />
              <span className="whitespace-nowrap">All Categories</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${isCategoriesOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* القائمة المنسدلة */}
          {isCategoriesOpen && (
            <div 
              className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 shadow-2xl rounded-md py-2 z-50 max-h-[70vh] overflow-y-auto"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              {categories.map((category) => {
                // اختيار الاسم بناءً على اللغة الحالية مع وجود البديل الاحتياطي
                const displayName = lang === "ar"
                  ? (category.name.ar || category.name.en)
                  : (category.name.en || category.name.ar);

                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    // التحكم في محاذاة النص ديناميكياً بناءً على اللغة
                    className={`block px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-[#00a650] transition text-sm font-medium border-b border-gray-50 last:border-0 ${
                      lang === "ar" ? "text-right" : "text-left"
                    }`}
                    onClick={() => setIsCategoriesOpen(false)}
                  >
                    {displayName}
                  </Link>
                );
              })}
            </div>
          )}
        </div>


        {/* 2. روابط التنقل */}
        <nav className="md:absolute md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center gap-4 md:gap-6 w-full md:w-auto py-1">
          <NavLink to="/home" className={getNavLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/products" className={getNavLinkClass}>
            Products
          </NavLink>
          <NavLink to="/offers" className={getNavLinkClass}>
            Offers %
          </NavLink>
        </nav>

        {/* 3. مساحة وهمية */}
        <div className="hidden md:block w-37.5 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Links;