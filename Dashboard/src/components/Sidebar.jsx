import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext"; 
import { apiClient } from "../services/apiClient";
import {
  LayoutDashboard,
  Package,
  Star,
  ShoppingCart,
  Image as ImageIcon,
  Users,
  ShieldCheck,
  Tags,
  Settings,
  CreditCard,
  MessageSquareWarning,
  LogOut,
  ExternalLink,
  X
} from "lucide-react";

// ==========================================
// مكون رابط القائمة المفرّد (Nav Item)
// ==========================================
function NavItem({ to, label, icon, onNavigate, disabled, className = "", badge }) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 w-full text-left rtl:text-right px-4 py-3 rounded-2xl text-sm font-semibold text-gray-300 cursor-not-allowed opacity-60 select-none">
        <span className="shrink-0">{icon}</span>
        <span>{label}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      onClick={() => { if (window.innerWidth < 1024) onNavigate(); }} 
      className={({ isActive }) =>
        `flex items-center gap-3 w-full text-left rtl:text-right px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 border-l-4 border-transparent ${
          isActive
            ? "bg-[rgb(0,166,62)] text-white shadow-lg shadow-[rgba(0,166,62,0.3)] scale-[1.02] border-l-[rgb(0,166,62)] ring-2 ring-green-500/20"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:border-l-[rgb(0,166,62)]"
        } ${className}`
      }
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5 shadow-sm">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </NavLink>
  );
}

// ==========================================
// مكون الشريط الجانبي الرئيسي (Sidebar)
// ==========================================
export default function Sidebar({ open = false, onClose = () => {} }) {
  const { t } = useLanguage();
  const { user } = useAuth(); 

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [openComplaintsCount, setOpenComplaintsCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [ordersRes, complaintsRes] = await Promise.all([
          apiClient.get("/orders").catch(() => []),
          apiClient.get("/complaints").catch(() => []),
        ]);
        const orders = Array.isArray(ordersRes) ? ordersRes : [];
        const complaints = Array.isArray(complaintsRes) ? complaintsRes : [];
        setPendingOrdersCount(orders.filter((o) => String(o.status).toUpperCase() === "PENDING").length);
        setOpenComplaintsCount(complaints.filter((c) => c.status === "OPEN" || c.status === "REPLIED").length);
      } catch {
        // silently ignore
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasPermission = (pageId) => {
    if (!user) return false;
    if (user.role === "super_admin" || user.role === "store_manager") return true;
    return user.permissions?.includes(pageId);
  };

  const ALL_LINKS = [
    { id: "dashboard", label: t("dashboard"), to: "/", icon: <LayoutDashboard size={20} />, section: "main" },
    { id: "deals", label: t("deals"), to: "/deals", icon: <Tags size={20} />, section: "main" },
    { id: "products", label: t("products"), to: "/products", icon: <Package size={20} />, section: "main" },
    // 💡 تم تصحيح الـ id من bestSellers لـ bestProducts ليتطابق مع routesData
    { id: "bestProducts", label: t("bestSellers"), to: "/best-products", icon: <Star size={20} />, section: "main" }, 
    { id: "orders", label: t("orderLists"), to: "/orders", icon: <ShoppingCart size={20} />, section: "main", badge: pendingOrdersCount },
    { id: "announcement", label: t("announcementBanner"), to: "/announcement", icon: <MessageSquareWarning size={20} />, section: "pages" },
    { id: "heroSlider", label: t("heroSlider"), to: "/hero-slider", icon: <ImageIcon size={20} />, section: "main" },
    { id: "users", label: t("Users"), to: "/orders-by-users", icon: <Users size={20} />, section: "pages" },
    { id: "team", label: t("team"), to: "/team", icon: <ShieldCheck size={20} />, section: "pages" },
    { id: "categories", label: t("addCategory"), to: "/add-category", icon: <Tags size={20} />, section: "pages" },
    { id: "footer", label: t("FooterSettings"), to: "/FooterSettings", icon: <Settings size={20} />, section: "pages" },
    { id: "paymentMethods", label: t("paymentMethods"), to: "/payment-methods", icon: <CreditCard size={20} />, section: "pages" },
    { id: "complaints", label: t("complaintsFeedback"), to: "/complaints", icon: <MessageSquareWarning size={20} />, section: "pages", badge: openComplaintsCount },
  ];

  const mainLinks = ALL_LINKS.filter((link) => link.section === "main");
  const pageLinks = ALL_LINKS.filter((link) => link.section === "pages");

  return (
    <>
      {/* الـ Overlay للموبايل */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* القائمة الجانبية Aside */}
      <aside
        className={`fixed lg:static top-0 bottom-0 z-40 h-screen bg-gradient-to-b from-white to-gray-50 border-gray-100 ltr:border-r rtl:border-l flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
          open 
            ? "w-72 translate-x-0" 
            : "w-0 -translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="w-full h-full flex flex-col">
          {/* Green accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-600 shrink-0" />

          {/* الشعار وزر الإغلاق */}
          <div className="px-6 py-8 flex items-center justify-between shadow-sm">
            <span className="text-3xl font-extrabold tracking-tight">
              <span className="text-[rgb(0,166,62)]">Dea</span>
              <span className="text-gray-900">Lora</span>
            </span>
            {/* 💡 إخفاء زر الإغلاق على الشاشات الكبيرة lg:hidden */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* روابط التنقل */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-6">
            <div className="space-y-1.5">
              {mainLinks.map((link) => (
                <NavItem key={link.to} {...link} onNavigate={onClose} disabled={!hasPermission(link.id)} />
              ))}
            </div>

            {pageLinks.length > 0 && (
              <>
                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  </div>
                  <div className="relative flex justify-start">
                    <span className="bg-gradient-to-b from-white to-gray-50 pr-3 rtl:pr-0 rtl:pl-3 text-[10px] font-extrabold text-gray-300 uppercase tracking-[0.2em]">
                      {t("pages")}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {pageLinks.map((link) => (
                    <NavItem key={link.to} {...link} onNavigate={onClose} disabled={!hasPermission(link.id)} />
                  ))}
                </div>
              </>
            )}
          </nav>

          {/* أسفل القائمة */}
          <div className="px-4 pb-6 pt-4 border-t border-gray-200/60 space-y-2 bg-gradient-to-b from-gray-50 to-white">
            <a
              href={import.meta.env.VITE_STOREFRONT_URL || "/"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full text-left rtl:text-right px-4 py-3 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <ExternalLink size={20} />
              <span>{t("viewStore")}</span>
            </a>
            
            <NavItem 
              to="/settings" 
              label={t("settings")} 
              icon={<Settings size={20} />} 
              onNavigate={onClose} 
              disabled={!hasPermission("settings")}
            />
            
            <NavItem 
              to="/login" 
              label={t("logout")} 
              icon={<LogOut size={20} />} 
              onNavigate={onClose} 
              className="text-red-600 hover:bg-red-50 hover:text-red-700" 
            />
          </div>
        </div>
      </aside>
    </>
  );
}