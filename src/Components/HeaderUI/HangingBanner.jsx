import { useState, useEffect, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteContext } from "../../Store/SiteContext"; 
import { X, Megaphone } from "lucide-react";

const HangingBanner = () => {
  const { announcement, lang } = useContext(SiteContext);
  const isAr = lang === "ar";

  const [now, setNow] = useState(() => Date.now());
  const [isDismissed, setIsDismissed] = useState(false);

  // 1️⃣ حساب قرار الظهور فوراً قبل الـ Render لمنع التكرار (No Cascading Renders)
  const shouldRender = useMemo(() => {
    if (!announcement) return false;
    
    const sessionKey = `dealora_ann_views_${announcement.id}`;
    if (typeof window !== "undefined" && window.sessionStorage) {
      const storedViews = sessionStorage.getItem(sessionKey);
      const currentViews = storedViews ? parseInt(storedViews, 10) : 0;
      return currentViews < 2; // مسموح فقط للمرة الأولى والثانية
    }
    return true;
  }, [announcement]);

  // 2️⃣ تحديث الـ sessionStorage كـ Side Effect نقي بدون لمس الـ State
  useEffect(() => {
    if (!announcement || !shouldRender) return;
    
    const sessionKey = `dealora_ann_views_${announcement.id}`;
    if (typeof window !== "undefined" && window.sessionStorage) {
      const storedViews = sessionStorage.getItem(sessionKey);
      const currentViews = storedViews ? parseInt(storedViews, 10) : 0;
      sessionStorage.setItem(sessionKey, (currentViews + 1).toString());
    }
  }, [announcement, shouldRender]);

  // 3️⃣ تشغيل التايمر لتحديث الوقت الحالي كل ثانية بفحص الصلاحية الكلية
  useEffect(() => {
    if (!announcement || !shouldRender) return;
    
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [announcement, shouldRender]);

  // 🚨 شروط الحجب الفوري لليافطة
  if (!announcement || isDismissed || !shouldRender) return null;

  // 4️⃣ فحص صلاحية الوقت الإجمالي للإعلان (الوقت المجدد من الأدمن)
  const isExpiredGlobally = now - announcement.createdAt >= announcement.totalDurationMs;
  if (isExpiredGlobally) return null;

  // فك خصائص الألوان والعناوين المحددة من الأدمن مع وضع بدائل أمان
  const {
    bgColor = "#064e3b",
    textColor = "#f0fdf4",
    titleColor = "#34d399",
    titleAr = "تنويه هام",
    titleEn = "IMPORTANT NOTICE"
  } = announcement;

  return (
    <AnimatePresence>
      {/* الـ Container مع الـ z-index الأقوى لضمان عدم الاختفاء خلف الهيدر */}
      <div className="fixed top-0 inset-x-0 z-9999 flex justify-center pointer-events-none">
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
          {/* 🪢 الحبال مربوطة بأعلى الشاشة تماماً وتأخذ لون اليافطة أوتوماتيكياً */}
          <div 
            style={{ backgroundColor: bgColor }} 
            className="absolute top-0 left-6 sm:left-12 w-0.5 h-12 sm:h-16 opacity-90 shadow-xs" 
          />
          <div 
            style={{ backgroundColor: bgColor }} 
            className="absolute top-0 right-6 sm:right-12 w-0.5 h-12 sm:h-16 opacity-90 shadow-xs" 
          />

          {/* 🎪 جسم اليافطة المرن: يتمدد على قدر الكلام (w-fit) ومصمم خصيصاً للموبايل */}
          <div 
            style={{ backgroundColor: bgColor, borderColor: titleColor }}
            className="mt-12 sm:mt-16 w-fit max-w-[92vw] mx-4 border-2 rounded-xl shadow-2xl relative flex items-center gap-2 sm:gap-3 p-2.5 sm:py-3 sm:px-5 select-none text-start"
            dir={isAr ? "rtl" : "ltr"}
          >
            
            {/* أيقونة الزمور: تعكس اتجاهها حسب اتجاه اللغة */}
            <div 
              style={{ color: titleColor, borderColor: titleColor }}
              className={`p-1.5 rounded-full border bg-black/10 animate-pulse shrink-0 ${
                isAr ? "transform scale-x-[-1]" : ""
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            {/* النصوص: متجاوبة تماماً مع حجم الخطوط وتباعد الأزرار في الهواتف */}
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

            {/* زرار الإغلاق اليدوي: يتموضع مرناً حسب اللغة */}
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