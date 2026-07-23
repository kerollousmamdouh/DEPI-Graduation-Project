import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo1.png";
import { apiClient } from "../Services/apiClient";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!emailFromState) {
      navigate("/forgot-password");
    }
  }, [emailFromState, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendOtp = async () => {
    if (countdown > 0 || !email) return;
    setIsResending(true);
    setError("");
    setMessage("");
    try {
      await apiClient.post("/auth/forgot-password", { email });
      setMessage("تم إعادة إرسال كود التحقق بنجاح!");
      setCountdown(60);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء إعادة الإرسال.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("يجب إدخال كود التحقق المكون من 6 أرقام.");
      return;
    }
    if (newPassword.length < 6) {
      setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setMessage(res?.message || "تم تغيير كلمة المرور بنجاح! يمكنك تسجيل الدخول الآن.");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message || "الكود غير صحيح أو منتهي الصلاحية.");
    } finally {
      setIsLoading(false);
    }
  };

  const productsLink = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop";

  return (
    <div
      className="fixed inset-0 flex flex-col lg:flex-row bg-cover bg-center font-sans overflow-hidden lg:bg-none"
      style={{ backgroundImage: `url(${productsLink})` }}
    >
      <div className="absolute inset-0 bg-black/70 lg:hidden pointer-events-none z-0" />

      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 relative z-10 lg:bg-white order-1">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img src={logo} alt="Logo" className="w-40 mb-6 mx-auto brightness-0 invert lg:brightness-100 lg:invert-0 hover:scale-110 hover:-rotate-2" />

          <h2 className="text-2xl font-bold mb-2 text-center text-white lg:text-black">Reset Password</h2>
          <p className="text-sm text-center text-gray-300 lg:text-gray-500 mb-6">
            Enter the OTP sent to <span className="font-bold text-green-400 lg:text-green-600">{email}</span>
          </p>

          {message && (
            <div className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs p-3 rounded-xl mb-4 text-center lg:bg-green-50 lg:text-green-600 lg:border-green-100">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs p-3 rounded-xl mb-4 text-center lg:bg-red-50 lg:text-red-600 lg:border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 lg:text-gray-600 mb-1">OTP Code</label>
              <input
                required
                type="text"
                maxLength="6"
                placeholder="******"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full p-4 text-center tracking-[12px] font-bold text-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all lg:bg-gray-100 lg:border-none lg:text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 lg:text-gray-600 mb-1">New Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full py-4 px-12 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all lg:bg-gray-100 lg:border-none lg:text-black"
                />
                <button
                  type="button"
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
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={isLoading ? {} : { scale: 1.02, backgroundColor: "#000000" }}
              whileTap={isLoading ? {} : { scale: 0.98, backgroundColor: "#000000" }}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold transition-colors duration-300 shadow-lg shadow-green-900/40 lg:shadow-green-200 disabled:bg-emerald-800 disabled:cursor-not-allowed"
            >
              {isLoading ? "جاري التغيير..." : "Reset Password"}
            </motion.button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isResending}
              className={`text-xs font-bold transition-colors ${
                countdown > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-green-400 lg:text-green-600 hover:underline cursor-pointer"
              }`}
            >
              {isResending
                ? "جاري الإرسال..."
                : countdown > 0
                  ? `إعادة الإرسال بعد ${countdown} ثانية`
                  : "Resend OTP / إعادة إرسال الكود"}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-300 lg:text-gray-600">
            Remembered your password?{" "}
            <Link to="/login" className="font-bold text-green-400 underline underline-offset-4 lg:text-green-600">Back to Login</Link>
          </div>
        </motion.div>
      </div>

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

export default ResetPasswordPage;
