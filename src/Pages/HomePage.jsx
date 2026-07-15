import { useMemo, useEffect, useRef, useContext } from "react";
import { SiteContext } from "../Store/SiteContext"; // 👈 إدخال الـ Context بتاعك
import CategoriesSection from "../Components/CategoryUI/CategorySection";
import ProductCard from "../Components/ProductUI/SmartProductCard";
import HeroSlider from "../Components/HeroSliderUI/HeroSliderPage";

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

  // 📥 سحب البيانات الحية من الـ Context
  const { adminData } = useContext(SiteContext);

  // 🛡️ تغليف الـ initialization في useMemo لحل إيرور الـ exhaustive-deps
  const categories = useMemo(() => adminData?.categories || [], [adminData?.categories]);
  const products = useMemo(() => adminData?.products || [], [adminData?.products]);
  // 🎲 نفس كود الخلط بتاعك بالظبط مع حمايته بـ useMemo والـ eslint-disable
  const randomizedProducts = useMemo(() => {
    let array = [...products];
    for (let i = array.length - 1; i > 0; i--) {
      // eslint-disable-next-line react-hooks/purity
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
        // حماية: التأكد من وجود الاسم قبل محاولة تحويله لـ lowerCase
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
      <div className="container mx-auto px-2 pt-4 sm:pt-6">
        <HeroSlider lang={lang}/>
      </div>

      <CategoriesSection lang={lang} />

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
                  onAddToWishlist={addToWishlist}
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