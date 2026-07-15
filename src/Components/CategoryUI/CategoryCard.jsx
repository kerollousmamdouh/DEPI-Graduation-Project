import { Link } from 'react-router-dom';
import fallbackImage from "../../assets/images/logo1.png";

function CategoryCard({ category, productCount, lang = 'ar' }) {
  // 1. تحديد الاسم ديناميكياً بناءً على اللغة (إذا لم يوجد الإنجليزي يعرض العربي كـ fallback)
  const categoryName = lang === 'ar' 
    ? (category.name?.ar || category.name?.en) 
    : (category.name?.en || category.name?.ar);
  
  // 2. الاتجاه (RTL للعربي فقط)
  const isRtl = lang === 'ar';
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);
  const isCurrentTextArabic = isArabic(categoryName);
  return (
    <Link 
      to={`/category/${category.id}`} 
      dir={isRtl ? 'rtl' : 'ltr'}
      className="block relative w-full group duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] select-none"
    >
      <div className="relative bg-linear-to-br from-[#f3faf6] via-[#f9fdfb] to-white border border-[#00a650]/15 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-center h-full z-10 transition-all duration-500 shadow-[0_4px_14px_-4px_rgba(0,166,80,0.06)] group-hover:scale-[1.03] group-hover:shadow-[0_20px_40px_-12px_rgba(0,166,80,0.25)] group-hover:border-[#00a650]/50 overflow-hidden">
        
        {/* هالة الضوء */}
        <div className="absolute -inset-10 bg-radial from-[#00a650]/12 via-[#00a650]/2 to-transparent opacity-40 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700 pointer-events-none z-0" />

        {/* بادج الخصم - مرن مع الاتجاه */}
        {category.hasOffer && (
          <div className={`absolute top-1 ${isRtl ? 'left-1' : 'right-1'} bg-red-500 text-white text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full z-20 shadow-[0_2px_6px_rgba(239,68,68,0.3)] tracking-wide`}>
            30%-
          </div>
        )}

        {/* الصورة */}
        <div className="relative mb-2 sm:mb-4 flex items-center justify-center w-11 h-11 sm:w-16 sm:h-16 bg-white border border-[#00a650]/10 rounded-lg sm:rounded-2xl transition-all duration-500 shadow-sm group-hover:scale-110 z-10">
          <img 
            src={category?.image || fallbackImage}
            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
            alt={categoryName} 
            className="w-full h-full object-contain p-1" 
          />
        </div>
        
        {/* اسم القسم */}
        <h3 className="font-extrabold text-[#1a382b] group-hover:text-[#00a650] text-[10px] sm:text-sm text-center mb-1 sm:mb-2 line-clamp-1 w-full transition-all duration-300 z-10">
          {categoryName}
        </h3>
        
        {/* العداد - نص ديناميكي يتغير حسب قيمة lang */}
        <span className="inline-block bg-[#e8f6f0] text-[#00a650] font-bold text-[8px] sm:text-[11px] px-2.5 py-0.5 rounded-full z-10">
          {productCount > 0 ? productCount : 0} {isCurrentTextArabic ? 'منتج' : 'Items'}
        </span>
      </div>
    </Link>
  );
}

export default CategoryCard;