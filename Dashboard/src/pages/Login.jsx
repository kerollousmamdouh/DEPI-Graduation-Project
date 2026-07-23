import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/common/LanguageToggle";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();
  
  const [remember, setRemember] = useState(true);
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success("Welcome back 👋");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-6 relative transition-colors duration-200">
      
      <div className="absolute top-6 ltr:right-6 rtl:left-6 flex items-center gap-3">
        <LanguageToggle />
      </div>

      <form
        onSubmit={handleSubmit}
        autoComplete="off" // يمنع المتصفح من حفظ أو اقتراح البيانات في الفورم كله
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {t("loginToAccount")}
          </h1>
          <p className="text-sm text-gray-500">{t("loginSubtitle")}</p>
        </div>

        {/* حقل البريد الإلكتروني */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("username") || "Username"}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoComplete="off"
            className="w-full bg-gray-100 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200"
          />
        </div>

        {/* حقل الباسورد */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              {t("password")}
            </label>
            <button type="button" className="text-sm text-gray-500 hover:text-[rgb(0,166,62)] transition-colors">
              {t("forgetPassword")}
            </button>
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="new-password" // الطريقة الرسمية لمنع المتصفح من اقتراح الباسوردات
              className="w-full bg-gray-100 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[rgb(0,166,62)]"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* تذكرني */}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[rgb(0,166,62)] focus:ring-[rgb(0,166,62)]"
          />
          {t("rememberPassword")}
        </label>

        {/* زر الدخول */}
        <button
          type="submit"
          className="w-full rounded-xl bg-[rgb(0,166,62)] py-3.5 text-lg font-semibold text-white transition hover:bg-[rgb(0,145,55)] shadow-lg shadow-[rgba(0,166,62,0.2)]"
        >
          {t("signIn")}
        </button>

        <p className="text-center text-sm text-gray-500">
          DeaLora Admin Dashboard
        </p>
      </form>
    </div>
  );
}