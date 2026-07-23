import { Link } from 'react-router-dom';
import { User, Heart, ShoppingCart } from 'lucide-react';
import { useContext } from 'react';
import { SiteContext } from '../../Store/SiteContext';

const HeaderIcons = ({ isLoggedIn, wishListCount = 0, cartCount = 0 }) => {
  // 🟢 جلب بيانات اليوزر من الـ Context
  const { currentUser } = useContext(SiteContext);

  // 🟢 دالة لاقتطاع أول حرفين
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      
      {/* 👤 زر الحساب - تصميم هادئ يتحول لـ Premium عند التفاعل */}
      <Link 
        to={isLoggedIn ? "/profile" : "/login"} 
        className="relative flex items-center justify-center w-11 h-11 rounded-2xl text-gray-500 hover:text-[#00a650] bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-green-100 transition-all duration-300 shadow-2xs hover:shadow-md hover:shadow-green-100/50 active:scale-95 group overflow-hidden"
      >
        {/* 🟢 اللوجيك الجديد لظهور الصورة أو الحرفين */}
        {isLoggedIn && currentUser ? (
          currentUser.image ? (
            <img src={currentUser.image} alt="User" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <span className="font-bold text-sm text-green-600 group-hover:scale-110 transition-transform duration-300">
              {getInitials(currentUser.fullName)}
            </span>
          )
        ) : (
          <User size={20} className="stroke-[1.8] group-hover:scale-110 transition-transform duration-300" />
        )}
      </Link>

      {/* ❤️ زر المفضلة - بنظام نبض ذكي للمؤشر الخارجي */}
      <Link 
        to="/wishlist" 
        className="relative flex items-center justify-center w-11 h-11 rounded-2xl text-gray-500 hover:text-rose-500 bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-rose-100 transition-all duration-300 shadow-2xs hover:shadow-md hover:shadow-rose-100/50 active:scale-95 group"
      >
        <Heart size={20} className="stroke-[1.8] group-hover:scale-110 transition-transform duration-300" />
        
        {wishListCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            {/* تأثير الهالة النابضة خلف الرقم لإعطاء مظهر حيوي فخم */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-linear-to-tr from-rose-500 to-pink-500 text-white text-[9px] font-black items-center justify-center border border-white shadow-xs">
              {wishListCount}
            </span>
          </span>
        )}
      </Link>

      {/* 🛒 زر السلة - الأيقونة العائمة (Floating Luxury Element) */}
      <Link 
        to="/cart" 
        className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-linear-to-tr from-gray-900 to-slate-800 hover:from-[#00a650] hover:to-emerald-500 text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-200/50 active:scale-95 group"
      >
        <ShoppingCart size={19} className="stroke-2 group-hover:-translate-y-0.5 group-hover:rotate-[-4deg] transition-transform duration-300" />
        
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-black min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full border-2 border-slate-950 shadow-md group-hover:border-emerald-600 transition-colors duration-300">
            {cartCount}
          </span>
        )}
      </Link>

    </div>
  );
};

export default HeaderIcons;