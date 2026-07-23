import { useState } from "react";
import { createPortal } from "react-dom";
import fallbackImage from "../../assets/images/logo1.png";
import { Heart, Plus, ShoppingCart, Clock, Package } from "lucide-react";

function SmartProductCard({
  product,
  category,
  onAddToWishlist,
  isInWishlist = false,
  onAddToCart,
  cartItems = [],
  lang = 'ar',
}) {
  const isWeightType = product?.unitType === "weight" || category?.type === "weight";
   const isRtl = lang === 'ar';
  // 1. حساب الكليات المحجوزة في السلة (بالعدد أو الجرامات)
  const productName = lang === 'ar' 
    ? (product?.name?.ar || product?.name?.en) 
    : (product?.name?.en || product?.name?.ar);
  
  const categoryName = lang === 'ar' 
    ? (category?.name?.ar || category?.name?.en) 
    : (category?.name?.en || category?.name?.ar);


  const totalQuantityInCart = cartItems
    .filter((item) => item.id === product.id)
    .reduce((total, item) => {
      if (isWeightType) {
        return total + (item.weightGrams || 0);
      }
      return total + item.quantity;
    }, 0);

  // المخزون الكلي الفعلي المتبقي للبيع (بالعدد أو بالجرام)
  const currentStock = (product?.stock || 0) - totalQuantityInCart;

  // 2. حساب الكميات المستهلكة من مخزون العرض والموجودة في السلة حالياً
  const offerQuantityInCart = cartItems
    .filter((item) => item.id === product.id && item.isOfferItem === true)
    .reduce((total, item) => {
      if (isWeightType) {
        return total + (item.weightGrams || 0);
      }
      return total + item.quantity;
    }, 0);

  // مخزون العرض المتبقي حالياً (بالعدد أو بالجرام)
  const remainingOfferStock = Math.max(0, (product?.offerStock || 0) - offerQuantityInCart);

  // 3. الفحص الصارم: هل العرض متاح منه أي كمية أو وقت حالياً؟
  const hasOffer = (() => {
    const hasValidPrices =
      product?.offerPrice &&
      Number(product.offerPrice) > 0 &&
      Number(product.price) > Number(product.offerPrice);

    if (!hasValidPrices) return false;

    // أ) الفحص الزمني + فحص نفاد المخزن الكلي أثناء العرض الزمني
    if (product?.offerExpiresAt) {
      const expirationDate = new Date(product.offerExpiresAt);
      
      // 1. لو العرض بوقت وانتهى زمنياً -> يسقط العرض فوراً
      if (new Date() >= expirationDate) return false;
      
      // 2. لو العرض بوقت ولكن بضاعة المحل الإجمالية خلصت بالكامل -> يسقط العرض فوراً
      if (product.stock !== undefined && currentStock <= 0) {
        return false;
      }
      
      // طالما الوقت ساري والمخزن الكلي فيه بضاعة، العرض شغال وبدون ليميت لمخزن العرض
      return true;
    }

    // ب) الفحص الكمي للعروض العادية (حتى نفاد الكمية - التي ليس لها تاريخ انتهاء)
    if (product?.offerStock !== undefined && remainingOfferStock <= 0) {
      return false;
    }

    return true;
  })();
  const discountPercentage = hasOffer
    ? Math.round(((Number(product.price) - Number(product.offerPrice)) / Number(product.price)) * 100)
    : 0;

  // الحالات المحلية
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [weightInput, setWeightInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [error, setError] = useState("");

  const handleOpenModal = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentStock <= 0) {
      alert("عفواً، نفدت الكمية بالكامل من هذا المنتج");
      return;
    }

    setQuantity(1);
    setWeightInput("");
    setPriceInput("");
    setError("");
    setIsModalOpen(true);
  };

  const handleWeightChange = (val) => {
    const cleanVal = val.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
    setWeightInput(cleanVal);
    setPriceInput("");

    const grams = parseFloat(cleanVal);
    if (grams > currentStock) {
      setError(`⚠️ الوزن المطلوب أكبر من المخزون الإجمالي المتاح (${currentStock.toFixed(2)} جرام)`);
    } else {
      setError("");
    }
  };

  const handlePriceChange = (val) => {
    const cleanVal = val.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
    setPriceInput(cleanVal);
    setWeightInput("");

    const targetPrice = parseFloat(cleanVal);
    const unitPrice = hasOffer ? Number(product.offerPrice) : Number(product.price);
    if (targetPrice && unitPrice) {
      const calculatedGrams = (targetPrice / unitPrice) * 1000;
      if (calculatedGrams > currentStock) {
        setError(`⚠️ هذا المبلغ يتجاوز الوزن الإجمالي المتاح في المحل!`);
        return;
      }
    }
    setError("");
  };

  const handleAddToCart = (note) => {
   try {
    if (isWeightType && !note && !weightInput && !priceInput) {
      setError(lang === 'ar' ? "⚠️ من فضلك اختر وزناً أو حدد سعراً أولاً" : "⚠️ Please select weight or price first");
      return;
    }

    let reqUnits = isWeightType ? 0 : quantity;
    let gms = 0;

    if (isWeightType) {
      if (note) {
        if (note.includes("نص")) gms = 500;
        else if (note.includes("ربع")) gms = 250;
        else if (note.includes("ثمن")) gms = 125;
        else if (note.includes("واحد")) gms = 1000;
      } else if (weightInput) {
        gms = parseFloat(weightInput);
      } else if (priceInput) {
        const targetPrice = parseFloat(priceInput);
        const unitPrice = hasOffer ? Number(product.offerPrice) : Number(product.price);
        gms = (targetPrice / unitPrice) * 1000;
      }
      reqUnits = gms;
    }

    if (reqUnits > currentStock) {
      setError(isWeightType 
        ? (lang === 'ar' ? `⚠️ المتبقي ${currentStock.toFixed(2)} جرام فقط!` : `⚠️ Only ${currentStock.toFixed(2)}g remaining!`)
        : (lang === 'ar' ? `⚠️ أقصى كمية متاحة هي ${currentStock} فقط` : `⚠️ Max available is ${currentStock}`));
      return;
    }

    const amount = isWeightType ? gms : quantity;

    if (!amount || amount <= 0) {
        setError(lang === 'ar' ? "⚠️ يرجى تحديد كمية صحيحة" : "⚠️ Please select a valid quantity");
        return;
    }

    onAddToCart({ ...product, isWeightType }, amount);
    setError("");
    setIsModalOpen(false);
   }
    catch (error) {
    console.error("حدث خطأ عند الإضافة:", error);
    setError(lang === 'ar' ? "حدث خطأ، حاول مجدداً" : "An error occurred, please try again");
  }
  };

  const handleFormSubmit = (e) => { e.preventDefault(); handleAddToCart(); };
  
  const handleWishlistClick = (e) => { e.preventDefault(); e.stopPropagation(); if (onAddToWishlist) onAddToWishlist(product); };

  const increaseQuantity = () => {
    if (quantity < currentStock) { setQuantity((prev) => prev + 1); setError(""); } 
    else { setError(lang === 'ar' ? `⚠️ أقصى كمية متاحة هي ${currentStock} فقط` : `⚠️ Max available is ${currentStock}`); }
  };

  const decreaseQuantity = () => { setQuantity((prev) => (prev > 1 ? prev - 1 : 1)); setError(""); };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    // ضبط اللغة حسب متغير lang
    const locale = lang === 'ar' ? "ar-EG" : "en-US";
    return d.toLocaleDateString(locale, { month: "short", day: "numeric" }) + 
           " | " + 
           d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative font-sans h-full group select-none" dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-linear-to-b from-white to-gray-50/30 border border-gray-100 rounded-2xl p-2 sm:p-3.5 w-full flex flex-col h-full shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-12px_rgba(0,166,80,0.18)] group-hover:border-[#00a650]/20 overflow-hidden">
        
        {currentStock <= 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
{lang === 'ar' ? "نفدت الكمية" : "Out of stock"}
          </div>
        )}

        <div className={`w-full h-24 sm:h-36 mb-2 rounded-xl overflow-hidden bg-white border border-gray-50 shrink-0 relative shadow-inner flex items-center justify-center p-2 ${currentStock <= 0 ? "opacity-50 grayscale" : ""}`}>
          {hasOffer && discountPercentage > 0 && (
            <div className="absolute top-1.5 right-1.5 bg-linear-to-r from-red-500 to-rose-600 text-white text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full z-20 shadow-[0_2px_8px_rgba(239,68,68,0.3)] tracking-tight">
              {discountPercentage}%-
            </div>
          )}
          <button onClick={handleWishlistClick} className="absolute top-1.5 left-1.5 z-20 p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-100 text-gray-400 hover:text-red-500 transition-all active:scale-75 shadow-sm hover:shadow-md cursor-pointer">
            <Heart size={14} className={`transition-all duration-300 ${isInWishlist ? "fill-red-500 text-red-500 scale-110" : "text-gray-400 hover:scale-110"}`} />
          </button>
          <img src={product?.image || fallbackImage} onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }} alt={product?.name?.ar} className="max-w-full max-h-full object-contain p-1 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-2" />
        </div>

        <div className="text-right mb-2 grow flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-[#1e3a5f] group-hover:text-[#00a650] text-[11px] sm:text-sm leading-snug line-clamp-2 min-h-8 sm:min-h-10 transition-colors duration-300">
              {productName}
            </h3>
            
           {hasOffer && (
  <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-rose-600 bg-rose-50/80 border border-rose-100/50 px-1.5 py-1 rounded-md w-fit">
    {product?.offerExpiresAt ? (
      <>
        <Clock size={10} className="shrink-0" />
        <span className="whitespace-nowrap">
          {formatExpiryDate(product.offerExpiresAt)}
        </span>
      </>
    ) : (
      <>
        <Package size={10} className="shrink-0" />
        <span className="whitespace-nowrap">
          {lang === 'ar' ? "عرض حتى نفاد الكمية" : "Offer until stock lasts"}
        </span>
      </>
    )}
  </div>
)}
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-gray-400 font-medium text-[9px] sm:text-xs">
                {categoryName}
              </p>

              {currentStock > 0 && isWeightType && (
            <span className="text-amber-600 text-[8px] font-bold">
              {lang === 'ar' ? `متبقٍّ ${currentStock >= 1000 ? `${(currentStock / 1000).toFixed(2)} كجم` : `${currentStock.toFixed(2)} جرام`}` 
                             : `Remaining: ${currentStock >= 1000 ? `${(currentStock / 1000).toFixed(2)}kg` : `${currentStock.toFixed(2)}g`}`}
            </span>
          )}
          {currentStock > 0 && !isWeightType && currentStock <= 5 && (
<span className="text-red-500 text-[8px] font-bold block mt-1">
    {lang === 'ar' 
      ? `باقي ${currentStock} فقط!` 
      : `Only ${currentStock} left!`}
  </span>          )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100/70 gap-2">
          <button
            onClick={handleOpenModal}
            disabled={currentStock <= 0}
            className={`${currentStock <= 0 ? "bg-gray-300 cursor-not-allowed opacity-60 shadow-none" : "bg-[#00a650] hover:bg-green-600 hover:shadow-[0_5px_15px_rgba(0,166,80,0.3)] cursor-pointer active:scale-90"} text-white w-6 h-6 sm:w-9 sm:h-9 group-hover:sm:w-24 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_3px_10px_rgba(0,166,80,0.2)] overflow-hidden shrink-0`}
          >
            <Plus size={14} className="shrink-0" />
            <span className="hidden group-hover:sm:inline text-[11px] whitespace-nowrap transition-all duration-300 opacity-0 group-hover:opacity-100">{lang === 'ar' ? 'أضف للطلب' : 'Add to Order'} </span>
          </button>

         <div className="flex flex-col items-end justify-center leading-tight">
  {hasOffer ? (
    <>
      <span className="text-gray-400 line-through text-[9px] sm:text-xs mb-0.5 decoration-red-400/80 font-medium">
        {product?.price} {lang === 'ar' ? 'ج.م' : 'EGP'}
      </span>
      <div className="text-[#00a650] font-black text-xs sm:text-lg whitespace-nowrap flex items-baseline gap-0.5">
        <span>{product?.offerPrice}</span>
        <span className="text-[8px] sm:text-xs font-bold text-gray-500">
          {lang === 'ar' ? 'ج.م' : 'EGP'}
        </span>
      </div>
    </>
  ) : (
    <div className="text-[#00a650] font-black text-xs sm:text-lg whitespace-nowrap flex items-baseline gap-0.5">
      <span>{product?.price}</span>
      <span className="text-[8px] sm:text-xs font-bold text-gray-500">
        {lang === 'ar' ? 'ج.م' : 'EGP'}
      </span>
    </div>
  )}
</div>
        </div>
      </div>

      {isModalOpen && createPortal(
  <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir={isRtl ? "rtl" : "ltr"}>
    <div className="bg-white w-full max-w-85 rounded-3xl overflow-hidden shadow-2xl transform opacity-100 animate-[modal-pop_0.2s_ease-out_forwards]">
      <div className="h-3 bg-[#00a650] w-full"></div>

      <form onSubmit={handleFormSubmit} className="p-5 sm:p-6">
        <h2 className="text-center text-[#00a650] text-xl sm:text-2xl font-extrabold mb-5 sm:mb-6">
          {lang === 'ar' ? 'تحديد الكمية' : 'Select Quantity'}
        </h2>

        {isWeightType ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { name: lang === 'ar' ? "ثمن كيلو" : "1/8 kg", val: 125 },
                { name: lang === 'ar' ? "ربع كيلو" : "1/4 kg", val: 250 },
                { name: lang === 'ar' ? "نص كيلو" : "1/2 kg", val: 500 },
                { name: lang === 'ar' ? "واحد كيلو" : "1 kg", val: 1000 }
              ].map((weight) => (
                <button
                  key={weight.name}
                  type="button"
                  disabled={weight.val > currentStock}
                  onClick={() => handleAddToCart(weight.name)}
                  className={`py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer border ${
                    weight.val > currentStock
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                      : "bg-white border-gray-100 text-gray-700 hover:bg-green-50 hover:border-green-200"
                  }`}
                >
                  {weight.name}
                </button>
              ))}
            </div>
            <input type="text" placeholder={lang === 'ar' ? "اكتب الوزن بالجرام..." : "Enter weight in grams..."} value={weightInput} onFocus={(e) => e.target.select()} onClick={(e) => e.target.select()} onChange={(e) => handleWeightChange(e.target.value)} className="w-full border border-gray-400 bg-white text-gray-900 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold outline-none focus:border-[#00a650]" />
            <input type="text" placeholder={lang === 'ar' ? "اطلب بمبلغ (بـ 50 جنيه)" : "Order by amount (e.g. 50 EGP)"} value={priceInput} onFocus={(e) => e.target.select()} onClick={(e) => e.target.select()} onChange={(e) => handlePriceChange(e.target.value)} className="w-full border border-gray-400 bg-white text-gray-900 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold outline-none focus:border-[#00a650]" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 my-6 sm:my-8">
            <label className="text-xs font-bold text-gray-500 mb-1">
              {lang === 'ar' ? 'الكمية المطلوبة (بالعدد)' : 'Requested Quantity'}
            </label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={decreaseQuantity} className="w-12 h-12 rounded-full bg-[#f3f4f6] text-[#374151] flex items-center justify-center text-xl font-bold hover:bg-gray-200 active:scale-95 transition-all cursor-pointer">-</button>
              
              <input
                type="number"
                min="1"
                max={currentStock}
                value={quantity}
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.target.select()}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > currentStock) {
                    setQuantity(currentStock);
                    setError(lang === 'ar' ? `⚠️ أقصى كمية مسموحة حالياً هي ${currentStock}` : `⚠️ Max allowed is ${currentStock}`);
                  } else {
                    setQuantity(isNaN(val) || val < 1 ? 1 : val);
                    setError("");
                  }
                }}
                className="w-20 h-12 border border-gray-400 bg-white rounded-xl text-center text-xl font-black text-gray-900 outline-none focus:border-[#00a650] shadow-inner"
              />
              
              <button type="button" onClick={increaseQuantity} className="w-12 h-12 rounded-full bg-[#f0fdf4] text-[#00a650] flex items-center justify-center text-xl font-bold hover:bg-green-100 active:scale-95 transition-all cursor-pointer">+</button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 mt-4 animate-[shake_0.3s_ease-in-out]">
            <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={error !== ""}
          className={`w-full mt-5 sm:mt-6 text-white py-3 sm:py-3.5 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md ${
            error !== "" ? "bg-gray-400 cursor-not-allowed opacity-70" : "bg-[#00a650] hover:bg-[#008f45] cursor-pointer"
          }`}
        >
          <ShoppingCart size={18} /> {lang === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
        </button>

        <button type="button" onClick={() => setIsModalOpen(false)} className="w-full mt-2 text-[#64748b] font-bold py-2 cursor-pointer hover:text-gray-900">
          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
      </form>
    </div>
  </div>,
  document.body
)}
    </div>
  );
}

export default SmartProductCard;