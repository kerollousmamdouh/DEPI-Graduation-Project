import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, X } from "lucide-react";
import imgPlaceholder from "../assets/images/logo1.png";

function CartPage({ cartItems = [], setCartItems, lang = "ar" }) {
  const navigate = useNavigate();
  const isRtl = lang === "ar";

  const removeItem = (id, isOfferItem) => {
    setCartItems(
      cartItems.filter(
        (item) => !(item.id === id && item.isOfferItem === isOfferItem),
      ),
    );
  };

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0,
  );

  if (cartItems.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gray-50"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-black text-[#1e3a5f]">
          {isRtl ? "سلتك فارغة" : "Your cart is empty"}
        </h2>
        <Link
          to="/home"
          className="bg-[#00a650] text-white px-8 py-3 rounded-2xl font-bold mt-6"
        >
          {isRtl ? "العودة للمتجر" : "Back to Store"}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-md mx-auto p-3">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-black text-[#1e3a5f]">
            {isRtl ? "سلة التسوق" : "Shopping Cart"}
          </h1>
          <Link
            to="/home"
            className="p-2 bg-white rounded-xl shadow-sm text-gray-400"
          >
            <X size={20} />
          </Link>
        </div>

        <div className="space-y-3">
          {cartItems.map((item, index) => {
            const isWeight = item.weightGrams > 0;
            const unitPrice =
              item.price / (isWeight ? item.weightGrams / 1000 : item.quantity);
            const itemName = isRtl
              ? item.name?.ar || item.name?.en
              : item.name?.en || item.name?.ar;

            return (
              <div
                key={index}
                className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-3"
              >
                <img
                  src={item.image}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = imgPlaceholder; // تأكد أن هذا المتغير معرف ويشير لصورة صحيحة
                  }}
                  alt={itemName}
                  className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                />

                <div className="grow min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-[#1e3a5f] text-sm truncate">
                      {itemName}
                    </h3>
                    <button
                      onClick={() => removeItem(item.id, item.isOfferItem)}
                      className="text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#00a650] font-black mb-2">
                    {item.isOfferItem
                      ? isRtl
                        ? "بسعر العرض"
                        : "Offer Price"
                      : isRtl
                        ? "بسعر عادي"
                        : "Regular Price"}
                  </p>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-bold">
                    <div className="text-gray-400">
                      {isRtl
                        ? isWeight
                          ? "سعر الكيلو"
                          : "سعر القطعة"
                        : isWeight
                          ? "Price per kg"
                          : "Price per unit"}
                    </div>
                    <div className="text-gray-400">
                      {isRtl
                        ? isWeight
                          ? "الوزن المطلوب"
                          : "عدد القطع"
                        : isWeight
                          ? "Quantity"
                          : "Pieces"}
                    </div>

                    <div className="text-[#1e3a5f]">
                      {unitPrice.toFixed(0)} {isRtl ? "ج.م" : "EGP"}
                    </div>
                    <div className="text-[#1e3a5f]">
                      {isWeight
                        ? `${item.weightGrams} ${isRtl ? "جم" : "g"}`
                        : `${item.quantity} ${isRtl ? "قطعة" : "pcs"}`}
                    </div>

                    <div className="col-span-2 mt-1 pt-1 border-t border-gray-100 flex justify-between text-[#00a650]">
                      <span>{isRtl ? "الإجمالي:" : "Total:"}</span>
                      <span>
                        {Number(item.price).toFixed(2)} {isRtl ? "ج.م" : "EGP"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-400 font-bold">
              {isRtl ? "الإجمالي الكلي" : "Grand Total"}
            </p>
            <p className="text-lg font-black text-[#1e3a5f]">
              {total.toFixed(2)} {isRtl ? "ج.م" : "EGP"}
            </p>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="bg-[#00a650] p-4 rounded-xl text-white font-bold text-sm"
          >
            {isRtl ? "تأكيد الطلب والذهاب للدفع" : "Confirm & Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
