import { useState, useContext } from "react";
import { SiteContext } from "../Store/SiteContext";
import {
  Phone,
  Clock,
  MessageSquare,
  MapPin,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaSnapchatGhost,
  FaTiktok,
  FaTwitter,
  FaTelegramPlane,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = ({ lang = "ar" }) => { 
  const { adminData } = useContext(SiteContext);
  const [showBranches, setShowBranches] = useState(false);
  
  const isRtl = lang === "ar"; 

  return (
    <footer
      className="bg-[#0b1120] text-slate-300 pt-10 pb-6 border-t-4 border-[#00a650]"
      dir={isRtl ? "rtl" : "ltr"} 
    >
      <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. الهوية واللوجو */}
        <div className="flex flex-col gap-2">
          <Link 
            to="/home" 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
            className="shrink-0 flex items-center"
          >
            <img
              src={adminData.logo2}
              alt="DELORA Logo"
              className="w-24 h-24 lg:w-32 lg:h-32 object-contain rounded-xl hover:opacity-90 transition-opacity"
            />
          </Link>
          <p className="text-[11px] lg:text-sm text-slate-400">
            {isRtl ? adminData.about : (adminData.aboutEn || adminData.about)}
          </p>
        </div>

        {/* 2. اتصل بنا */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white text-sm lg:text-lg border-b border-slate-700 pb-1">
            {isRtl ? "اتصل بنا" : "Contact Us"}
          </h4>
          <div className="space-y-2 text-[11px] lg:text-sm">
            {adminData.phones.map((phone, i) => (
              <a
                key={i}
                href={`tel:${phone}`}
                className="flex items-center gap-2 hover:text-[#00a650] transition-colors"
              >
                <Phone size={14} className="text-[#00a650]" /> {phone}
              </a>
            ))}
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#00a650]" />{" "}
              {adminData.workingHours}
            </div>
            {adminData.locations.map((loc, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300">
                <MapPin size={14} className="text-[#00a650] shrink-0 mt-0.5" />
                <span>{isRtl ? loc.name : (loc.nameEn || loc.name)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. خدمة العملاء (سوشيال ميديا فقط) */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white text-sm lg:text-lg border-b border-slate-700 pb-1">
            {isRtl ? "خدمة العملاء" : "Customer Service"}
          </h4>

          {/* الحاوية بنظام الشبكة (Grid) لتضمن ظهور 3 في كل سطر */}
          <div className="grid grid-cols-3 gap-2 mt-2 max-w-35">
            {adminData.socialLinks.map((link, i) => {
              const socialConfig = {
                facebook: { icon: <FaFacebookF size={16} />, color: "hover:bg-[#1877F2]" },
                instagram: { icon: <FaInstagram size={16} />, color: "hover:bg-[#E4405F]" },
                whatsapp: { icon: <FaWhatsapp size={16} />, color: "hover:bg-[#25D366]" },
                snapchat: { icon: <FaSnapchatGhost size={16} />, color: "hover:bg-[#FFFC00] hover:text-black" },
                tiktok: { icon: <FaTiktok size={16} />, color: "hover:bg-[#000000]" },
                twitter: { icon: <FaTwitter size={16} />, color: "hover:bg-[#1DA1F2]" },
                telegram: { icon: <FaTelegramPlane size={16} />, color: "hover:bg-[#0088CC]" },
              };

              const config = socialConfig[link.icon] || { icon: <MessageSquare size={16} />, color: "hover:bg-[#00a650]" };

              return (
                <div key={i} className="relative group">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-10 h-10 bg-slate-800 rounded-xl transition-all duration-300 flex items-center justify-center text-white ${config.color}`}
                  >
                    {config.icon}
                  </a>
                  
                  {/* التولتيب */}
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {link.name}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. خريطة الموقع */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white text-sm lg:text-lg border-b border-slate-700 pb-1">
            {isRtl ? "موقعنا" : "Our Location"}
          </h4>
          {showBranches ? (
            <div className="flex flex-col gap-2 animate-in fade-in duration-300">
              {adminData.locations.map((loc, i) => (
                <a
                  key={i}
                  href={loc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 hover:bg-[#00a650] text-[11px] p-2 rounded-lg transition-colors flex items-center justify-between"
                >
                  {isRtl ? loc.name : (loc.nameEn || loc.name)}
                  <MapPin size={12} />
                </a>
              ))}
              <button
                onClick={() => setShowBranches(false)}
                className="text-[10px] text-slate-500 hover:text-white underline mt-1"
              >
                {isRtl ? "إغلاق" : "Close"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowBranches(true)}
              className="block overflow-hidden rounded-xl border border-slate-700 h-24 lg:h-32 bg-slate-800 relative group transition-all hover:border-[#00a650] w-full"
            >
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400"
                alt="Map"
                className="w-full h-full object-cover opacity-40 group-hover:opacity-100"
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold bg-black/40 group-hover:bg-transparent">
                {isRtl ? "اضغط لاختيار الفرع" : "Click to select branch"}
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 mt-8 pt-4 border-t border-slate-800 text-center text-slate-500 text-[10px]">
        © {new Date().getFullYear()} DELORA STORE. {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}
      </div>
    </footer>
  );
};

export default Footer;