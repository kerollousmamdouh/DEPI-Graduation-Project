import { useContext, useState } from "react";
import { SiteContext } from "../Store/SiteContext";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertTriangle, User, Phone, MapPin, CreditCard, Loader2, Home, ShoppingCart } from "lucide-react";
import axios from "axios";

const CheckoutPage = ({ cartItems = [], onCheckout }) => {
  const { currentUser } = useContext(SiteContext);
  const navigate = useNavigate();
  
  const totalCalculated = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);

  const [formData, setFormData] = useState({
    name: currentUser?.fullName || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    payment: "paymob"
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      setError("❌ سلتك فارغة حالياً! يرجى إضافة منتجات أولاً.");
      return;
    }

    if (!/^0[1-9]{1}[0-9]{9}$/.test(formData.phone)) {
      setError("❌ رقم الهاتف يجب أن يتكون من 11 رقماً ويبدأ بـ 0");
      return;
    }
    
    setError("");
    setLoading(true);

    const orderPayload = {
      customer: {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        email: currentUser?.email || "guest@dealora.com"
      },
      items: cartItems.map(item => ({
        id: item.id,
        title: item.title || item.name,
        quantity: item.quantity,
        weightGrams: item.weightGrams || null,
        isWeightType: item.isWeightType || false,
        price: item.price,
        isOfferItem: item.isOfferItem || false
      })),
      totalPrice: totalCalculated,
      paymentMethod: "paymob",
      paymentDetails: null, 
      status: "PENDING", 
      createdAt: new Date().toISOString()
    };

    try {
      const response = await axios.post("/api/orders/create", orderPayload);
      const { id, paymentUrl } = response.data;

      if (paymentUrl) {
        if (onCheckout) {
          onCheckout({
            ...orderPayload,
            id: id,            
            paymentUrl: paymentUrl 
          });
        }

        setOrderPlaced(true);
        window.location.href = paymentUrl;
      } else {
        throw new Error("لم يتم استقبال رابط الدفع من السيرفر.");
      }

    } catch (err) {
      console.error("Checkout Error:", err);
      setError(err.response?.data?.message || "❌ فشل في بدء عملية الدفع الآمن. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="bg-[#111] p-8 rounded-4xl text-center border border-green-500/20 max-w-sm w-full shadow-2xl">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 animate-bounce" />
        <h2 className="text-2xl font-bold text-white mb-2">تم تسجيل طلبك بنجاح!</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          جاري توجيهك الآن لبوابة الدفع الإلكتروني Paymob لإتمام العملية. إذا لم يتم توجيهك تلقائياً، يمكنك متابعة الدفع من خلال حسابك الشخصي.
        </p>
        
        <button 
          onClick={() => navigate("/profile")} 
          className="w-full bg-green-600 py-4 rounded-2xl text-white font-bold hover:bg-green-500 transition-all shadow-lg shadow-green-500/10"
        >
          الذهاب لطلباتي 📋
        </button>

        <button 
          onClick={() => navigate("/home")} 
          className="w-full py-3 mt-2 rounded-2xl text-slate-500 text-xs hover:text-slate-400 transition-all"
        >
          العودة للرئيسية 🏠
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] py-10 px-4 flex flex-col items-center justify-center relative">
      
      {/* 👇 أزرار التنقل السريع في أعلى الصفحة 👇 */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 px-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#111] hover:bg-[#1a1a1a] text-slate-300 hover:text-white rounded-xl border border-white/5 transition-all text-sm font-medium disabled:opacity-50"
        >
          <Home size={16} />
          الرئيسية
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => navigate("/cart")} // قم بتغيير المسار إذا كان مسار السلة عندك مختلفاً
          className="flex items-center gap-2 px-4 py-2.5 bg-[#111] hover:bg-[#1a1a1a] text-slate-300 hover:text-white rounded-xl border border-white/5 transition-all text-sm font-medium disabled:opacity-50"
        >
          السلة
          <ShoppingCart size={16} className="text-green-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#111] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <h2 className="text-3xl font-black text-white text-center mb-8">إتمام الطلب</h2>
        
        <div className="mb-6 p-5 bg-[#1a1a1a] border border-white/5 rounded-2xl flex items-center justify-between">
          <span className="text-slate-400 text-sm font-bold flex items-center gap-2">
            <CreditCard size={18} className="text-green-500" /> إجمالي الحساب:
          </span>
          <span className="text-white text-xl font-black">{totalCalculated} EGP</span>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute right-4 top-4 text-slate-600" size={18}/>
            <input 
              required 
              disabled={loading}
              value={formData.name}
              placeholder="الاسم بالكامل" 
              className="w-full p-4 pr-12 rounded-2xl bg-[#1a1a1a] text-white border border-white/5 outline-none focus:border-green-500/50 transition-all disabled:opacity-50" 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="relative">
            <Phone className="absolute right-4 top-4 text-slate-600" size={18}/>
            <input 
              required 
              disabled={loading}
              type="tel" 
              maxLength="11" 
              value={formData.phone}
              placeholder="رقم الهاتف (01xxxxxxxxx)" 
              className="w-full p-4 pr-12 rounded-2xl bg-[#1a1a1a] text-white border border-white/5 outline-none focus:border-green-500/50 transition-all disabled:opacity-50" 
              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
            />
          </div>
          <div className="relative">
            <MapPin className="absolute right-4 top-4 text-slate-600" size={18}/>
            <textarea 
              required 
              disabled={loading}
              value={formData.address}
              placeholder="العنوان بالتفصيل" 
              className="w-full p-4 pr-12 rounded-2xl bg-[#1a1a1a] text-white border border-white/5 outline-none h-24 resize-none focus:border-green-500/50 transition-all disabled:opacity-50" 
              onChange={(e) => setFormData({...formData, address: e.target.value})} 
            />
          </div>
        </div>

        <div className="my-8">
          <p className="text-slate-500 text-xs font-bold uppercase mb-4">طريقة الدفع</p>
          <div className="grid grid-cols-1">
            <button 
              type="button" 
              className="p-5 rounded-2xl border-2 border-green-500 bg-green-500/10 text-white shadow-lg shadow-green-500/20 flex flex-col items-center justify-center transition-all"
            >
              <img 
                src="https://cdn-icons-png.flaticon.com/128/196/196578.png" 
                alt="Paymob Payment" 
                className="w-10 h-10 object-contain mb-2" 
              />
              <span className="text-xs font-black">الدفع الإلكتروني (Paymob)</span>
              <span className="text-[10px] text-slate-400 mt-1">يدعم فيزا، كارت ميزة، والمحافظ الإلكترونية</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-2xl mb-6 text-sm font-bold border border-red-500/20">
            <AlertTriangle size={18} /> {error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-green-500 hover:text-white transition-all transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              جاري تجهيز الدفع الآمن...
            </>
          ) : (
            "الذهاب لصفحة الدفع الآمن 🚀"
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;