import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useEffect, useRef, useContext } from "react";
import { SiteContext } from "../Store/SiteContext"; // 👈 تأكد من صحة مسار الـ Context عندك في الفولدرات
import ProductCard from "../Components/ProductUI/SmartProductCard";
import img from "../assets/images/logo1.png";

function CategoryPage({
  lang = "ar",
  query,
  scrollTrigger,
  addToWishlist,
  wishlistItems = [],
  addToCart,
  cartItems = [],
}) {
  const isArabic = lang === "ar";
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const productsGridRef = useRef(null);

 // 📥 سحب البيانات الحية من الـ Context
  const { adminData } = useContext(SiteContext);

  // 🛡️ حماية الـ References باستخدام useMemo لمنع إعادة الـ Render والكراش
  const categories = useMemo(() => adminData?.categories || [], [adminData?.categories]);
  const products = useMemo(() => adminData?.products || [], [adminData?.products]);

  // 1. البحث عن القسم الحالي (دلوقتي بقت آمنة تماماً والـ ESLint مش هيشتكي)
  const currentCategory = useMemo(
    () => categories.find((cat) => cat.id === parseInt(categoryId)),
    [categoryId, categories],
  );
  
  // 2. فلترة المنتجات بناءً على القسم وكلمة البحث
  const filteredCategoryProducts = useMemo(() => {
    const baseProducts = products.filter(
      (product) => product.categoryId === parseInt(categoryId),
    );
    const cleanedQuery = query ? query.trim().toLowerCase() : "";

    if (cleanedQuery === "") return baseProducts;

    return baseProducts.filter(
      (product) =>
        (product?.name?.ar?.toLowerCase() || "").includes(cleanedQuery) ||
        (product?.name?.en?.toLowerCase() || "").includes(cleanedQuery),
    );
  }, [categoryId, query, products]);

  // 3. التأثير عند طلب السكرول
  useEffect(() => {
    if (scrollTrigger && scrollTrigger > 0) {
      productsGridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [scrollTrigger]);

  if (!currentCategory) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          {isArabic ? "هذا القسم غير موجود" : "Category Not Found"}
        </h2>
        <Link
          to="/"
          className="bg-[#00a650] hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        >
          {isArabic ? "العودة للرئيسية" : "Back to Home"}
        </Link>
      </div>
    );
  }

  return (
    <div
      className="bg-[#f4f6f8] min-h-screen pb-16 pt-6"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-350 mx-auto px-3 sm:px-6">
        {/* هيدر الصفحة */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 mb-8 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-16 h-16 bg-linear-to-br from-green-50 to-gray-50 rounded-2xl p-2 flex items-center justify-center border border-gray-100">
              <img
                src={currentCategory.image || img}
                alt={
                  isArabic ? currentCategory.name.ar : currentCategory.name.en
                }
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = img;
                }}
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f]">
                {isArabic ? currentCategory.name.ar : currentCategory.name.en}
              </h1>
              <p className="text-[#00a650] text-xs font-bold mt-1">
                {filteredCategoryProducts.length}{" "}
                {isArabic ? "منتج متاح" : "Available Items"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-black border border-gray-200 transition-all active:scale-95 cursor-pointer"
          >
            {isArabic ? (
              <>
                <ArrowLeft size={16} /> <span>رجوع</span>
              </>
            ) : (
              <>
                <ArrowRight size={16} /> <span>Back</span>
              </>
            )}
          </button>
        </div>

        {/* شبكة المنتجات */}
        {filteredCategoryProducts.length > 0 ? (
          <div
            ref={productsGridRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 scroll-mt-24"
          >
            {filteredCategoryProducts.map((product, index) => (
              <div
                key={product.id}
                className="opacity-0 translate-y-4 animate-[slide-up_0.5s_ease-out_forwards]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard
                  product={product}
                  category={currentCategory}
                  lang={lang}
                  onAddToWishlist={addToWishlist}
                  isInWishlist={wishlistItems.some(
                    (item) => item.id === product.id,
                  )}
                  onAddToCart={addToCart}
                  cartItems={cartItems}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border-2 border-dashed border-gray-200 max-w-sm mx-auto">
            <p className="text-gray-400 font-bold">
              {isArabic
                ? "لا توجد منتجات مطابقة"
                : "No matching products found"}
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes slide-up { to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

export default CategoryPage;