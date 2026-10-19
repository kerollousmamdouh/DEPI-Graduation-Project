import { useMemo, useEffect, useRef, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { SiteContext } from "../Store/SiteContext";
import ProductCard from "../Components/ProductUI/SmartProductCard";
import { ArrowRight, Tag, Clock, Package, SlidersHorizontal } from "lucide-react";

function OfferPage({
  lang = "ar",
  query,
  scrollTrigger,
  addToWishlist,
  wishlistItems = [],
  addToCart,
  cartItems = [],
}) {
  const isArabic = lang === "ar";
  const topRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  const { adminData } = useContext(SiteContext);

  const categories = useMemo(() => adminData?.categories || [], [adminData?.categories]);
  const products = useMemo(() => adminData?.products || [], [adminData?.products]);

  useEffect(() => {
    const handleFormSubmit = (e) => {
      if (window.location.pathname.includes("offers")) {
        e.preventDefault();
      }
    };
    const searchForm = document.querySelector("form");
    if (searchForm) searchForm.addEventListener("submit", handleFormSubmit);
    return () => {
      if (searchForm) searchForm.removeEventListener("submit", handleFormSubmit);
    };
  }, []);

  // 1️⃣ استخراج وتصفية الأقسام التي تحتوي على عروض نشطة فقط ديناميكياً
  const activeOfferCategories = useMemo(() => {
    const now = new Date();
    
    const activeCatIds = products
      .filter((p) => {
        // إخفاء المنتج فوراً إذا كان مضافاً للسلة
        const isInCart = cartItems.some((item) => item.productId === p.id || item.id === p.id);
        if (isInCart) return false;

        // قراءة المتغيرات بصيغ مختلفة لضمان التوافق مع الباك إند
        const price = Number(p.price || 0);
        const offerPrice = Number(p.offerPrice || p.discount_price || p.discountPrice || 0);
        const oldPrice = Number(p.oldPrice || p.old_price || 0);

        const hasValidOfferPrice = offerPrice > 0 && price > offerPrice;
        const expiryDate = p.offerExpiresAt || p.offer_end_at || p.offerEndAt;
        const isOfferTimeValid = !expiryDate || now < new Date(expiryDate);
        
        const hasValidOffer = hasValidOfferPrice && isOfferTimeValid;
        const hasOldPrice = oldPrice > price;

        // التحقق الآمن من كمية العرض: لا نخفي المنتج إلا إذا كانت الكمية محددة فعلاً وتساوي 0
        const isStockOutOffer = p.offerUntilStockOut || p.offer_until_stock_out;
        const stockRemaining = p.offerStockRemaining ?? p.offer_stock_remaining;
        
        if (isStockOutOffer && stockRemaining !== undefined && Number(stockRemaining) <= 0) {
            return false;
        }

        // إخفاء تلقائي بمجرد انتهاء العرض وحذف السعر المخفض
        return hasValidOffer || hasOldPrice;
      })
      .map((p) => p.categoryId);

    return categories.filter((cat) => activeCatIds.includes(cat.id));
  }, [products, categories, cartItems]); // تمت إضافة cartItems للـ dependencies

  // 2️⃣ حساب المنتجات المعروضة بناءً على الفلاتر المختارة والبحث
  const offerProducts = useMemo(() => {
    const now = new Date();

    return products
      .filter((p) => {
        // إخفاء المنتج فوراً إذا كان مضافاً للسلة
        const isInCart = cartItems.some((item) => item.productId === p.id || item.id === p.id);
        if (isInCart) return false;

        const price = Number(p.price || 0);
        const offerPrice = Number(p.offerPrice || p.discount_price || p.discountPrice || 0);
        const oldPrice = Number(p.oldPrice || p.old_price || 0);

        const hasValidOfferPrice = offerPrice > 0 && price > offerPrice;
        const expiryDate = p.offerExpiresAt || p.offer_end_at || p.offerEndAt;
        const isOfferTimeValid = !expiryDate || now < new Date(expiryDate);
        
        const hasValidOffer = hasValidOfferPrice && isOfferTimeValid;
        const hasOldPrice = oldPrice > price;

        const isStockOutOffer = p.offerUntilStockOut || p.offer_until_stock_out;
        const stockRemaining = p.offerStockRemaining ?? p.offer_stock_remaining;
        
        // التحقق الآمن: إذا وصلت الكمية المخصصة للعرض للصفر، يختفي فوراً
        if (isStockOutOffer && stockRemaining !== undefined && Number(stockRemaining) <= 0) {
            return false;
        }

        const isAnyOffer = hasValidOffer || hasOldPrice;
        if (!isAnyOffer) return false;

        if (selectedCategory !== "all" && p.categoryId !== parseInt(selectedCategory)) {
          return false;
        }

        if (activeTab === "stock") return !expiryDate;
        if (activeTab === "time") {
          if (!expiryDate) return false;
          
          const expDateObj = new Date(expiryDate);
          const diffInMs = expDateObj - now;
          const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

          if (timeFilter === "today") return diffInDays <= 1;
          if (timeFilter === "week") return diffInDays <= 7;
          if (timeFilter === "month") return diffInDays <= 30;
          return true;
        }

        return true;
      })
      .filter((p) => {
        const cleanedQuery = query ? query.trim().toLowerCase() : "";
        if (cleanedQuery === "") return true;

        const nameAr = p?.name?.ar?.toLowerCase() || p?.name_ar?.toLowerCase() || "";
        const nameEn = p?.name?.en?.toLowerCase() || p?.name_en?.toLowerCase() || "";
        return nameAr.includes(cleanedQuery) || nameEn.includes(cleanedQuery);
      });
  }, [query, activeTab, selectedCategory, timeFilter, products, cartItems]); // تمت إضافة cartItems للـ dependencies

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [scrollTrigger]);

  return (
    <div
      ref={topRef}
      className="bg-[#f8fafc] min-h-screen pb-20 pt-6"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-350 mx-auto px-4 sm:px-6">
        
        <div className="bg-white rounded-3xl p-5 mb-6 border border-slate-100 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-[#00a650] hover:bg-green-50 transition-all active:scale-95 group"
            >
              <ArrowRight size={18} className={`transition-transform ${isArabic ? "group-hover:translate-x-0.5" : "rotate-180 group-hover:-translate-x-0.5"}`} />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                <span className="w-2 h-5 bg-[#00a650] rounded-full inline-block"></span>
                {isArabic ? "عروض التوفير" : "Super Savings & Offers"}
                <Tag size={16} className="text-[#00a650] animate-pulse" />
              </h1>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                {isArabic ? "أسعار مخفضة ومحدثة فورياً" : "Real-time discounted prices"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-500">{isArabic ? "العروض المتاحة:" : "Available Offers:"}</span>
            <span className="text-sm font-black text-[#00a650]">{offerProducts.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs sticky top-24 hidden lg:block">
            <h3 className="text-xs font-black text-slate-700 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#00a650]" />
              {isArabic ? "الأقسام المشمولة بالعروض" : "Categories with Offers"}
            </h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-start px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${selectedCategory === "all" ? "bg-green-50 text-[#00a650]" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {isArabic ? "كل العروض الحالية" : "All Current Offers"}
              </button>
              {activeOfferCategories.map((cat) => (
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

          <div className="lg:col-span-3">
            
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {["all", "stock", "time"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab !== "time") setTimeFilter("all"); 
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      activeTab === tab
                        ? "bg-[#00a650] border-[#00a650] text-white shadow-xs"
                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {tab === "stock" && <Package size={14} />}
                    {tab === "time" && <Clock size={14} />}
                    {isArabic
                      ? tab === "all" ? "كل العروض" : tab === "stock" ? "حتى نفاد الكمية" : "لفترة محدودة ⏳"
                      : tab === "all" ? "All Offers" : tab === "stock" ? "Until Out of Stock" : "Limited Time ⏳"}
                  </button>
                ))}
              </div>

              {activeTab === "time" && (
                <div className="flex items-center gap-2 bg-green-50/60 border border-green-100/50 p-2 rounded-xl mb-4 overflow-x-auto scrollbar-none animate-[fadeUp_0.15s_ease-out]">
                  <span className="text-[10px] font-black text-slate-400 whitespace-nowrap px-1">{isArabic ? "الوقت المتبقي:" : "Time Left:"}</span>
                  <div className="flex items-center gap-1">
                    {[
                      { id: "all", ar: "الكل", en: "All" },
                      { id: "today", ar: "تنتهي اليوم وغداً ", en: "Ends Today/Tomorrow" },
                      { id: "week", ar: "خلال أسبوع", en: "Within a week" },
                      { id: "month", ar: "خلال شهر", en: "Within a month" },
                    ].map((tOpt) => (
                      <button
                        key={tOpt.id}
                        onClick={() => setTimeFilter(tOpt.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                          timeFilter === tOpt.id
                            ? "bg-white text-[#00a650] border border-green-200 shadow-3xs font-black"
                            : "text-slate-500"
                        }`}
                      >
                        {isArabic ? tOpt.ar : tOpt.en}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-t border-slate-100 pt-3">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${selectedCategory === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  {isArabic ? "الكل" : "All"}
                </button>
                {activeOfferCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id.toString())}
                    className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${selectedCategory === cat.id.toString() ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600"}`}
                  >
                    {isArabic ? (cat.name.ar || cat.name.en) : (cat.name.en || cat.name.ar)}
                  </button>
                ))}
              </div>
            </div>

            {offerProducts.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
                {offerProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    category={categories.find((c) => c.id === product.categoryId)}
                    lang={lang}
                    onAddToWishlist={() => addToWishlist(product)}
                    isInWishlist={wishlistItems.some((i) => i.id === product.id)}
                    onAddToCart={addToCart}
                    cartItems={cartItems}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 max-w-sm mx-auto shadow-2xs">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-sm font-black text-slate-700 mb-1">
                  {isArabic ? "لا توجد عروض تطابق هذا الفلتر" : "No Offers Match This Filter"}
                </h3>
                <p className="text-[11px] text-slate-400 font-bold px-4">
                  {isArabic ? "جرب تغيير خيارات التصفية أو اختيار قسم آخر" : "Try changing filter settings or selecting another category"}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
      
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default OfferPage;