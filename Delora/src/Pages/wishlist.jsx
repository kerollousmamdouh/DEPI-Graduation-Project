import { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// 1️⃣ استيراد الـ Context كمصدر وحيد لبيانات الـ categories
import { SiteContext } from '../Store/SiteContext'; 
import SmartProductCard from '../Components/ProductUI/SmartProductCard';

function WishlistPage({ 
  wishlistItems = [], 
  addToWishlist, 
  addToCart, 
  cartItems = [], 
  lang = 'ar' 
}) {
  const isRtl = lang === 'ar';

  // 2️⃣ استدعاء الـ adminData من الـ Context
  const { adminData } = useContext(SiteContext);

  // 3️⃣ حماية مصفوفة الأقسام وضمان ثبات الـ Reference لمنع تعارض الـ Compiler
  const categoriesList = useMemo(() => {
    return Array.isArray(adminData?.categories) ? adminData.categories : [];
  }, [adminData]); // تمرير الكائن الأب بالكامل لتفادي مشاكل الـ Optional Chaining في الـ Dependencies

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        
        {/* الهيدر الأنيق */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-3 rounded-2xl">
              <Heart className="text-red-500 fill-red-500" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1e3a5f]">
                {isRtl ? "قائمتك المميزة" : "Your Wishlist"}
              </h1>
              <p className="text-xs text-gray-400 font-bold">
                {wishlistItems.length} {isRtl ? "منتج محفوظ" : "items saved"}
              </p>
            </div>
          </div>
          <Link 
            to="/home" 
            className="bg-[#1e3a5f] text-white p-3 rounded-2xl transition-all duration-200 active:scale-90 shadow-md"
          >
            <X size={20} />
          </Link>
        </motion.div>

        {/* حالة القائمة الفارغة أو عرض المنتجات */}
        <AnimatePresence mode="wait">
          {wishlistItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 px-6"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-50"></div>
                <div className="relative bg-white p-6 rounded-full shadow-lg">
                  <Heart size={48} className="text-red-400 fill-red-200" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-[#1e3a5f] mb-2">
                {isRtl ? "القائمة خالية حالياً" : "Wishlist is empty"}
              </h2>
              <p className="text-gray-400 font-medium text-center max-w-62.5 mb-8">
                {isRtl ? "استكشف منتجاتنا الرائعة وأضفها لمجموعتك الخاصة!" : "Explore our amazing products and add them to your collection!"}
              </p>
              <Link 
                to="/home" 
                className="bg-[#1e3a5f] text-white px-8 py-3 rounded-full font-bold hover:bg-[#00a650] transition-all shadow-lg"
              >
                {isRtl ? "ابدأ التسوق الآن" : "Start Shopping"}
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
            >
              {wishlistItems.map((product) => (
                <motion.div 
                  layout
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm transition-all"
                >
                  <SmartProductCard 
                    product={product} 
                    category={categoriesList.find(c => c.id === product.categoryId)}
                    lang={lang} 
                    onAddToWishlist={() => addToWishlist(product)}
                    isInWishlist={true}
                    onAddToCart={addToCart}
                    cartItems={cartItems}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default WishlistPage;