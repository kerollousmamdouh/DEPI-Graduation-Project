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
import ResetPasswordPage from './Pages/ResetPasswordPage';
import ProtectedAdminRoute from "./Services/ProtectedAdminRoute"; 
import { motion, AnimatePresence } from "framer-motion";
import HangingBanner from "./Components/HeaderUI/HangingBanner";
import AdminReplyBanner from "./Components/HeaderUI/AdminReplyBanner";
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
    try {
      const savedCart = localStorage.getItem("dealora_market_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch { return []; }
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
    const isWeightType = product?.unitType === "weight";
    const currentPrice = product?.currentPrice || product?.price || 0;
    const offerPrice = product?.offerPrice || null;
    const price = Number(product?.price || currentPrice);

    const alreadyInCart = prevItems
      .filter((item) => item.id === product.id)
      .reduce((sum, item) => sum + (isWeightType ? (item.weightGrams || 0) : (item.quantity || 0)), 0);

    const totalDesired = alreadyInCart + requestedAmount;
    
    if (totalDesired > (product.stock || 0)) {
      return prevItems;
    }

    let newItems = [...prevItems];
    let remainingToProcess = requestedAmount;

    const hasActiveOffer = offerPrice && Number(offerPrice) > 0 && Number(offerPrice) < Number(price);
    let takeFromOffer = 0;

    if (hasActiveOffer) {
      const isTimeBound = product?.offerExpiresAt && new Date() < new Date(product.offerExpiresAt);
      const isStockLimited = !isTimeBound && product.offerStock != null;

      if (isTimeBound) {
        takeFromOffer = remainingToProcess;
      } else if (isStockLimited) {
        const alreadyInOffer = newItems
          .filter(i => i.id === product.id && i.isOfferItem === true)
          .reduce((sum, i) => sum + (isWeightType ? (i.weightGrams || 0) : (i.quantity || 0)), 0);
        const offerAvailable = Math.max(0, Number(product.offerStock) - alreadyInOffer);
        takeFromOffer = Math.min(remainingToProcess, offerAvailable);
      } else if (!product?.offerExpiresAt && product.offerStock == null) {
        takeFromOffer = remainingToProcess;
      }
    }

    if (takeFromOffer > 0) {
      const index = newItems.findIndex(i => i.id === product.id && i.isOfferItem === true);
      const effectiveOfferPrice = Number(offerPrice);
      
      if (index > -1) {
        const updatedItem = { ...newItems[index] };
        if (isWeightType) {
          updatedItem.weightGrams += takeFromOffer;
          updatedItem.price = (effectiveOfferPrice * updatedItem.weightGrams) / 1000;
        } else {
          updatedItem.quantity += takeFromOffer;
          updatedItem.price = effectiveOfferPrice * updatedItem.quantity;
        }
        newItems[index] = updatedItem;
      } else {
        newItems.push({ 
          ...product, 
          isOfferItem: true, 
          quantity: isWeightType ? 0 : takeFromOffer,
          weightGrams: isWeightType ? takeFromOffer : 0, 
          price: isWeightType ? (effectiveOfferPrice * takeFromOffer) / 1000 : effectiveOfferPrice * takeFromOffer
        });
      }
      remainingToProcess -= takeFromOffer;
    }

    if (remainingToProcess > 0) {
      const index = newItems.findIndex(i => i.id === product.id && i.isOfferItem === false);
      
      if (index > -1) {
        const updatedItem = { ...newItems[index] };
        if (isWeightType) {
          updatedItem.weightGrams += remainingToProcess;
          updatedItem.price = (price * updatedItem.weightGrams) / 1000;
        } else {
          updatedItem.quantity += remainingToProcess;
          updatedItem.price = price * updatedItem.quantity;
        }
        newItems[index] = updatedItem;
      } else {
        newItems.push({ 
          ...product, 
          isOfferItem: false, 
          quantity: isWeightType ? 0 : remainingToProcess, 
          weightGrams: isWeightType ? remainingToProcess : 0, 
          price: isWeightType ? (price * remainingToProcess) / 1000 : price * remainingToProcess
        });
      }
    }

    return newItems;
  });
};

  // 📦 دالة تأكيد الأوردر وإتمام الشراء
  const handleCheckout = async (orderData) => {
    if (cartItems.length === 0) return;

    // orderData comes from PayPage with customer info, address, payment, etc.
    const orderPayload = {
      items: cartItems,
      totalPrice: cartItems.reduce((acc, item) => acc + (item.price || 0), 0),
      customer: orderData?.customer || currentUser,
      shippingAddress: orderData?.customer?.address || "",
      paymentMethod: orderData?.paymentMethod || "cash_on_delivery",
      transactionId: orderData?.paymentDetails?.transactionId || null,
      receiptImage: orderData?.paymentDetails?.receiptImage || null,
      notes: orderData?.notes || "",
    };

    const result = await createOrder(orderPayload);

    if (result?.success) {
      setCartItems([]);
      localStorage.removeItem("dealora_market_cart");
      navigate("/home", { state: { orderSuccess: true } });
    } else {
      setCartWarning(result?.message || "فشل إتمام الطلب، حاول مرة أخرى");
      setTimeout(() => setCartWarning(""), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
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
      {!shouldHideHeader && <AdminReplyBanner />}
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
          <Route path="/products" element={<ProductPage query={query} scrollTrigger={scrollTrigger} wishlistItems={wishlistItems} addToWishlist={toggleWishlist} addToCart={addToCart} cartItems={cartItems} lang={lang} />} />
          
          <Route path="/profile" element={<ProfilePage />} />          
          <Route path="/register" element={<RegisterPage lang={lang} />} />
          <Route path="/login" element={<LoginPage lang={lang} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
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