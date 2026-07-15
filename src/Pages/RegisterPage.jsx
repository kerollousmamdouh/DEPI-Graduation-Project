import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo1.png";

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
  const [errors, setErrors] = useState({ email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let currentErrors = { email: "", phone: "", password: "" };
    let hasError = false;

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

    /* ==================================================================
    🟢 بلوك جاهز للربط مع الـ Backend لإنشاء الحساب الفعلي
    ==================================================================
    try {
      const response = await fetch("https://api.dealoramarket.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: imagePreview })
      });
      const data = await response.json();
      if(response.ok) { navigate("/login"); return; }
    } catch(err) { console.log(err); }
    ==================================================================
    */

    const savedUsers = JSON.parse(localStorage.getItem("dealora_market_users") || "[]");
    const isEmailExist = savedUsers.some(u => u.email === formData.email);
    const isPhoneExist = savedUsers.some(u => u.phone === formData.phone);

    if (isEmailExist || isPhoneExist) {
      if (isEmailExist) currentErrors.email = "البريد الإلكتروني مسجل بالفعل!";
      if (isPhoneExist) currentErrors.phone = "رقم الهاتف مسجل بالفعل!";
      setErrors(currentErrors);
      return;
    }

    const userPayload = { 
      ...formData, 
      role: "user",
      image: imagePreview || null,
      actualFile: profileImage 
    };

    savedUsers.push(userPayload);
    localStorage.setItem("dealora_market_users", JSON.stringify(savedUsers));

    console.log("تم حفظ الحساب الجديد في ديلورا ماركت مع الصورة الفعليه:", profileImage);
    navigate("/login");
  };

  const productsLink = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop";
  const autofillClasses = "autofill:shadow-[0_0_0_30px_rgba(255,255,255,0.1)_inset] autofill:text-white [-webkit-text-fill-color:white_!important]";

  return (
    <div 
      className="fixed inset-0 flex flex-col lg:flex-row-reverse bg-cover bg-center font-sans overflow-hidden lg:bg-none"
      style={{ backgroundImage: `url(${productsLink})` }}
    >
      <div className="absolute inset-0 bg-black/75 lg:hidden pointer-events-none z-0" />

      <div className="hidden lg:flex w-1/2 h-full bg-green-600 items-center justify-center p-0 relative z-10">
        <img src={productsLink} alt="Dealora Market Products" className="w-full h-full object-cover" />
      </div>

      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-4 relative z-10 lg:bg-white overflow-hidden overflow-y-auto no-scrollbar">
        <motion.div className="w-full max-w-sm my-auto py-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <img src={logo} alt="Dealora Logo" className="w-28 lg:w-40 mb-2 mx-auto brightness-0 invert lg:brightness-100 lg:invert-0 hover:scale-110 hover:-rotate-2" />
          
          <h2 className="text-xl font-bold text-center text-white lg:text-black ">Create Account / إنشاء حساب</h2>
          <p className="text-xs text-center text-gray-300 lg:text-gray-500 mb-3"> Sign up to start shopping </p>
          
          <form onSubmit={handleSubmit} className="space-y-2" autoComplete="off">
            <div className="flex flex-col items-center mb-3">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full border-2 border-white/20 lg:border-green-500 overflow-hidden bg-white/10 lg:bg-gray-50 flex items-center justify-center cursor-pointer backdrop-blur-md shadow-inner transition-transform group-hover:scale-105">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 lg:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="إدراج صورة شخصية" />
              </div>
              <span className="text-[10px] text-gray-300 lg:text-gray-500 mt-1">اضغط لإضافة صورة شخصية (اختياري)</span>
            </div>

            <input type="text" name="prevent_autofill" id="prevent_autofill" defaultValue="" style={{display: 'none'}} aria-hidden="true" />
            <input type="password" name="password_fake" id="password_fake" defaultValue="" style={{display: 'none'}} aria-hidden="true" />

            <div>
              <div className="flex flex-row-reverse justify-between items-center mb-1 text-xs font-semibold text-gray-200 lg:text-gray-700">
                <span>الاسم بالكامل</span>
                <span>Full Name</span>
              </div>
              <input 
                name="fullName" required onChange={handleInputChange} type="text" dir="auto" autoComplete="new-password" placeholder="Enter full name" 
                className={`w-full p-2.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all lg:bg-gray-100 lg:border-none lg:text-black lg:placeholder-gray-400 ${autofillClasses}`} 
              />
            </div>

            <div>
              <div className="flex flex-row-reverse justify-between items-center mb-1 text-xs font-semibold text-gray-200 lg:text-gray-700">
                <span>البريد الإلكتروني</span>
                <span>Email Address</span>
              </div>
              <input 
                name="email" required onChange={handleInputChange} type="email" dir="auto" autoComplete="new-password" placeholder="Enter email" 
                className={`w-full p-2.5 bg-white/10 backdrop-blur-xl border text-white placeholder-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all lg:bg-gray-100 lg:border-none lg:text-black lg:placeholder-gray-400 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-white/20'} ${autofillClasses}`} 
              />
              {errors.email && <p className="text-[10px] text-red-400 lg:text-red-600 mt-1 text-right">{errors.email}</p>}
            </div>

            <div>
              <div className="flex flex-row-reverse justify-between items-center mb-1 text-xs font-semibold text-gray-200 lg:text-gray-700">
                <span>رقم الموبايل</span>
                <span>Phone Number</span>
              </div>
              <input 
                name="phone" required onChange={handleInputChange} type="tel" dir="auto" autoComplete="new-password" placeholder="Enter phone number" 
                className={`w-full p-2.5 bg-white/10 backdrop-blur-xl border text-white placeholder-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all lg:bg-gray-100 lg:border-none lg:text-black lg:placeholder-gray-400 ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-white/20'} ${autofillClasses}`} 
              />
              {errors.phone && <p className="text-[10px] text-red-400 lg:text-red-600 mt-1 text-right">{errors.phone}</p>}
            </div>

            <div>
              <div className="flex flex-row-reverse justify-between items-center mb-1 text-xs font-semibold text-gray-200 lg:text-gray-700">
                <span>كلمة المرور</span>
                <span>Password</span>
              </div>
              <div className="relative">
                <input 
                  name="password" required onChange={handleInputChange} type={showPassword ? "text" : "password"} dir="auto" autoComplete="new-password" placeholder="Enter password" 
                  className={`w-full py-2.5 px-12 bg-white/10 backdrop-blur-xl border text-white placeholder-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all lg:bg-gray-100 lg:border-none lg:text-black lg:placeholder-gray-400 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-white/20'} ${autofillClasses}`} 
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 lg:text-gray-400 hover:text-green-500 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-400 lg:text-red-600 mt-1 text-right">{errors.password}</p>}
            </div>
            
            <motion.button 
              type="submit" whileHover={{ scale: 1.02, backgroundColor: "#15803d" }} whileTap={{ scale: 0.98 }} 
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold transition-colors duration-300 shadow-lg shadow-green-900/30 lg:shadow-green-200 mt-1"
            >
              تسجيل / Register
            </motion.button>
          </form>

          <div className="text-center text-xs text-gray-300 lg:text-gray-600 mt-3">
            Already have an account? {" "}
            <Link to="/login" className="font-bold text-green-400 underline underline-offset-4 lg:text-green-600">تسجيل الدخول / Login here</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;