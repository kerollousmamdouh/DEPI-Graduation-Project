import { useLanguage } from "../../context/LanguageContext";

function formatPrice(value) {
  const num = Number(value) || 0;
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
}

export default function ProductCard({
  id,
  name,
  price,
  discount = 0,
  unit = "kg",
  stock = 0,
  category,
  images = [],
  discountDetails = null,
  onEdit = () => {},
  onDelete = () => {},
  canEdit = true,
  canDelete = true,
}) {
  const { lang } = useLanguage();

  const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;
  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock < 5;

  const getUnitLabel = () => {
    if (unit === "kg") return lang === "ar" ? "كيلو" : "kg";
    if (unit === "g") return lang === "ar" ? "جم" : "g";
    return lang === "ar" ? "قطعة" : "pcs";
  };

  const isOfferExpired = () => {
    if (discountDetails?.type === "date" && discountDetails?.expiryDate) {
      return new Date() > new Date(discountDetails.expiryDate);
    }
    return false;
  };

  const hasActiveDiscount = discount > 0 && !isOfferExpired();

  // معالجة عرض اسم المنتج بسلاسة
  const displayName = typeof name === "object" ? (name[lang] || name.ar || name.en) : name;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md h-full min-w-0">
      
      {/* القسم العلوي: الصورة والشارات */}
      <div>
        <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-gray-50">
          
          {/* شارات الخصومات والعروض */}
          {hasActiveDiscount && (
            <div className="absolute top-1.5 ltr:left-1.5 rtl:right-1.5 z-10 flex flex-col gap-0.5 items-start">
              <span className="bg-[rgb(0,166,62)] text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md shadow-sm">
                -{discount}%
              </span>
              {discountDetails?.type === "stock" && discountDetails?.offerStockQty > 0 && (
                <span className="bg-amber-500 text-white text-[8px] sm:text-[9px] font-semibold px-1 sm:px-1.5 py-0.5 rounded-md shadow-sm">
                  {lang === "ar" ? `متبقي ${discountDetails.offerStockQty}` : `${discountDetails.offerStockQty} left`}
                </span>
              )}
            </div>
          )}
          
          {/* شارة حالة المخزون */}
          {isOutOfStock ? (
            <span className="absolute top-1.5 ltr:right-1.5 rtl:left-1.5 z-10 bg-red-600/90 backdrop-blur-md text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md">
              {lang === "ar" ? "نفدت" : "Out"}
            </span>
          ) : isLowStock && (
            <span className="absolute top-1.5 ltr:right-1.5 rtl:left-1.5 z-10 bg-amber-500/90 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-md">
              {lang === "ar" ? "محدود" : "Low"}
            </span>
          )}

          <img
            src={images[0] || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80"}
            alt={displayName}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* تفاصيل المنتج الأساسية */}
        <div className="p-2 sm:p-3">
          <h3 className="font-bold text-gray-900 text-[11px] sm:text-sm line-clamp-1 leading-tight" title={displayName}>
            {displayName}
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-1">
            {category && (
              <span className="inline-block text-[9px] sm:text-[10px] font-semibold text-[rgb(0,166,62)] bg-[rgb(0,166,62)]/10 px-1.5 py-0.5 rounded-md truncate max-w-full">
                {category}
              </span>
            )}

            <span className="text-[9px] sm:text-[10px] font-medium text-gray-400 truncate">
              {lang === "ar" ? `${stock} ${getUnitLabel()}` : `${stock} ${getUnitLabel()}`}
            </span>
          </div>

          <div className="mt-1.5 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-gray-100 flex items-baseline gap-1 flex-wrap">
            {hasActiveDiscount && (
              <span className="text-[9px] sm:text-[11px] text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            )}
            <span className="text-xs sm:text-base font-extrabold text-gray-900">
              {formatPrice(finalPrice)}{" "}
              <span className="text-[8px] sm:text-[10px] font-normal text-gray-500">
                ج.م
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* شريط الإجراءات والتحكم */}
      {(canEdit || canDelete) && (
        <div
          className={`p-1.5 sm:p-2 pt-0 grid gap-1 border-t border-gray-50 ${
            canEdit && canDelete ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {canEdit && (
            <button
              onClick={() => onEdit(id)}
              className="flex items-center justify-center gap-0.5 sm:gap-1 py-1 sm:py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition"
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              <span>{lang === "ar" ? "تعديل" : "Edit"}</span>
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(id)}
              className="flex items-center justify-center gap-0.5 sm:gap-1 py-1 sm:py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition"
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              <span>{lang === "ar" ? "حذف" : "Delete"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
