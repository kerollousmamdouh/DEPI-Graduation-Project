import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo1.png";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("جاري الإرسال لـ:", email);
    alert("تم إرسال رابط الاستعادة! جاري تحويلك...");
    navigate("/login"); 
  };

  // اللينك المباشر لخلفية المنتجات (تقدر تبدله بأي لينك من الـ 3 اللي فوق)
  const productsLink = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop";

  return (
    // الحاوية الكبيرة: اللينك فارش الخلفية كاملة للموبايل
    <div 
      className="fixed inset-0 flex flex-col lg:flex-row bg-cover bg-center font-sans overflow-hidden lg:bg-none"
      style={{ backgroundImage: `url(${productsLink})` }}
    >
      
      {/* طبقة التعتيم عشان المنتجات تظهر شيك في الخلفية والكلام يفضل واضح وقوي */}
      <div className="absolute inset-0 bg-black/70 lg:hidden pointer-events-none z-0" />
      
      {/* 1. الجانب الأيسر (الفورم) */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 relative z-10 lg:bg-white order-1">
        <motion.div 
          className="w-full max-w-sm" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          {/* اللوجو */}
          <img src={logo} alt="Logo" className="w-40 mb-6 mx-auto brightness-0 invert lg:brightness-100 lg:invert-0 hover:scale-110 hover:-rotate-2" />
          
          {/* العناوين */}
          <h2 className="text-2xl font-bold mb-2 text-center text-white lg:text-black">Forgot Password?</h2>
          <p className="text-sm text-center text-gray-300 lg:text-gray-500 mb-6">Enter your email to recover your account</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* حقل الإدخال */}
            <input 
              required
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all lg:bg-gray-100 lg:border-none lg:text-black lg:placeholder-gray-400" 
            />
            
            {/* الزرار */}
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.02, backgroundColor: "#000000" }} 
              whileTap={{ scale: 0.98, backgroundColor: "#000000" }} 
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold transition-colors duration-300 shadow-lg shadow-green-900/40 lg:shadow-green-200"
            >
              Send Reset Link
            </motion.button>
          </form>

          {/* الروابط */}
          <div className="mt-6 text-center text-sm text-gray-300 lg:text-gray-600">
            Remembered your password? {" "}
            <br></br>
            <Link to="/login" className="font-bold text-green-400 underline underline-offset-4 lg:text-green-600">Back to Login</Link>
          </div>
        </motion.div>
      </div>

      {/* 2. الجانب الأيمن (نفس اللينك شغال على اللاب توب يمين) */}
      <div className="hidden lg:flex w-1/2 h-full bg-green-600 items-center justify-center p-0 order-2 relative z-10">
        <img 
          src={productsLink} 
          alt="Products" 
          className="w-full h-full object-cover"
        />
      </div>

    </div>
  );
};

export default ForgotPasswordPage;