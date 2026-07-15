import { useMemo, useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
// 1️⃣ الاعتماد الكلي على الـ Context كمصدر وحيد للبيانات (تم حذف الـ Import الثابت للـ categories)
import { SiteContext } from "../Store/SiteContext"; 
import ProductCard from "../Components/ProductUI/SmartProductCard";
import {
  Grid3X3,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";

function ProductPage({
  lang = "ar",
  query,
  scrollTrigger,
  addToWishlist,
  wishlistItems = [],
  addToCart,
  cartItems = [],
}) {
  const isArabic = lang === "ar";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [gridCols, setGridCols] = useState("dynamic");
  const topRef = useRef(null);

  // 2️⃣ استدعاء البيانات مباشرة من الـ Context
  const { adminData } = useContext(SiteContext);

  // 3️⃣ استخراج وحماية مصفوفات المنتجات والأقسام لضمان ثبات الـ References
const categories = useMemo(() => {
  return Array.isArray(adminData?.categories) ? adminData.categories : [];
}, [adminData]); // 👈 مرر الكائن الأب هنا بالكامل لمنع الـ syntax error

const allAvailableProducts = useMemo(() => {
  return Array.isArray(adminData?.products) ? adminData.products : [];
}, [adminData]); // 👈 نفس الكلام هنا
  // 4️⃣ الفلترة والترتيب بناءً على منتجات الـ Context
  const processedProducts = useMemo(() => {
    let result = [...allAvailableProducts];
    
    // أ) التصفية حسب القسم الجانبي
    if (selectedCategory !== "all") {
      result = result.filter(
        (p) => p.categoryId === parseInt(selectedCategory),
      );
    }

    // ب) التصفية اللحظية بحروف البحث
    const cleanedQuery = query ? query.trim().toLowerCase() : "";
    if (cleanedQuery !== "") {
      result = result.filter((p) => {
        const nameObj = p?.name || {};
        const productName = lang === 'ar' 
          ? (nameObj.ar || nameObj.en || '') 
          : (nameObj.en || nameObj.ar || '');
        return productName.toLowerCase().includes(cleanedQuery);
      });
    }

    // ج) الترتيب حسب السعر
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategory, query, sortBy, lang, allAvailableProducts]);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedCategory, scrollTrigger]);
    
  return (
    <div
      ref={topRef}
      className="bg-[#f8fafc] min-h-screen pb-16 pt-4"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-350 mx-auto px-3 sm:px-6">
        {/* 🏢 الجزء العلوي: العنوان وعناصر التحكم */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 mb-6 border border-slate-100 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* زر الرجوع للهوم + العنوان */}
          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:text-[#00a650] hover:bg-green-50 hover:border-green-200 transition-all active:scale-95 group"
              title={isArabic ? "العودة للرئيسية" : "Back to Home"}
            >
              <ArrowRight
                size={18}
                className={`stroke-[2.2] transition-transform duration-200 ${isArabic ? "group-hover:translate-x-0.5" : "rotate-180 group-hover:-translate-x-0.5"}`}
              />
            </Link>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-[#00a650] rounded-full inline-block"></span>
                {isArabic ? "كل المنتجات" : "All Products"}
              </h1>
              <p className="text-xs font-bold text-slate-400 mt-0.5">
                {isArabic
                  ? `تم العثور على ${processedProducts.length} منتج`
                  : `Found ${processedProducts.length} products`}
              </p>
            </div>
          </div>

          {/* أدوات التصفية والترتيب والشكل */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600">
              <ArrowUpDown size={14} className="me-2 text-[#00a650]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer pr-1"
              >
                <option value="default">
                  {isArabic ? "الترتيب الافتراضي" : "Default Sorting"}
                </option>
                <option value="price-low">
                  {isArabic ? "السعر: من الأقل للأعلى" : "Price: Low to High"}
                </option>
                <option value="price-high">
                  {isArabic ? "السعر: من الأعلى للأقل" : "Price: High to Low"}
                </option>
              </select>
            </div>

            <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
              <button
                onClick={() => setGridCols("dynamic")}
                className={`p-1.5 rounded-lg transition-all ${gridCols === "dynamic" ? "bg-white text-[#00a650] shadow-2xs" : "text-slate-400 hover:text-slate-600"}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setGridCols("compact")}
                className={`p-1.5 rounded-lg transition-all ${gridCols === "compact" ? "bg-white text-[#00a650] shadow-2xs" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 🗂️ التقسيم الرئيسي */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* البار الجانبي للفلاتر */}
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs sticky top-24 hidden lg:block">
            <h3 className="text-sm font-black text-slate-700 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-[#00a650]" />
              {isArabic ? "تصفية حسب الأقسام" : "Filter by Categories"}
            </h3>

            <div className="flex flex-col gap-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-start px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${selectedCategory === "all" ? "bg-green-50 text-[#00a650]" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {isArabic ? "جميع الأقسام" : "All Categories"}
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id.toString())}
                  className={`w-full text-start px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 flex items-center justify-between ${selectedCategory === cat.id.toString() ? "bg-green-50 text-[#00a650]" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  <span>{isArabic ? (cat.name.ar || cat.name.en) : (cat.name.en || cat.name.ar)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* فلاتر سريعة للموبايل */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-3 px-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedCategory === "all" ? "bg-[#00a650] text-white border-[#00a650]" : "bg-white border-slate-200 text-slate-600"}`}
            >
              {isArabic ? "الكل" : "All"}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedCategory === cat.id.toString() ? "bg-[#00a650] text-white border-[#00a650]" : "bg-white border-slate-200 text-slate-600"}`}
              >
                {isArabic ? (cat.name.ar || cat.name.en) : (cat.name.en || cat.name.ar)}
              </button>
            ))}
          </div>

          {/* 🛍️ شبكة عرض المنتجات */}
          <div className="lg:col-span-3">
            {processedProducts.length > 0 ? (
              <div
                className={`grid gap-2 sm:gap-4 transition-all duration-300 ${
                  gridCols === "dynamic"
                    ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5"
                    : "grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6"
                }`}
              >
                {processedProducts.map((product, index) => {
                  const productCategory = categories.find(
                    (cat) => cat.id === product.categoryId,
                  );
                  return (
                    <div
                      key={product.id}
                      className="opacity-0 translate-y-3 animate-[fadeUp_0.3s_ease-out_forwards]"
                      style={{
                        animationDelay: `${Math.min(index * 12, 200)}ms`,
                      }}
                    >
                      <ProductCard
                        product={product}
                        category={productCategory}
                        lang={lang}
                        onAddToWishlist={addToWishlist}
                        isInWishlist={wishlistItems.some(
                          (item) => item.id === product.id,
                        )}
                        onAddToCart={addToCart}
                        cartItems={cartItems}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 px-4 bg-white rounded-3xl border border-slate-100 max-w-md mx-auto shadow-2xs">
                <div className="text-5xl mb-4 text-slate-300">🔍</div>
                <h3 className="text-lg font-black text-slate-700 mb-1">
                  {isArabic ? "لم نجد أي منتجات مطابقة" : "No Matching Products"}
                </h3>
                <p className="text-xs text-slate-400 font-bold">
                  {isArabic
                    ? "تأكد من إضافة منتجات من لوحة التحكم أولاً ليتم عرضها هنا."
                    : "Make sure to add products from the dashboard first to display them here."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default ProductPage;