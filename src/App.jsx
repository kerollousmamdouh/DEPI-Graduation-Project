import { useState, useEffect, useContext } from "react"; 
import { Routes, Route, useLocation, useNavigate } from "react-router-dom"; 
import WelcomePage from "./Pages/WelcomePage";
import Header from "./Layout/Header";
import Footer from "./Layout/Footer";
import HomePage from "./Pages/HomePage";
import CategoryPage from "./Pages/CategoryPage";
import OfferPage from "./Pages/OfferPage";
import CartPage from "./Pages/CartPage";
import ProfilePage from "./Pages/ProfilePage";
import RegisterPage from "./Pages/RegisterPage";
import LoginPage from "./Pages/LoginPage";
import ErrorPage from "./Pages/ErrorPage";
import ProductPage from "./Pages/ProductPage";
import WishlistPage from "./Pages/wishlist"; 
import "./App.css";
import { SiteProvider } from './Store/SiteProvider';
import { SiteContext } from './Store/SiteContext'; 
import ScrollButton from "./Components/scorllTo/ScrollButton";
import CheckoutPage from "./Pages/PayPage";
import ForgotPasswordPage from './Pages/ForgetPassPage';
import ProtectedAdminRoute from "./Services/ProtectedAdminRoute"; 
import { motion, AnimatePresence } from "framer-motion";
import HangingBanner from "./Components/HeaderUI/HangingBanner"; // تأكد من صحة مسار الملف عندك
const playSuccessSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); 
  audio.volume = 0.5; 
  audio.play().catch(error => {
    console.log("Audio play blocked by browser setup:", error);
  });
};

function AppContent() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  
  const { 
    adminData, 
    currentUser, 
    wishlistItems = [], 
    toggleWishlist,
    createOrder ,
    announcement
  } = useContext(SiteContext);
  
  const categories = adminData?.categories || [];
  const allProducts = categories.flatMap(cat => cat.products || []);
  const [cartWarning, setCartWarning] = useState("");
  const [lang, setLang] = useState("ar");

  // 🛒 سلة المشتريات المحلية
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("dealora_market_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // حفظ السلة تلقائياً في الـ LocalStorage
  useEffect(() => {
    localStorage.setItem("dealora_market_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const [scrollTrigger, setScrollTrigger] = useState(0);
  const location = useLocation();

  const hideHeaderPaths = ["/", "/login", "/register", "/profile", "/cart", "/wishlist", "/checkout"];

  const isErrorPage = !["/home", "/offers", "/products", "/category"].some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  ) && !hideHeaderPaths.includes(location.pathname) && !location.pathname.startsWith("/dashboard");

  const shouldHideHeader = hideHeaderPaths.includes(location.pathname) || isErrorPage || location.pathname.startsWith("/dashboard");
  
  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery("");
    }, 0);
    return () => clearTimeout(handle);
  }, [location.pathname]);

  const handleTriggerScroll = () => {
    setScrollTrigger((prev) => prev + 1);
  };

  const addToCart = (product, requestedAmount) => {
    if (!currentUser) {
      setCartWarning("يجب تسجيل الدخول أولاً لإضافة منتجات إلى السلة!");
      
      setTimeout(() => {
        setCartWarning("");
        navigate("/login"); 
      }, 2000);
      return;
    }
    playSuccessSound();
    setCartItems((prevItems) => {
      const alreadyInCart = prevItems
        .filter((item) => item.id === product.id)
        .reduce((sum, item) => sum + (product.isWeightType ? (item.weightGrams || 0) : (item.quantity || 0)), 0);

      const totalDesired = alreadyInCart + requestedAmount;
      if (totalDesired > (product.stock || 0)) {
        return prevItems;
      }

      let newItems = [...prevItems];
      let remainingToProcess = requestedAmount;

      const alreadyInOffer = newItems
        .filter(i => i.id === product.id && i.isOfferItem === true)
        .reduce((sum, i) => sum + (product.isWeightType ? (i.weightGrams || 0) : (i.quantity || 0)), 0);
      
      const offerAvailable = Math.max(0, (product.offerStock || 0) - alreadyInOffer);

      const takeFromOffer = Math.min(remainingToProcess, offerAvailable);
      if (takeFromOffer > 0) {
        const index = newItems.findIndex(i => i.id === product.id && i.isOfferItem === true);
        if (index > -1) {
          newItems[index].quantity += product.isWeightType ? 0 : takeFromOffer;
          newItems[index].weightGrams += product.isWeightType ? takeFromOffer : 0;
          const totalQty = newItems[index].weightGrams || newItems[index].quantity;
          newItems[index].price = product.isWeightType ? (product.offerPrice * totalQty) / 1000 : (product.offerPrice * totalQty);
        } else {
          newItems.push({ 
            ...product, 
            isOfferItem: true, 
            quantity: product.isWeightType ? 1 : takeFromOffer, 
            weightGrams: product.isWeightType ? takeFromOffer : 0, 
            price: product.isWeightType ? (product.offerPrice * takeFromOffer) / 1000 : (product.offerPrice * takeFromOffer) 
          });
        }
        remainingToProcess -= takeFromOffer;
      }

      if (remainingToProcess > 0) {
        const index = newItems.findIndex(i => i.id === product.id && i.isOfferItem === false);
        if (index > -1) {
          newItems[index].quantity += product.isWeightType ? 0 : remainingToProcess;
          newItems[index].weightGrams += product.isWeightType ? remainingToProcess : 0;
          const totalQty = newItems[index].weightGrams || newItems[index].quantity;
          newItems[index].price = product.isWeightType ? (product.price * totalQty) / 1000 : (product.price * totalQty);
        } else {
          newItems.push({ 
            ...product, 
            isOfferItem: false, 
            quantity: product.isWeightType ? 1 : remainingToProcess, 
            weightGrams: product.isWeightType ? remainingToProcess : 0, 
            price: product.isWeightType ? (product.price * remainingToProcess) / 1000 : (product.price * remainingToProcess) 
          });
        }
      }
      return newItems;
    });
  };

  // 📦 دالة تأكيد الأوردر وإتمام الشراء
  const handleCheckout = (paymentMethod) => {
    if (cartItems.length === 0) return;

    const totalCalculated = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);

    const orderPayload = {
      items: cartItems,
      totalPrice: totalCalculated,
      customer: currentUser,
      paymentMethod: paymentMethod || "COD"
    };

    // 1. إنشاء الأوردر وحفظه في الـ Context / الباك إند
    createOrder(orderPayload);

    // 2. تصفير السلة تماماً بعد نجاح الطلب
    setCartItems([]);
    localStorage.removeItem("dealora_market_cart");

    // 3. التوجيه لبروفايل المستخدم لرؤية الأوردر الجديد (المفضلة تظل آمنة كما هي)
    navigate("/profile");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AnimatePresence>
        {cartWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-4 left-1/2 z-100 bg-red-600/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm border border-red-400 flex items-center gap-2"
          >
            <span>⚠️</span>
            {cartWarning}
          </motion.div>
        )}
      </AnimatePresence>
      {!shouldHideHeader && (
        <HangingBanner key={announcement?.id || "no-announcement"} />
      )}
      {!shouldHideHeader && (
        <Header
          query={query}
          setQuery={setQuery}
          onTriggerScroll={handleTriggerScroll}
          wishListCount={wishlistItems.length}
          cartCount={cartItems.length}
          lang={lang}
          setLang={setLang}
        />
      )}

      <main className="grow">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/home" element={<HomePage query={query} scrollTrigger={scrollTrigger} setQuery={setQuery} addToCart={addToCart} addToWishlist={toggleWishlist} wishlistItems={wishlistItems} cartItems={cartItems} lang={lang} />} />
          <Route path="/category/:categoryId" element={<CategoryPage query={query} scrollTrigger={scrollTrigger} addToWishlist={toggleWishlist} wishlistItems={wishlistItems} addToCart={addToCart} cartItems={cartItems} lang={lang} />} />
          <Route path="/offers" element={<OfferPage query={query} scrollTrigger={scrollTrigger} wishlistItems={wishlistItems} addToWishlist={toggleWishlist} addToCart={addToCart} cartItems={cartItems} lang={lang} />} />
          <Route path="/cart" element={<CartPage cartItems={cartItems} setCartItems={setCartItems} allProducts={allProducts} lang={lang} />} />
          <Route path="/wishlist" element={<WishlistPage wishlistItems={wishlistItems} addToWishlist={toggleWishlist} addToCart={addToCart} categories={categories} cartItems={cartItems} setCartItems={setCartItems} lang={lang} />} />
          <Route path="/products" element={<ProductPage query={query} scrollTrigger={scrollTrigger} wishlistItems={wishlistItems} addToWishlist={toggleWishlist} addToCart={cartItems} lang={lang} />} />
          
          <Route path="/profile" element={<ProfilePage />} />          
          <Route path="/register" element={<RegisterPage lang={lang} />} />
          <Route path="/login" element={<LoginPage lang={lang} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* ربط صفحة الدفع بالدالة الذكية */}
          <Route path="/checkout" element={<CheckoutPage lang={lang} cartItems={cartItems} onCheckout={handleCheckout} />} />
          
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedAdminRoute>
                <div className="p-8 bg-gray-100 min-h-screen">
                  <h1 className="text-2xl font-bold text-emerald-600">مرحباً بك في لوحة تحكم ديلورا ماركت 🛒</h1>
                  <p className="mt-2 text-gray-600">المسار محمي بالكامل وجاهز لربط الـ APIs والمكونات الفرعية ديناميكياً</p>
                </div>
              </ProtectedAdminRoute>
            } 
          />

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
      {!shouldHideHeader && <ScrollButton />}
      {!shouldHideHeader && <Footer lang={lang} setLang={setLang} />}
    </div>
  );
}

function App() {
  return (
    <SiteProvider>
      <AppContent />
    </SiteProvider>
  );
}

export default App;