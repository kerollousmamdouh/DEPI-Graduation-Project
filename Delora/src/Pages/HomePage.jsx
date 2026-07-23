import { useMemo, useEffect, useRef, useContext, useState } from "react";
import { SiteContext } from "../Store/SiteContext";
import { Link, useLocation } from "react-router-dom";
import CategoriesSection from "../Components/CategoryUI/CategorySection";
import ProductCard from "../Components/ProductUI/SmartProductCard";
import HeroSlider from "../Components/HeroSliderUI/HeroSliderPage";
import { Flame, CheckCircle } from "lucide-react";

function HomePage({
  lang = "ar",
  query,
  scrollTrigger,
  addToWishlist,
  wishlistItems = [],
  addToCart,
  cartItems = [],
}) {
  const isArabic = lang === "ar";
  const productsSectionRef = useRef(null);
  const location = useLocation();
  const [showOrderSuccess, setShowOrderSuccess] = useState(
    !!location.state?.orderSuccess
  );

  useEffect(() => {
    if (showOrderSuccess) {
      const t = setTimeout(() => setShowOrderSuccess(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showOrderSuccess]);

  const { adminData } = useContext(SiteContext);

  const categories = useMemo(
    () => adminData?.categories || [],
    [adminData?.categories],
  );
  const products = useMemo(
    () => adminData?.products || [],
    [adminData?.products],
  );

  const onSaleProducts = useMemo(
    () => products.filter((p) => p.offerPrice && p.offerPrice > 0 && p.offerPrice < p.price).slice(0, 12),
    [products],
  );

  const randomizedProducts = useMemo(() => {
    let array = [...products];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const cleanedQuery = query ? query.trim().toLowerCase() : "";

    if (cleanedQuery === "") {
      return randomizedProducts.slice(0, 20);
    }

    return randomizedProducts
      .filter((product) => {
        const nameAr = product?.name?.ar?.toLowerCase() || "";
        const nameEn = product?.name?.en?.toLowerCase() || "";
        return nameAr.includes(cleanedQuery) || nameEn.includes(cleanedQuery);
      })
      .slice(0, 20);
  }, [query, randomizedProducts]);

  useEffect(() => {
    if (scrollTrigger && scrollTrigger > 0) {
      productsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [scrollTrigger]);

  return (
    <div
      className="bg-gray-50 min-h-screen pb-10"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {showOrderSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm border border-emerald-400 flex items-center gap-2 animate-bounce">
          <CheckCircle size={18} />
          {isArabic ? "تم تسجيل طلبك بنجاح! 🎉" : "Your order has been placed successfully! 🎉"}
        </div>
      )}
      <div className="container mx-auto px-2 pt-4 sm:pt-6">
        <HeroSlider lang={lang} />
      </div>

      <CategoriesSection lang={lang} />

      {onSaleProducts.length > 0 && (
        <section className="container mx-auto px-2 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="text-red-500" size={22} />
              <h2 className="text-xl font-bold text-gray-800">
                {isArabic ? "عروض وخصومات" : "Deals & Offers"}
              </h2>
            </div>
            <Link
              to="/offers"
              className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
            >
              {isArabic ? "عرض الكل" : "View All"} →
            </Link>
          </div>

          <div className="overflow-x-auto pb-2 -mx-2 px-2">
            <div className="flex gap-2 sm:gap-3" style={{ minWidth: "min-content" }}>
              {onSaleProducts.map((product) => {
                const productCategory = categories.find(
                  (cat) => cat.id === product.categoryId,
                );
                const discount = product.price > 0
                  ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
                  : 0;
                return (
                  <div key={product.id} className="relative min-w-[140px] sm:min-w-[160px] flex-shrink-0">
                    {discount > 0 && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        -{discount}%
                      </div>
                    )}
                    <ProductCard
                      product={product}
                      category={productCategory}
                      lang={lang}
                      onAddToWishlist={() => addToWishlist(product)}
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
          </div>
        </section>
      )}

      <section
        ref={productsSectionRef}
        className="container mx-auto px-2 py-6 scroll-mt-20"
      >
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {isArabic ? "اقتراحات تهمك" : "Recommended for You"}
          </h2>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-1 sm:gap-3">
            {filteredProducts.map((product) => {
              const productCategory = categories.find(
                (cat) => cat.id === product.categoryId,
              );
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={productCategory}
                  lang={lang}
                  onAddToWishlist={() => addToWishlist(product)}
                  isInWishlist={wishlistItems.some(
                    (item) => item.id === product.id,
                  )}
                  onAddToCart={addToCart}
                  cartItems={cartItems}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-red-500">
              {isArabic ? "نأسف لعدم توافر المنتج" : "Sorry, product not found"}
            </h3>
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
