import { useState, useEffect, useCallback, useContext } from "react";
import { ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SiteContext } from "../../Store/SiteContext"; // 👈 تأكد من صحة مسار الـ Context عندك

export default function HeroSlider({ lang = "ar" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  
  // 📥 سحب بيانات السلايدر ديناميكياً من الـ Context
  const { adminData } = useContext(SiteContext);
  const data = adminData?.HeroSliderData || []; // تأكد أن الباك اند أو الـ initialData مسميها heroSlider
  
  const isRtl = lang === "ar";

  const nextSlide = useCallback(() => {
    if (data.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === data.length - 1 ? 0 : prevIndex + 1,
    );
  }, [data.length]);

  const prevSlide = useCallback(() => {
    if (data.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? data.length - 1 : prevIndex - 1,
    );
  }, [data.length]);

  useEffect(() => {
    if (data.length === 0) return;
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [nextSlide, data.length]);

  // 🛡️ حماية لو البيانات لسه مش موجودة أو مفيش سلايدرز عشان الموقع ميكراشش
  if (!data || data.length === 0) {
    return <div className="w-full h-80 sm:h-100 md:h-120 bg-gray-50 rounded-3xl animate-pulse" />;
  }

  return (
    <div
      className="relative w-full h-80 sm:h-100 md:h-120 bg-white rounded-3xl overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-gray-100 select-none"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ================= 1. حاوية السلايدز المنزلقة ================= */}
      <div
        className="flex w-full h-full transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
        style={{
          transform: `translateX(${currentIndex * (isRtl ? 100 : -100)}%)`,
        }}
      >
        {data.map((slide, index) => {
          const isActive = currentIndex === index;

          // 🌟 منطق اللغة (Fallback) المعتمد في كودك الأصلي
          const title = isRtl
            ? slide.title?.ar || slide.title?.en
            : slide.title?.en || slide.title?.ar;
          const subtitle = isRtl
            ? slide.subtitle?.ar || slide.subtitle?.en
            : slide.subtitle?.en || slide.subtitle?.ar;
          const buttonText = isRtl
            ? slide.buttonText?.ar || slide.buttonText?.en
            : slide.buttonText?.en || slide.buttonText?.ar;

          return (
            <div
              key={slide.id}
              className="w-full h-full shrink-0 relative flex items-center overflow-hidden"
            >
              <img
                src={slide.image}
                alt="slide background"
                className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-6000 ${isActive ? "scale-103" : "scale-100"}`}
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent sm:bg-linear-to-r sm:from-white/90 sm:via-white/40 sm:to-transparent"></div>

              <div
                className="relative z-10 w-full px-6 sm:px-12 md:px-20 pt-16 sm:pt-0 max-w-xl"
                style={{ textAlign: isRtl ? "right" : "left" }}
              >
                <div className="space-y-2 sm:space-y-4">
                  <span
                    className={`inline-block text-[#3BB77E] sm:text-[#3BB77E] bg-white/90 sm:bg-transparent px-2.5 py-0.5 sm:p-0 rounded-md font-black text-[11px] sm:text-base tracking-wide uppercase transition-all duration-700 delay-100 transform ${isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
                  >
                    {subtitle}
                  </span>

                  <h1
                    className={`text-xl sm:text-3xl md:text-5xl font-black text-white sm:text-[#253D4E] leading-snug sm:leading-[1.2] whitespace-pre-line transition-all duration-700 delay-200 transform ${isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
                  >
                    {title}
                  </h1>

                  <div
                    className={`pt-1 sm:pt-2 transition-all duration-700 delay-300 transform ${isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
                  >
                    <button
                      onClick={() => {
                        if (slide.category) navigate(`/category/${slide.category}`);
                        else if (slide.categoryId) navigate(`/category/${slide.categoryId}`);
                      }}
                      className="bg-[#3BB77E] sm:bg-[#253D4E] hover:bg-[#253D4E] sm:hover:bg-[#3BB77E] text-white px-5 sm:px-7 py-2 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 group/btn"
                      style={{ flexDirection: isRtl ? "row" : "row-reverse" }}
                    >
                      <span>{buttonText}</span>
                      <ArrowLeft
                        size={14}
                        className={`transition-transform duration-300 ${
                          isRtl
                            ? "group-hover/btn:-translate-x-1"
                            : "rotate-180 group-hover/btn:translate-x-1"
                        }`}
                      />{" "}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= 2. أسهم التنقل ================= */}
      <button
        onClick={isRtl ? nextSlide : prevSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-[#253D4E] hover:bg-[#3BB77E] hover:text-white hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md active:scale-90 cursor-pointer z-20"
      >
        <ChevronRight size={20} />
      </button>

      <button
        onClick={isRtl ? prevSlide : nextSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-[#253D4E] hover:bg-[#3BB77E] hover:text-white hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md active:scale-90 cursor-pointer z-20"
      >
        <ChevronLeft size={20} />
      </button>

      {/* ================= 3. النقط السفلية ================= */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-12 flex items-center gap-1.5 z-20">
        {data.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${
              currentIndex === index
                ? "w-6 bg-[#3BB77E] sm:bg-[#3BB77E] shadow-sm"
                : "w-1.5 bg-white/60 sm:bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}