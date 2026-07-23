import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo1.png";
import { SiteContext } from "../Store/SiteContext";
import { apiClient } from "../Services/apiClient";

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useContext(SiteContext);
  
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (authError) setAuthError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      const data = await apiClient.post("/auth/login", {
        email: formData.username,
        password: formData.password,
      });

      if (!data.token) {
        throw new Error(data.message || "اسم المستخدم أو كلمة المرور غير صحيحة");
      }

      localStorage.setItem("dealora_market_token", data.token);
      const mappedUser = {
        ...data.user,
        fullName: data.user.name || data.user.fullName,
        displayName: data.user.name?.split(" ")[0] || data.user.displayName,
        image: data.user.photo_url || data.user.image || null,
      };
      localStorage.setItem("dealora_market_current_user", JSON.stringify(mappedUser));
      if (loginUser) loginUser(mappedUser, data.token);

      if (data.user.role === "super_admin" || data.user.role === "store_manager") {
        navigate("/dashboard");
      } else {
        navigate("/profile");
      }

    } catch (error) {
      setAuthError(error.message || "حدث خطأ في الاتصال بالسيرفر");
    } finally {
      setIsLoading(false);
    }
  };

  const productsLink = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop";

  return (
    <div 
      className="fixed inset-0 flex flex-col lg:flex-row-reverse bg-cover bg-center font-sans overflow-hidden lg:bg-none"
      style={{ backgroundImage: `url(${productsLink})` }}
    >
      <div className="absolute inset-0 bg-black/75 lg:hidden pointer-events-none z-0" />

      <div className="hidden lg:flex w-1/2 h-full bg-green-600 items-center justify-center p-0 relative z-10">
        <img 
          src={productsLink} 
          alt="Hyper Products" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 relative z-10 lg:bg-white">
        <motion.div 
          className="w-full max-w-sm" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <img src={logo} alt="Logo" className="w-44 mb-6 mx-auto brightness-0 invert lg:brightness-100 lg:invert-0 hover:scale-110 hover:-rotate-2" />
          
          <h2 className="text-2xl font-bold mb-6 text-center text-white lg:text-black">Welcome Back / تسجيل الدخول</h2>
          
          {authError && (
            <p className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs p-3 rounded-xl mb-4 text-center lg:bg-red-50 lg:text-red-600 lg:border-red-100">
              {authError}
            </p>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <input type="text" name="prevent_autofill" id="prevent_autofill_username" defaultValue="" style={{display: 'none'}} aria-hidden="true" />
            <input type="password" name="password_fake" id="prevent_autofill_password" defaultValue="" style={{display: 'none'}} aria-hidden="true" />

            <input 
              name="username"
              required 
              disabled={isLoading}
              onChange={handleInputChange}
              type="text" 
              autoComplete="new-password"
              placeholder="Email or Phone number" 
              className="w-full p-4 mb-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-gray-300 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all lg:bg-gray-100 lg:border-none lg:text-black lg:placeholder-gray-400 disabled:opacity-50" 
            />
            
            <div className="relative mb-2">
              <input 
                name="password"
                required 
                disabled={isLoading}
                onChange={handleInputChange}
                type={showPassword ? "text" : "password"} 
                autoComplete="new-password"
                placeholder="Password" 
                className="w-full py-4 px-12 bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-gray-300 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all lg:bg-gray-100 lg:border-none lg:text-black lg:placeholder-gray-400 disabled:opacity-50" 
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 lg:text-gray-400 hover:text-green-500 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className="text-right mb-6">
              <Link to="/forgot-password" className="text-xs text-gray-300 hover:text-green-400 lg:text-gray-500 lg:hover:text-green-600">
                Forgot Password?
              </Link>
            </div>
            
            <motion.button 
              type="submit"
              disabled={isLoading}
              whileHover={isLoading ? {} : { scale: 1.02, backgroundColor: "#15803d" }} 
              whileTap={isLoading ? {} : { scale: 0.98 }} 
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold transition-colors duration-300 mb-4 shadow-lg shadow-green-900/30 lg:shadow-green-200 flex items-center justify-center gap-2 disabled:bg-emerald-800 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </motion.button>
          </form>

          <div className="text-center text-sm text-gray-300 lg:text-gray-600">
            Don't have an account? {" "}
            <Link to="/register" className="font-bold text-green-400 underline underline-offset-4 lg:text-green-600">Create account</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;