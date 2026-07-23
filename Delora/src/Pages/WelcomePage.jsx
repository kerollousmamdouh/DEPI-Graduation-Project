import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import bag from "../assets/images/bag.svg";
import cart from "../assets/images/cart.svg";
import ball from "../assets/images/ball.svg";
import text from "../assets/images/text.svg";

const WelcomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => { navigate("/home"); }, 5100);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-9999">
      <div className="relative w-80 h-96 flex flex-col items-center justify-center">
        
        <div className="relative w-full h-80">
          
          {/* 1. الشنطة: تظهر أولاً (مكحرته من اليمين) */}
          <motion.img src={bag} className="absolute inset-0 w-full h-full object-contain" 
            initial={{ x: 300, rotate: 720, opacity: 0 }} 
            animate={{ x: 0, rotate: 0, opacity: 1 }} 
            transition={{ duration: 1, ease: "easeOut" }} 
          />

          {/* 2. السلة: تظهر مع الكرة (من الشمال) */}
          <motion.img src={cart} className="absolute inset-0 w-full h-full object-contain" 
            initial={{ x: -300, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            transition={{ delay: 1, duration: 1, ease: "linear" }} 
          />

          {/* 3. الكرة: تتنطط فوق الشنطة (تظهر مع السلة) وتستقر */}
          {/* 3. الكرة */}
          <motion.img src={ball} className="absolute inset-0 w-full h-full object-contain" 
            initial={{ x: -100, y: 0, opacity: 0 }} 
            animate={{ 
              x: [-100, 100, -50, 0], 
              y: [0, -50, 0],
              opacity: 1 
            }} 
            transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }} 
          />
        </div>

        {/* 4. الكلمة: تظهر في النهاية بقلبة احترافية */}
        <motion.div 
          className="absolute bottom-15 w-60 overflow-hidden flex justify-center"
          initial={{ opacity: 0, y: 100, rotateX: -90 }} 
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ 
            delay: 3, // تظهر بعد ما السلة والكرة يستقروا
            duration: 1, 
            type: "spring", 
            stiffness: 100, 
            damping: 12, 
          }}
        >
          <img src={text} alt="Dealora" className="w-full object-contain" />
        </motion.div>
        
      </div>
    </div>
  );
};

export default WelcomePage;