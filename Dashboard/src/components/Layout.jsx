import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { 
  LayoutDashboard, Package, Star, ShoppingCart, Image as ImageIcon, 
  Users, ShieldCheck, Tags, Settings, CreditCard, MessageSquareWarning 
} from "lucide-react";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const ALL_LINKS = [
    { id: "dashboard", label: t("dashboard"), to: "/", icon: <LayoutDashboard size={20} />, section: "main" },
    { id: "products", label: t("products"), to: "/products", icon: <Package size={20} />, section: "main" },
    { id: "bestProducts", label: t("bestSellers"), to: "/best-products", icon: <Star size={20} />, section: "main" },
    { id: "orders", label: t("orderLists"), to: "/orders", icon: <ShoppingCart size={20} />, section: "main" },
    { id: "announcement", label: t("announcementBanner"), to: "/announcement", icon: <MessageSquareWarning size={20} />, section: "pages" },
    { id: "heroSlider", label: t("heroSlider"), to: "/hero-slider", icon: <ImageIcon size={20} />, section: "main" },
    { id: "users", label: t("Users"), to: "/orders-by-users", icon: <Users size={20} />, section: "pages" },
    { id: "team", label: t("team"), to: "/team", icon: <ShieldCheck size={20} />, section: "pages" },
    { id: "categories", label: t("addCategory"), to: "/add-category", icon: <Tags size={20} />, section: "pages" },
    { id: "footer", label: t("FooterSettings"), to: "/FooterSettings", icon: <Settings size={20} />, section: "pages" },
    { id: "paymentMethods", label: t("paymentMethods"), to: "/payment-methods", icon: <CreditCard size={20} />, section: "pages" },
    { id: "complaints", label: t("complaintsFeedback"), to: "/complaints", icon: <MessageSquareWarning size={20} />, section: "pages" },
  ];

  const getFirstAllowedRoute = () => {
    if (!user) return "/login";
    const allowed = ALL_LINKS.filter(l =>
      user.role === "super_admin" || user.role === "store_manager" || user.permissions?.includes(l.id)
    );
    return allowed.length > 0 ? allowed[0].to : "/"; 
  };

  useEffect(() => {
    if (user && location.pathname === "/") {
       const firstRoute = getFirstAllowedRoute();
       if (firstRoute !== "/") {
         navigate(firstRoute);
       }
    }
  }, [user, location.pathname, navigate]);

  return (
    // overflow-x-hidden هنا على الـ Wrapper الرئيسي بتمنع أي سكرول عرضي نهائياً في الفون
    <div className="flex h-screen w-full bg-gray-50 transition-colors duration-200 overflow-x-hidden antialiased">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* الـ min-w-0 مع h-full و overflow-hidden بتجبر المحتوى الداخلي يحترم مقاس الشاشة */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300">
        <Topbar isOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* حزام الأمان للـ Pages: السكرول يكون رأسي فقط والـ x مقفول تماماً */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 animate-fadein">
          <div className="mx-auto max-w-full">
            <Outlet /> 
          </div>
        </main>
      </div>
    </div>
  );
}