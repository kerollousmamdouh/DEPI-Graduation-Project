import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo1.png";
import axios from "axios"; 

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: ""
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({ email: "", phone: "", password: "", otp: "" });
  const [showPassword, setShowPassword] = useState(false);

  // خطوات التسجيل (1: تعبئة البيانات والتحقق الفعلي، 2: إدخال الـ OTP الـ 6 أرقام)
  const [step, setStep] = useState(1); 
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  // حالة إشعار الـ Toast
  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      console.log("Image attached:", file.name);
      
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result); 
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // =========================================================
  // 🔌 1️⃣ دالة التحقق من حقيقة وجود الإيميل وإرسال الـ OTP
  // =========================================================
  const sendOtpToBackend = async () => {
    try {
      const response = await axios.post("https://api.dealora-market.com/v1/auth/send-otp", {
        email: formData.email,
        phone: formData.phone
      });

      console.log("استجابة التحقق من الإيميل وإرسال الـ OTP:", response.data);

      setToast({ show: true, message: "تم التحقق من وجود الحساب وإرسال كود التحقق بنجاح! 📧" });
      setStep(2); 
    } catch (err) {
      console.error("خطأ أثناء التحقق من الحساب:", err);
      const serverMessage = err.response?.data?.message || "هذا الإيميل غير مسجل في جوجل أو غير حقيقي، يرجى كتابة بريد إلكتروني صالح!";
      setErrors((prev) => ({ ...prev, email: serverMessage }));
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    let currentErrors = { email: "", phone: "", password: "", otp: "" };
    let hasError = false;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      currentErrors.email = "صيغة البريد الإلكتروني المكتوبة غير صحيحة!";
      hasError = true;
    }

    const phoneRegex = /^0\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      currentErrors.phone = "رقم الهاتف يجب أن يتكون من 11 رقم ويبدأ بـ 0";
      hasError = true;
    }

    if (formData.password.length < 7) {
      currentErrors.password = "لازم كلمة المرور تكون 7 خانات أو أكثر!";
      hasError = true;
    }

    if (hasError) {
      setErrors(currentErrors);
      return;
    }

    setLoading(true);
    await sendOtpToBackend(); 
    setLoading(false);
  };

  // =========================================================
  // 🔌 2️⃣ دالة إتمام التسجيل النهائي وتأكيد كود الـ OTP
  // =========================================================
  const verifyOtpWithBackend = async () => {
    try {
      const apiData = new FormData();
      apiData.append("fullName", formData.fullName);
      apiData.append("email", formData.email);
      apiData.append("phone", formData.phone);
      apiData.append("password", formData.password);
      apiData.append("otp", otpCode); 
      
      if (profileImage) {
        apiData.append("avatar", profileImage); 
      }

      const response = await axios.post("https://api.dealora-market.com/v1/auth/register-verify", apiData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log("تم تفعيل الحساب وحفظ البيانات بنجاح:", response.data);

      if (response.data.token) {
        localStorage.setItem("dealora_token", response.data.token);
        localStorage.setItem("user_info", JSON.stringify(response.data.user));
      }

      navigate("/login");
    } catch (err) {
      console.error("خطأ أثناء تأكيد الحساب:", err);
      const serverMessage = err.response?.data?.message || "كود التحقق غير صحيح أو منتهي الصلاحية! ❌";
      setErrors((prev) => ({ ...prev, otp: serverMessage }));
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    
    if (otpCode.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: "يجب إدخال كود التحقق المكون من 6 أرقام كاملاً." }));
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, otp: "" }));
    await verifyOtpWithBackend(); 
    setLoading(false);
  };

  const productsLink = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop";
  const autofillClasses = "autofill:shadow-[0_0_0_30px_rgba(255,255,255,0.1)_inset] autofill:text-white [-webkit-text-fill-color:white_!important]";

  return (
    <div 
      className="fixed inset-0 flex flex-col lg:flex-row-reverse bg-cover bg-center font-sans overflow-hidden lg:bg-none"
      style={{ backgroundImage: `url(${productsLink})` }}
    >
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-green-600/90 backdrop-blur-md text-white py-3 px-6 rounded-2xl shadow-xl border border-green-500/30"
          >
            <div className="bg-white/20 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <span className="text-sm font-semibold dir-rtl text-right">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/75 lg:hidden pointer-events-none z-0" />
      <div className="hidden lg:flex w-1/2 h-full bg-green-600 items-center justify-center p-0 relative z-10">
        <img src={productsLink} alt="Products" className="w-full h-full object-cover" />
      </div>

      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-4 relative z-10 lg:bg-white overflow-hidden overflow-y-auto no-scrollbar">
        <motion.div className="w-full max-w-sm my-auto py-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <img src={logo} alt="Logo" className="w-28 lg:w-40 mb-2 mx-auto brightness-0 invert lg:brightness-100 lg:invert-0" />
          
          <h2 className="text-xl font-bold text-center text-white lg:text-black">
            {step === 1 ? "Create Account / إنشاء حساب" : "Verify Email / التحقق من البريد"}
          </h2>
          <p className="text-xs text-center text-gray-300 lg:text-gray-500 mb-3"> 
            {step === 1 ? "Sign up to start shopping" : `أدخل رمز التحقق المكون من 6 أرقام المرسل لـ ${formData.email}`} 
          </p>
          
          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-2" autoComplete="off">
              
              {/* 🛑 حقول وهمية مخفية تماماً لمنع اللخبطة والـ Autofill للمتصفح */}
              <input type="text" style={{ display: 'none' }} />
              <input type="password" style={{ display: 'none' }} />

              <div className="flex flex-col items-center mb-3">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full border-2 border-white/20 lg:border-green-500 overflow-hidden bg-white/10 lg:bg-gray-50 flex items-center justify-center cursor-pointer">
                    {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 lg:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <span className="text-[10px] text-gray-300 lg:text-gray-500 mt-1">إضافة صورة شخصية (اختياري)</span>
              </div>

              <div>
                <div className="flex flex-row-reverse justify-between items-center mb-1 text-xs font-semibold text-gray-200 lg:text-gray-700"><span>الاسم بالكامل</span><span>Full Name</span></div>
                <input name="fullName" required value={formData.fullName} onChange={handleInputChange} type="text" dir="auto" className={`w-full p-2.5 bg-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-green-500 lg:bg-gray-100 lg:text-black ${autofillClasses}`} autoComplete="name" />
              </div>

              <div>
                <div className="flex flex-row-reverse justify-between items-center mb-1 text-xs font-semibold text-gray-200 lg:text-gray-700"><span>البريد الإلكتروني</span><span>Email Address</span></div>
                <input name="email" required value={formData.email} onChange={handleInputChange} type="email" dir="auto" className={`w-full p-2.5 bg-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-green-500 lg:bg-gray-100 lg:text-black ${errors.email ? 'border-red-500' : 'border-white/20'} ${autofillClasses}`} autoComplete="email" />
                {errors.email && <p className="text-[10px] text-red-400 lg:text-red-600 mt-1 text-right font-medium">{errors.email}</p>}
              </div>

              <div>
                <div className="flex flex-row-reverse justify-between items-center mb-1 text-xs font-semibold text-gray-200 lg:text-gray-700"><span>رقم الموبايل</span><span>Phone Number</span></div>
                <input name="phone" required value={formData.phone} onChange={handleInputChange} type="tel" dir="auto" className={`w-full p-2.5 bg-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-green-500 lg:bg-gray-100 lg:text-black ${errors.phone ? 'border-red-500' : 'border-white/20'} ${autofillClasses}`} autoComplete="tel" />
                {errors.phone && <p className="text-[10px] text-red-400 lg:text-red-600 mt-1 text-right">{errors.phone}</p>}
              </div>

              <div>
                <div className="flex flex-row-reverse justify-between items-center mb-1 text-xs font-semibold text-gray-200 lg:text-gray-700"><span>كلمة المرور</span><span>Password</span></div>
                <div className="relative">
                  {/* 🎯 حقل وهمي مخصص لاستقبال الـ username المحفوظ وسحبه من طريق حقل الموبايل */}
                  <input type="text" name="fake_username" autoComplete="username" className="opacity-0 h-0 w-0 absolute pointer-events-none" tabIndex="-1" aria-hidden="true" />
                  
                  <input name="password" required value={formData.password} onChange={handleInputChange} type={showPassword ? "text" : "password"} dir="auto" className={`w-full py-2.5 px-12 bg-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-green-500 lg:bg-gray-100 lg:text-black ${errors.password ? 'border-red-500' : 'border-white/20'} ${autofillClasses}`} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 lg:text-gray-400 hover:text-green-500">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-400 lg:text-red-600 mt-1 text-right">{errors.password}</p>}
              </div>
              
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold mt-1 disabled:opacity-50">
                {loading ? "جاري التحقق من الإيميل..." : "إنشاء حساب / Register"}
              </motion.button>
            </form>
          ) : (
            /* واجهة إدخال الـ OTP الـ 6 أرقام */
            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <div>
                <div className="flex flex-row-reverse justify-between items-center mb-1 text-xs font-semibold text-gray-200 lg:text-gray-700"><span>رمز التحقق (OTP)</span><span>Verification Code</span></div>
                <input 
                  required type="text" maxLength="6" value={otpCode} placeholder="******" 
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))} 
                  className="w-full p-3 text-center tracking-[12px] font-bold text-xl bg-white/10 border border-white/20 text-white rounded-xl outline-none focus:ring-2 focus:ring-green-500 lg:bg-gray-100 lg:text-black"
                />
                {errors.otp && <p className="text-xs text-red-400 lg:text-red-600 mt-2 text-center">{errors.otp}</p>}
              </div>

              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">
                {loading ? "جاري تفعيل الحساب..." : "تأكيد وإنشاء الحساب / Verify & Register"}
              </motion.button>

              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs text-gray-400 lg:text-gray-500 hover:underline">← تعديل البيانات</button>
            </form>
          )}

          <div className="text-center text-xs text-gray-300 lg:text-gray-600 mt-3">
            Already have an account? <Link to="/login" className="font-bold text-green-400 lg:text-green-600 underline">تسجيل الدخول / Login here</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;