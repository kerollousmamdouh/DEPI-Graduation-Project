import ProfileMenu from "./common/ProfileMenu";
import LanguageToggle from "./common/LanguageToggle";
import { useAuth } from "../context/AuthContext";
import { Menu } from "lucide-react";

export default function Topbar({ onMenuClick = () => {}, isOpen = false }) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between gap-3 px-4 sm:px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-20">
      
      {/* 1. زرار المنيو */}
      {!isOpen ? (
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-[rgb(0,166,62)] transition-all duration-200 active:scale-95"
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>
      ) : (
        <div className="w-10"></div> 
      )}

      <div className="flex-1"></div>

      {/* 2. منطقة البيانات (الاسم والصورة) */}
      <div className="flex items-center gap-3 sm:gap-4">
        <LanguageToggle />

        <div className="flex items-center gap-3">
          {/* الاسم والرول (شلت الـ hidden عشان يظهر دايماً) */}
          <div className="text-right leading-tight">
            <p className="text-sm font-bold text-gray-900">
              {user?.fullName || "User"}
            </p>
            <p className="text-xs font-medium text-gray-400">
              {user?.jobTitle || "Admin"}
            </p>
          </div>
          
          {/* ProfileMenu (دي اللي جواها الصورة الوحيدة) */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}