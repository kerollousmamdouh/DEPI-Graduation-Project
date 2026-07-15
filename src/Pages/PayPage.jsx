import { useContext, useState } from "react";
import { SiteContext } from "../Store/SiteContext";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertTriangle, UploadCloud, Copy, Phone, MapPin, User, FileText, CreditCard } from "lucide-react";

const CheckoutPage = ({ cartItems = [], onCheckout }) => {
  const { adminData, currentUser } = useContext(SiteContext);
  const navigate = useNavigate();
  
  // حساب إجمالي السعر للمنتجات المتواجدة في السلة حالياً
  const totalCalculated = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);

  // تهيئة بيانات العميل تلقائياً من حسابه المسجل لتسهيل عملية الشراء
  const [formData, setFormData] = useState({
    name: currentUser?.fullName || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    payment: "cod",
    transactionId: "",
    image: null // سيتم حفظ صورة الإيصال هنا بصيغة Base64 لسهولة إرسالها للباك إند والداشبورد
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);

  const paymentOptions = [
    { id: "cod", label: "كاش", img: "https://cdn-icons-png.flaticon.com/128/2331/2331941.png" },
    { id: "visa", label: "فيزا", img: "https://cdn-icons-png.flaticon.com/128/196/196578.png" },
    { id: "instapay", label: "InstaPay", img: "https://upload.wikimedia.org/wikipedia/ar/f/fa/%D8%A7%D9%86%D8%B3%D8%AA%D8%A7%D8%A8%D8%A7%D9%82.png" },
    { id: "vodafone", label: "فودافون", img: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Vodafone_Logo.svg" },
    { id: "orange", label: "أورانج", img: "https://www.orange.com/sirius/logo/Master-Logo-Orange-format-SGV.svg" },
    { id: "etisalat", label: "اتصالات", img: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Eand_Logo_Ar.svg" },
    { id: "we", label: "وي", img: "https://upload.wikimedia.org/wikipedia/commons/0/0f/We_logo.svg" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      setError("❌ سلتك فارغة حالياً! يرجى إضافة منتجات أولاً.");
      return;
    }

    if (!/^0[1-9]{1}[0-9]{9}$/.test(formData.phone)) {
      setError("❌ رقم الهاتف يجب أن يتكون من 11 رقماً ويبدأ بـ 0");
      return;
    }
    
    // شروط التحقق الإجبارية لوسائل الدفع غير الكاش
    if (formData.payment !== 'cod') {
      if (!formData.image) { 
        setError("⚠️ يرجى رفع صورة الإيصال لتأكيد عملية الدفع الرقمي"); 
        return; 
      }
      if (!/^\d+$/.test(formData.transactionId)) { 
        setError("⚠️ رقم المرجع يجب أن يكون أرقاماً فقط"); 
        return; 
      }
    }
    
    setError("");

    // تحضير كائن الطلب الكامل (Payload) لإرساله للداشبورد والباك إند
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
      paymentMethod: formData.payment,
      // تفاصيل الدفع الرقمي (تُرسل فقط إذا لم تكن طريقة الدفع كاش)
      paymentDetails: formData.payment !== 'cod' ? {
        transactionId: formData.transactionId,
        receiptImage: formData.image // ملف الصورة Base64 جاهز للتخزين أو الرفع للسيرفر
      } : null,
      status: "PENDING", // حالة الطلب الافتراضية بانتظار المراجعة بالداشبورد
      createdAt: new Date().toISOString()
    };

    // إرسال الطلب وحفظه برمجياً بالسيستم وتفريغ السلة تلقائياً
    if (onCheckout) {
      onCheckout(orderPayload);
    }
    
    setOrderPlaced(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // واجهة النجاح المباشرة والمبسطة بدون أي روابط خارجية
  if (orderPlaced) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="bg-[#111] p-8 rounded-4xl text-center border border-green-500/20 max-w-sm w-full shadow-2xl">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 animate-bounce" />
        <h2 className="text-2xl font-bold text-white mb-2">تم تسجيل طلبك بنجاح!</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          تلقينا طلبك وجاري مراجعته الآن وتأكيده داخل لوحة التحكم الخاصة بنا. يمكنك متابعة حالة طلبك من خلال حسابك الشخصي.
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
    <div className="min-h-screen bg-[#050505] py-10 px-4 flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#111] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <h2 className="text-3xl font-black text-white text-center mb-8">إتمام الطلب</h2>
        
        {/* ملخص الدفع وعرض المبلغ المالي بوضوح */}
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
              value={formData.name}
              placeholder="الاسم بالكامل" 
              className="w-full p-4 pr-12 rounded-2xl bg-[#1a1a1a] text-white border border-white/5 outline-none focus:border-green-500/50 transition-all" 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="relative">
            <Phone className="absolute right-4 top-4 text-slate-600" size={18}/>
            <input 
              required 
              type="tel" 
              maxLength="11" 
              value={formData.phone}
              placeholder="رقم الهاتف (01xxxxxxxxx)" 
              className="w-full p-4 pr-12 rounded-2xl bg-[#1a1a1a] text-white border border-white/5 outline-none focus:border-green-500/50 transition-all" 
              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
            />
          </div>
          <div className="relative">
            <MapPin className="absolute right-4 top-4 text-slate-600" size={18}/>
            <textarea 
              required 
              value={formData.address}
              placeholder="العنوان بالتفصيل" 
              className="w-full p-4 pr-12 rounded-2xl bg-[#1a1a1a] text-white border border-white/5 outline-none h-24 resize-none focus:border-green-500/50 transition-all" 
              onChange={(e) => setFormData({...formData, address: e.target.value})} 
            />
          </div>
        </div>

        <div className="my-8">
          <p className="text-slate-500 text-xs font-bold uppercase mb-4">اختر طريقة الدفع</p>
          <div className="grid grid-cols-2 gap-3">
            {paymentOptions.map((opt) => (
              adminData?.paymentMethods?.[opt.id] && (
                <button 
                  type="button" 
                  key={opt.id} 
                  onClick={() => setFormData({...formData, payment: opt.id, transactionId: "", image: null})}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${
                    formData.payment === opt.id 
                      ? 'border-green-500 bg-green-500/10 text-white shadow-lg shadow-green-500/20' 
                      : 'border-white/5 bg-[#1a1a1a] text-slate-400 hover:border-white/20'
                  }`}
                >
                  <img src={opt.img} alt={opt.label} className="w-8 h-8 object-contain mb-2" />
                  <span className="text-[11px] font-bold">{opt.label}</span>
                </button>
              )
            ))}
          </div>
        </div>

        {/* عرض رقم المحفظة في حال تم اختيار دفع مسبق */}
        {formData.payment !== 'cod' && (
          adminData?.paymentDetails?.[formData.payment] ? (
            <div className="mb-6 p-5 bg-green-900/10 border border-green-500/30 rounded-2xl text-center relative animate-fade-in">
              <p className="text-green-400 text-xs font-bold mb-2">رقم المحفظة (التحويل هنا):</p>
              <button type="button" onClick={() => copyToClipboard(adminData.paymentDetails[formData.payment])} className="text-white text-xl font-black flex items-center justify-center gap-2">
                {adminData.paymentDetails[formData.payment]} <Copy size={16} className="text-slate-500" />
              </button>
              {copyFeedback && <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-3 py-1 rounded-full font-bold animate-pulse">تم النسخ!</div>}
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-900/10 border border-yellow-500/30 rounded-2xl text-center text-yellow-500 text-xs font-bold">
              يرجى التواصل معنا للحصول على بيانات التحويل الخاصة بـ {paymentOptions.find(o => o.id === formData.payment)?.label}
            </div>
          )
        )}

        {/* حقل إرفاق صورة الإيصال وإدخال الرقم المرجعي للتحويلات الرقمية */}
        {formData.payment !== 'cod' && adminData?.paymentDetails?.[formData.payment] && (
          <div className="bg-linear-to-br from-green-900/20 to-[#111] p-6 rounded-2xl border border-green-500/30 mb-6 space-y-4">
            <p className="text-green-400 text-sm font-bold flex items-center gap-2"><UploadCloud size={18}/> إرفاق إيصال التحويل (مطلوب)</p>
            <input 
              required 
              type="file" 
              accept="image/*" 
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-green-600 file:text-white cursor-pointer" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setFormData({...formData, image: ev.target.result});
                  reader.readAsDataURL(e.target.files[0]);
                }
              }} 
            />
            
            {/* عرض معاينة مصغرة للإيصال المرفوع قبل الإرسال */}
            {formData.image && (
              <div className="w-full h-32 rounded-xl overflow-hidden border border-white/10 mt-2 bg-black">
                <img src={formData.image} alt="Receipt Preview" className="w-full h-full object-contain" />
              </div>
            )}

            <div className="relative">
              <FileText className="absolute right-4 top-4 text-slate-600" size={18}/>
              <input 
                required 
                pattern="\d*" 
                value={formData.transactionId}
                placeholder="رقم مرجع التحويل (أرقام فقط)" 
                className="w-full p-4 pr-12 rounded-2xl bg-[#050505] text-white border border-white/10 outline-none focus:border-green-500/50 transition-all" 
                onChange={(e) => setFormData({...formData, transactionId: e.target.value})} 
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-2xl mb-6 text-sm font-bold border border-red-500/20">
            <AlertTriangle size={18} /> {error}
          </div>
        )}
        
        <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-green-500 hover:text-white transition-all transform hover:scale-[1.02]">
          تأكيد وإرسال الطلب 🚀
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;