import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteContext } from "../../Store/SiteContext"; 
import { X, Megaphone } from "lucide-react";

const HangingBanner = () => {
  const { announcement, lang } = useContext(SiteContext);
  const isAr = lang === "ar";

  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsDismissed(false);
  }, [announcement?.id]);

  if (!announcement || isDismissed) return null;

  const isExpiredGlobally = Date.now() >= (announcement.expiresAt || Infinity);
  if (isExpiredGlobally) return null;

  const {
    bgColor = "#064e3b",
    textColor = "#f0fdf4",
    titleColor = "#34d399",
    titleAr = "تنويه هام",
    titleEn = "IMPORTANT NOTICE"
  } = announcement;

  return (
    <AnimatePresence>
      <div className="fixed top-0 inset-x-0 z-[9999] flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: -250, rotate: -6 }}
          animate={{ 
            y: 0, 
            rotate: [6, -4, 2, -1, 0], 
          }}
          exit={{ y: -250, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            duration: 1.2
          }}
          className="relative flex flex-col items-center pointer-events-auto"
        >
          <div 
            style={{ backgroundColor: bgColor }} 
            className="absolute top-0 left-6 sm:left-12 w-0.5 h-12 sm:h-16 opacity-90 shadow-xs" 
          />
          <div 
            style={{ backgroundColor: bgColor }} 
            className="absolute top-0 right-6 sm:right-12 w-0.5 h-12 sm:h-16 opacity-90 shadow-xs" 
          />

          <div 
            style={{ backgroundColor: bgColor, borderColor: titleColor }}
            className="mt-12 sm:mt-16 w-fit max-w-[92vw] mx-4 border-2 rounded-xl shadow-2xl relative flex items-center gap-2 sm:gap-3 p-2.5 sm:py-3 sm:px-5 select-none text-start"
            dir={isAr ? "rtl" : "ltr"}
          >
            <div 
              style={{ color: titleColor, borderColor: titleColor }}
              className={`p-1.5 rounded-full border bg-black/10 animate-pulse shrink-0 ${
                isAr ? "transform scale-x-[-1]" : ""
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            <div className={`grow ${isAr ? "pl-5 pr-1 sm:pl-6 sm:pr-1" : "pr-5 pl-1 sm:pr-6 sm:pl-1"}`}>
              <span 
                style={{ color: titleColor }}
                className="block text-[9px] sm:text-[10px] font-black tracking-wider mb-0.5 leading-none"
              >
                {isAr ? titleAr : titleEn}
              </span>
              <p 
                style={{ color: textColor }}
                className="text-[11px] sm:text-xs md:text-sm font-semibold leading-relaxed drop-shadow-xs wrap-break-word"
              >
                {announcement.text}
              </p>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              style={{ color: titleColor }}
              className={`absolute top-1 p-1 rounded-full cursor-pointer hover:bg-black/10 transition-colors ${
                isAr ? "left-1" : "right-1"
              }`}
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HangingBanner;
