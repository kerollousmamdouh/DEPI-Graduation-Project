import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SiteContext } from "../../Store/SiteContext";
import { MessageCircle, X } from "lucide-react";

const AdminReplyBanner = () => {
  const { unreadReplyCount, lang } = useContext(SiteContext);
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (unreadReplyCount > 0) setDismissed(false);
  }, [unreadReplyCount]);

  if (!unreadReplyCount || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        className="fixed top-0 inset-x-0 z-[9998] flex justify-center pointer-events-none"
      >
        <div
          className="pointer-events-auto mx-2 mt-2 sm:mt-3 w-fit max-w-[95vw] flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2.5 sm:py-3 rounded-xl shadow-lg border border-emerald-400/50 cursor-pointer hover:shadow-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200"
          onClick={() => {
            localStorage.setItem("dealora_profile_active_tab", "chat");
            navigate("/profile");
          }}
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="p-1.5 bg-white/20 rounded-full animate-bounce">
            <MessageCircle className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold whitespace-nowrap">
            {isAr
              ? `لديك ${unreadReplyCount} رد${unreadReplyCount > 1 ? "ود" : ""} جديد من الدعم`
              : `${unreadReplyCount} new support repl${unreadReplyCount > 1 ? "ies" : "y"}`}
          </span>
          <span className="hidden sm:inline text-[10px] text-white/80">
            {isAr ? "اضغط للمتابعة" : "Click to view"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminReplyBanner;
