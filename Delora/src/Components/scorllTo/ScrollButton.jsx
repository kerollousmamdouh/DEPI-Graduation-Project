import { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const ScrollButton = () => {
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // نعتبر "منتصف الصفحة" هو نزول أكثر من 40%
      const scrollPosition = window.scrollY;
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // إظهار سهم الصعود إذا نزلنا أكثر من 40%
      setShowScrollUp(scrollPosition > (pageHeight * 0.4));
      
      // إظهار سهم النزول إذا كنا في الـ 40% الأولى
      setShowScrollDown(scrollPosition <= (pageHeight * 0.4));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* زر الصعود للأعلى (يظهر عند النزول) */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-9999 p-4 rounded-full bg-[#00a650] text-white shadow-lg transition-all duration-500 ease-in-out transform 
        ${showScrollUp ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-0"}`}
      >
        <FaArrowUp size={20} />
      </button>

      {/* زر النزول للأسفل (يظهر عند البقاء في الأعلى) */}
      <button
        onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-9999 p-4 rounded-full bg-slate-800 text-white shadow-lg transition-all duration-500 ease-in-out transform 
        ${showScrollDown ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-0"}`}
      >
        <FaArrowDown size={20} />
      </button>
    </>
  );
};

export default ScrollButton;