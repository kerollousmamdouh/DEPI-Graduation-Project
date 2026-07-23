import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { LogOut, User, Key, Activity, ChevronDown } from "lucide-react";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  
  // استخدام البيانات الحقيقية من الـ Context
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: t("manageAccount"), icon: <User size={18} />, to: "/settings" },
    { label: t("changePassword"), icon: <Key size={18} />, to: "/settings" },
    { label: t("activityLog"), icon: <Activity size={18} />, to: "/" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
        aria-label="Open profile menu"
      >
        {/* صورة المستخدم الحقيقية أو صورة افتراضية */}
        <img
          src={user?.avatar || "https://randomuser.me/api/portraits/men/75.jpg"}
          alt={user?.fullName || "User"}
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
        />
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* القائمة المنسدلة */}
      <div
        className={`absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-gray-100 shadow-xl py-2 origin-top-right transition-all duration-150 z-50 ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* بيانات المستخدم الحقيقية */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900 truncate">
            {user?.fullName || "User Name"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user?.jobTitle || "admin"}
          </p>
        </div>

        {/* الروابط */}
        <div className="py-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                navigate(item.to);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-[rgb(0,166,62)]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 my-1" />

        {/* زر الخروج الحقيقي */}
        <button
          onClick={() => {
            setOpen(false);
            logout(); // دالة الخروج الحقيقية
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={18} />
          {t("logout")}
        </button>
      </div>
    </div>
  );
}