import { useState, useEffect } from "react";
import { SiteContext } from "./SiteContext";
import { initialAdminData } from "./initialData";
import { apiClient } from "../Services/apiClient";

const playSuccessSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); 
  audio.volume = 0.5; 
  audio.play().catch(error => {
    console.log("Audio play blocked by browser setup:", error);
  });
};

export const SiteProvider = ({ children }) => {
  const [lang, setLang] = useState("ar");
  const [adminData, setAdminData] = useState(() => initialAdminData);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supportTickets, setSupportTickets] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // 💖 حالة المفضلة
  const [wishlistItems, setWishlistItems] = useState([]);

  // 🔔 1. حالة الإعلان النشط
  const [announcement, setAnnouncement] = useState(null);

  // 🔔 حالة ردود الدعم غير المقروءة
  const [unreadReplyCount, setUnreadReplyCount] = useState(0);

  // 🔔 2. فحص دوري تلقائي لانتهاء صلاحية الإعلان
  useEffect(() => {
    if (!announcement) return;
    const interval = setInterval(() => {
      const isExpired = Date.now() >= announcement.expiresAt;
      if (isExpired) setAnnouncement(null);
    }, 10000);
    return () => clearInterval(interval);
  }, [announcement]);

  // 🔔 دالة النشر (من الأدمن فقط عبر Dashboard)
  const publishAnnouncement = async () => {};

  // 🔔 دالة الحذف
  const clearAnnouncement = async () => {
    setAnnouncement(null);
  };

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("dealora_market_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const loginUser = (user, token = "user-mock-token") => {
    setCurrentUser(user);
    localStorage.setItem("dealora_market_current_user", JSON.stringify(user));
    localStorage.setItem("dealora_market_token", token);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem("dealora_market_current_user");
    localStorage.removeItem("dealora_market_token");
  };

  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        setIsLoading(true);

        // محاولة جلب البيانات من الباك إند
        try {
          const [categoriesRes, productsRes, bannersRes, settingsRes, footerRes, paymentsRes] = await Promise.allSettled([
            apiClient.get("/categories"),
            apiClient.get("/products"),
            apiClient.get("/banners/active"),
            apiClient.get("/settings"),
            apiClient.get("/footer-settings"),
            apiClient.get("/payment-methods/active"),
          ]);

          const fetchedCategories = categoriesRes.status === "fulfilled" ? categoriesRes.value : [];
          const fetchedProducts = productsRes.status === "fulfilled" ? productsRes.value : [];
          const fetchedBanners = bannersRes.status === "fulfilled" ? bannersRes.value : [];
          const fetchedSettings = settingsRes.status === "fulfilled" ? settingsRes.value : {};
          const fetchedFooter = footerRes.status === "fulfilled" ? footerRes.value : null;
          const fetchedPayments = paymentsRes.status === "fulfilled" ? paymentsRes.value : [];

          // بناء بيانات المنتجات بالشكل المتوقع من الـ Frontend
          const normalizedProducts = fetchedProducts.map((p) => ({
            id: p.id,
            categoryId: p.category_id,
            name: { ar: p.name_ar || p.name, en: p.name_en || p.name_ar || p.name },
            brand: { ar: p.brand_ar || p.brand, en: p.brand_en || p.brand_ar || p.brand },
            description: { ar: p.description_ar || p.description, en: p.description_en || p.description_ar || p.description },
            price: Number(p.current_price || p.price),
            oldPrice: p.comparison_price ? Number(p.comparison_price) : null,
            offerPrice: p.offerPrice ? Number(p.offerPrice) : null,
            isOnOffer: !!p.is_on_offer,
            stock: p.available_quantity || p.stock || 0,
            image: p.product_image || p.image,
            slug: p.slug,
            sku: p.sku,
            unit: p.unit || "قطعة",
            unitType: p.unitType || p.unit_type || "quantity",
            avgRating: p.avg_rating || 0,
            offerStock: p.offer_max_quantity || null,
            offerExpiresAt: p.offer_end_at || null,
          }));

          // بناء بيانات الأقسام بالشكل المتوقع
          const normalizedCategories = fetchedCategories.map((c) => ({
            id: c.id,
            name: { ar: c.name_ar || c.name, en: c.name_en || c.name_ar || c.name },
            slug: c.slug,
            image: c.image_url || c.image,
            type: c.unitType || c.unit_type || "quantity",
            products: normalizedProducts.filter((p) => p.categoryId === c.id),
          }));

          // بناء بيانات البانرات بالشكل المتوقع (HeroSlider يتوقع objects {ar, en})
          const normalizedBanners = fetchedBanners.map((b) => ({
            id: b.id,
            title: { ar: b.title_ar || b.title, en: b.title_en || b.title },
            subtitle: { ar: b.subtitle_ar || b.subtitle, en: b.subtitle_en || b.subtitle },
            image: b.image_url,
            buttonText: { ar: b.button_text_ar || b.button_text, en: b.button_text_en || b.button_text },
            category: b.category_id,
            productId: b.product_id,
            categoryId: b.category_id,
          }));

          // Build footer data from dedicated footer-settings endpoint
          const footerFromBackend = {};
          try {
            if (fetchedFooter) {
              if (fetchedFooter.logo2) footerFromBackend.logo2 = fetchedFooter.logo2;
              if (fetchedFooter.aboutAr) footerFromBackend.about = fetchedFooter.aboutAr;
              if (fetchedFooter.aboutEn) footerFromBackend.aboutEn = fetchedFooter.aboutEn;
              if (fetchedFooter.workingHoursAr) footerFromBackend.workingHours = fetchedFooter.workingHoursAr;
              if (fetchedFooter.workingHoursEn) footerFromBackend.workingHoursEn = fetchedFooter.workingHoursEn;
              if (Array.isArray(fetchedFooter.phones)) footerFromBackend.phones = fetchedFooter.phones;
              if (Array.isArray(fetchedFooter.locations)) {
                footerFromBackend.locations = fetchedFooter.locations.map(loc => ({
                  name: loc.nameAr || loc.name || "",
                  nameEn: loc.nameEn || "",
                  url: loc.url || "",
                }));
              }
              if (Array.isArray(fetchedFooter.socialLinks)) footerFromBackend.socialLinks = fetchedFooter.socialLinks;
            }
          } catch {}

          setAdminData({
            ...initialAdminData,
            ...footerFromBackend,
            categories: normalizedCategories,
            products: normalizedProducts,
            HeroSliderData: normalizedBanners.length > 0 ? normalizedBanners : initialAdminData.HeroSliderData,
            settings: fetchedSettings,
            paymentMethods: Array.isArray(fetchedPayments) ? fetchedPayments : initialAdminData.paymentMethods,
          });
          setPaymentMethods(Array.isArray(fetchedPayments) ? fetchedPayments : []);
          setError(null);
        } catch {
          setAdminData(initialAdminData);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load store configurations.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDynamicData();

    const refreshInterval = setInterval(() => {
      fetchDynamicData();
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Fetch announcements from backend with polling
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await apiClient.get("/announcements/current");
        if (res && res.id) {
          const expiresAt = new Date(res.expires_at).getTime();
          const isExpired = Date.now() >= expiresAt;
          if (!isExpired) {
            const announcementText = lang === "en"
              ? (res.message_en || res.message_ar || res.message || "")
              : (res.message_ar || res.message_en || res.message || "");
            setAnnouncement({
              id: `ANN-BACKEND-${res.id}`,
              text: announcementText,
              textAr: res.message_ar || "",
              textEn: res.message_en || res.message_ar || "",
              titleAr: res.title_ar || "تنويه هام",
              titleEn: res.title_en || "IMPORTANT NOTICE",
              createdAt: new Date(res.start_at).getTime(),
              expiresAt: expiresAt,
              totalDurationMs: expiresAt - new Date(res.start_at).getTime(),
              bgColor: res.bg_color || "#064e3b",
              textColor: res.text_color || "#f0fdf4",
              titleColor: res.title_color || "#34d399",
            });
          } else {
            setAnnouncement(null);
          }
          return;
        }
        setAnnouncement(null);
      } catch (err) {
        console.warn("Announcement fetch failed:", err?.message || err);
      }
    };
    fetchAnnouncement();
    const pollInterval = setInterval(fetchAnnouncement, 30000);
    return () => clearInterval(pollInterval);
  }, [lang]);

  // Fetch profile from backend on mount if token exists
  useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem("dealora_market_token");
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const profile = await apiClient.get("/auth/profile");
        if (profile) {
          const mappedUser = {
            ...currentUser,
            fullName: profile.name || currentUser.fullName,
            displayName: profile.name?.split(" ")[0] || currentUser.displayName,
            email: profile.email || currentUser.email,
            phone: profile.phone || currentUser.phone,
            image: profile.photo_url || currentUser.image,
            photo_url: profile.photo_url || currentUser.photo_url,
          };
          setCurrentUser(mappedUser);
          localStorage.setItem("dealora_market_current_user", JSON.stringify(mappedUser));
        }
      } catch {}
    };
    fetchProfile();
  }, []);

  // Fetch orders from backend when user is logged in
  useEffect(() => {
    if (!currentUser) return;
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get("/orders/my-orders");
        if (Array.isArray(res) && res.length > 0) {
          const normalizedOrders = res.map((o) => ({
            id: `ORDER-${o.id}`,
            items: (o.items || []).map(item => ({
              ...item,
              title: item.nameAr || item.nameEn || "",
              name: { ar: item.nameAr || "", en: item.nameEn || "" },
              image: item.image || "",
              price: item.totalPrice || 0,
              currentPrice: item.pricePerUnit || 0,
              quantity: item.quantity || 0,
            })),
            totalPrice: Number(o.totalPrice) || 0,
            customerDetails: {
              name: o.customerPhone || "",
              phone: o.customerPhone || "",
              address: o.shippingAddress || "",
            },
            paymentMethod: o.paymentMethod || "cash_on_delivery",
            paymentDetails: o.paymentDetails || {
              transactionId: null,
              receiptImage: null,
            },
            status: String(o.status || "pending").toUpperCase(),
            createdAt: o.createdAt,
            shippingAddress: o.shippingAddress || "",
            customerPhone: o.customerPhone || "",
            customerNotes: o.customerNotes || "",
          }));
          setOrders(normalizedOrders);
        }
      } catch {
        // Backend not available, keep localStorage
      }
    };
    fetchOrders();
    const orderInterval = setInterval(fetchOrders, 30000);
    return () => clearInterval(orderInterval);
  }, [currentUser]);

  // Fetch favorites from backend when user is logged in
  useEffect(() => {
    if (!currentUser) return;
    const fetchFavorites = async () => {
      try {
        const res = await apiClient.get("/favorites");
        if (Array.isArray(res) && res.length > 0) {
          const normalizedFavs = res.map((f) => ({
            id: f.product_id,
            categoryId: f.category_id,
            name: { ar: f.name_ar || f.name, en: f.name_en || f.name_ar || f.name },
            price: Number(f.price),
            offerPrice: f.discount_price ? Number(f.discount_price) : null,
            image: f.product_image || f.image,
            unit: f.unit || "قطعة",
          }));
          setWishlistItems(normalizedFavs);
        }
      } catch {
        // Backend not available, keep localStorage
      }
    };
    fetchFavorites();
  }, [currentUser]);

  const updateProfileImage = async (base64Image) => {
    try {
      try {
        await apiClient.put("/auth/profile", { photo_url: base64Image });
      } catch {}
      const updatedUser = { ...currentUser, image: base64Image, photo_url: base64Image };
      setCurrentUser(updatedUser);
      localStorage.setItem("dealora_market_current_user", JSON.stringify(updatedUser));
      return { success: true, message: "تم تحديث الصورة الشخصية بنجاح" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "فشل تحديث الصورة" };
    }
  };

  const updateProfileData = async (formData) => {
    try {
      try {
        await apiClient.put("/auth/profile", {
          name: formData.fullName,
          phone: formData.phone,
          photo_url: formData.image || null,
        });
      } catch {}
      const updatedUser = { ...currentUser, ...formData };
      setCurrentUser(updatedUser);
      localStorage.setItem("dealora_market_current_user", JSON.stringify(updatedUser));
      return { success: true, message: "تم حفظ بيانات الحساب بنجاح" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "فشل حفظ التعديلات" };
    }
  };

  const updateUserPassword = async (oldPassword, newPassword) => {
    try {
      try {
        const res = await apiClient.put("/auth/change-password", { currentPassword: oldPassword, newPassword });
        return { success: true, message: res?.message || "تم تغيير كلمة المرور بنجاح" };
      } catch (backendErr) {
        const msg = backendErr?.message || backendErr?.response?.data?.message;
        return { success: false, message: msg || "كلمة المرور الحالية غير صحيحة" };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: "فشل تغيير كلمة المرور" };
    }
  };

  const updateGeneralSettings = (updatedFields) => {
    setAdminData((prev) => ({ ...prev, ...updatedFields }));
  };

  const addProduct = (newProduct) => {
    const productWithId = { ...newProduct, id: Date.now() };
    setAdminData((prev) => ({
      ...prev,
      products: [productWithId, ...prev.products],
    }));
  };

  const updateProduct = (id, updatedProduct) => {
    setAdminData((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === id ? { ...p, ...updatedProduct } : p,
      ),
    }));
  };

  const deleteProduct = (id) => {
    setAdminData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  };

  const addCategory = (newCategory) => {
    const catWithId = { ...newCategory, id: Date.now() };
    setAdminData((prev) => ({
      ...prev,
      categories: [...prev.categories, catWithId],
    }));
  };

  const deleteCategory = (id) => {
    setAdminData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }));
  };

  const updateHeroSliders = (newSliders) => {
    setAdminData((prev) => ({ ...prev, HeroSliderData: newSliders }));
  };

  const createOrder = async (orderPayload) => {
    try {
      // First, sync the frontend cart items to the backend cart_items table
      if (orderPayload.items && Array.isArray(orderPayload.items) && orderPayload.items.length > 0) {
        // Clear existing backend cart first
        try {
          await apiClient.delete("/cart/clear");
        } catch {}
        
        // Add each frontend cart item to the backend
        for (const item of orderPayload.items) {
          try {
            const productId = item.id || item.productId;
            const quantity = item.isWeightType ? (item.weightGrams || 1000) : (item.quantity || 1);
            await apiClient.post("/cart/add", { product_id: productId, quantity });
          } catch (addErr) {
            console.warn("Failed to sync cart item to backend:", addErr.message);
          }
        }
      }

      const res = await apiClient.post("/orders/checkout", {
        address_id: orderPayload.address_id || null,
        manual_address: orderPayload.shippingAddress || orderPayload.customer?.address || "",
        phone_number: orderPayload.customer?.phone || "",
        notes: orderPayload.notes || "",
        payment_method: orderPayload.paymentMethod || "cash_on_delivery",
        payment_transaction_id: orderPayload.transactionId || null,
        payment_receipt_url: orderPayload.receiptImage || null,
      });
      if (res && res.orderId) {
        try {
          const ordersRes = await apiClient.get("/orders/my-orders");
          if (Array.isArray(ordersRes)) {
            const normalizedOrders = ordersRes.map((o) => ({
              id: `ORDER-${o.id}`,
              items: o.items || [],
              totalPrice: o.totalPrice || Number(o.total_amount),
              customerDetails: {},
              paymentMethod: o.paymentMethod || o.payment_method,
              status: o.status || o.order_status,
              createdAt: o.createdAt || o.order_date,
              shippingAddress: o.shippingAddress || o.shipping_address,
            }));
            setOrders(normalizedOrders);
          }
        } catch {}
        return { success: true, orderId: res.orderId };
      }
    } catch (err) {
      console.error("Order checkout failed:", err);
      return { success: false, message: err?.message || "فشل إتمام الطلب" };
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
  };

  // 🔔 دالة إرسال طلب تعديل الأوردر - مع ربط الباك إند
  const sendOrderChangeRequest = async (orderId, messageText) => {
    try {
      const ticketSubject = `تعديل طلب رقم #${orderId}`;

      const res = await apiClient.post("/complaints", {
        name: currentUser?.fullName || currentUser?.name || "عميل ديلورا",
        email: currentUser?.email || "",
        phone: currentUser?.phone || "",
        subject: ticketSubject,
        message: messageText,
        type: "support",
      });

      const newTicket = {
        id: res.ticket_id || `TICKET-${Date.now()}`,
        userId: currentUser?.id || "guest",
        customerName: currentUser?.fullName || "عميل ديلورا",
        email: currentUser?.email || "",
        phone: currentUser?.phone || "",
        subject: ticketSubject,
        orderId: orderId,
        status: "OPEN",
        date: new Date().toLocaleDateString(
          lang === "ar" ? "ar-EG" : "en-US",
          { year: "numeric", month: "short", day: "numeric" }
        ),
        createdAt: new Date().toISOString(),
        messages: [
          {
            sender: "user",
            text: messageText,
            createdAt: new Date().toISOString(),
            time: new Date().toLocaleTimeString(),
          },
        ],
      };

      setSupportTickets((prev) => [newTicket, ...prev]);
      return { success: true, message: "تم إرسال طلب التعديل للدعم الفني بنجاح!" };
    } catch (err) {
      console.error("Error sending order change request:", err);
      return { success: false, message: "فشل إرسال طلب التعديل." };
    }
  };

  // 💬 دالة جلب التذاكر الحالية من الباك إند
  const fetchSupportTickets = async () => {
    if (!currentUser) return;
    try {
      const email = currentUser.email || "";
      if (!email) return;
      const res = await apiClient.get(`/complaints/my-tickets?email=${encodeURIComponent(email)}`);
      if (Array.isArray(res)) {
        const tickets = res.map((t) => ({
          id: t.id,
          ticketId: t.ticketId,
          customerName: t.customerName || currentUser.fullName || "عميل ديلورا",
          email: t.email || currentUser.email || "",
          phone: t.phone || currentUser.phone || "",
          subject: t.subject || "",
          orderId: t.orderId || null,
          status: t.status || "OPEN",
          date: t.date || new Date().toLocaleDateString(),
          createdAt: t.createdAt || new Date().toISOString(),
          messages: Array.isArray(t.messages) ? t.messages : [],
        }));
        setSupportTickets(tickets);
      }
    } catch (err) {
      console.error("Failed to fetch support tickets:", err);
    }
  };

  // حساب الردود غير المقروءة من الأدمن
  const computeUnreadReplies = (tickets) => {
    const seen = JSON.parse(localStorage.getItem("dealora_seen_replies") || "{}");
    let count = 0;
    tickets.forEach((ticket) => {
      const adminMsgs = (ticket.messages || []).filter((m) => m.sender === "admin");
      if (adminMsgs.length === 0) return;
      const lastAdminMsg = adminMsgs[adminMsgs.length - 1];
      const lastSeenAt = seen[ticket.ticketId];
      if (!lastSeenAt || new Date(lastAdminMsg.createdAt).getTime() > new Date(lastSeenAt).getTime()) {
        count++;
      }
    });
    return count;
  };

  const markTicketRepliesSeen = (ticketId) => {
    const seen = JSON.parse(localStorage.getItem("dealora_seen_replies") || "{}");
    seen[ticketId] = new Date().toISOString();
    localStorage.setItem("dealora_seen_replies", JSON.stringify(seen));
    setUnreadReplyCount((prev) => Math.max(0, prev - 1));
  };

  useEffect(() => {
    if (currentUser) fetchSupportTickets();
  }, [currentUser]);

  // تحديث عدد الردود غير المقروءة عند تحديث التذاكر
  useEffect(() => {
    if (supportTickets.length > 0) {
      setUnreadReplyCount(computeUnreadReplies(supportTickets));
    }
  }, [supportTickets]);

  // تحديث دوري كل 15 ثانية للردود الجديدة
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      fetchSupportTickets();
    }, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // 💬 دالة إنشاء تذكرة جديدة
  const createTicket = async (ticketText, fileBase64 = null) => {
    try {
      const ticketSubject =
        ticketText.length > 30
          ? ticketText.substring(0, 30) + "..."
          : ticketText;

      const res = await apiClient.post("/complaints", {
        name: currentUser?.fullName || currentUser?.name || "عميل ديلورا",
        email: currentUser?.email || "",
        phone: currentUser?.phone || "",
        subject: ticketSubject,
        message: ticketText,
        type: "support",
      });

      const backendTicket = {
        id: res.ticket_id ? Date.now() : `TCK-${Date.now()}`,
        ticketId: res.ticket_id,
        userId: currentUser?.id || "guest",
        customerName: currentUser?.fullName || "عميل ديلورا",
        email: currentUser?.email || "",
        phone: currentUser?.phone || "",
        subject: ticketSubject,
        status: "OPEN",
        date: new Date().toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
          year: "numeric", month: "short", day: "numeric",
        }),
        createdAt: new Date().toISOString(),
        messages: [
          {
            sender: "user",
            text: ticketText,
            file: fileBase64,
            time: new Date().toLocaleTimeString(),
            createdAt: new Date().toISOString(),
          },
        ],
      };
      setSupportTickets((prev) => [backendTicket, ...prev]);
      return { success: true, message: "تم إرسال تذكرتك بنجاح" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "حدث خطأ أثناء إرسال التذكرة" };
    }
  };

  // 💬 دالة إرسال رسالة متابعة لتذكرة موجودة (WhatsApp-style)
  const sendTicketMessage = async (ticketId, text, fileUrl = null) => {
    try {
      await apiClient.post(`/complaints/${ticketId}/messages`, {
        name: currentUser?.fullName || currentUser?.name || "عميل ديلورا",
        text: text,
        fileUrl: fileUrl,
      });

      const newMsg = {
        id: `CHAT-${Date.now()}`,
        sender: "user",
        text: text,
        file: fileUrl,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        createdAt: new Date().toISOString(),
      };

      setSupportTickets((prev) =>
        prev.map((ticket) => {
          if (ticket.ticketId === ticketId) {
            return { ...ticket, messages: [...ticket.messages, newMsg], status: "OPEN" };
          }
          return ticket;
        })
      );

      return { success: true };
    } catch (err) {
      console.error("Failed to send ticket message:", err);
      return { success: false, message: "فشل إرسال الرسالة" };
    }
  };

  // 💬 دالة تحديث رسائل التذكرة من الباك إند ( للتحديث الدوري)
  const refreshTicketMessages = async (ticketId) => {
    try {
      const res = await apiClient.get(`/complaints/${ticketId}/messages`);
      if (res && Array.isArray(res.messages)) {
        setSupportTickets((prev) =>
          prev.map((ticket) => {
            if (ticket.ticketId === ticketId) {
              return { ...ticket, messages: res.messages, status: res.status || ticket.status };
            }
            return ticket;
          })
        );
      }
    } catch (err) {
      console.error("Failed to refresh ticket messages:", err);
    }
  };

  // 💬 دالة تعديل رسالة محددة
  const editChatMessage = async (messageId, newText) => {
    try {
      await apiClient.put(`/complaints/messages/${messageId}`, { text: newText, senderType: 'user' });
      return { success: true };
    } catch (err) {
      console.error("Failed to edit message:", err);
      return { success: false, message: "Failed to edit message" };
    }
  };

  // 💬 دالة حذف رسالة محددة
  const deleteChatMessage = async (messageId) => {
    try {
      await apiClient.delete(`/complaints/messages/${messageId}`);
      return { success: true };
    } catch (err) {
      console.error("Failed to delete message:", err);
      return { success: false, message: "فشل حذف الرسالة" };
    }
  };

  const clientSendMessage = (msgData) => {
    const newMsg = {
      id: Date.now(),
      clientName: msgData.name,
      clientEmail: msgData.email,
      messageText: msgData.text,
      replyText: null,
      isReplied: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [newMsg, ...prev]);
  };

  const editTicket = async (ticketId, updatedText) => {
    try {
      const ticket = supportTickets.find(
        (t) => t.id === ticketId || String(t.id) === String(ticketId)
      );
      if (!ticket) return { success: false, message: "التذكرة غير موجودة" };

      const firstUserMsg = ticket.messages?.find((m) => m.sender === "user");
      if (firstUserMsg?.id) {
        await apiClient.put(`/complaints/messages/${firstUserMsg.id}`, { text: updatedText });
      }

      setSupportTickets((prev) =>
        prev.map((t) => {
          if (t.id === ticketId || String(t.id) === String(ticketId)) {
            const updatedMessages = t.messages.map((msg) =>
              msg.sender === "user" ? { ...msg, text: updatedText } : msg,
            );
            return {
              ...t,
              subject: updatedText.substring(0, 30) + "...",
              messages: updatedMessages,
            };
          }
          return t;
        }),
      );
      return { success: true, message: "تم تعديل الرسالة بنجاح" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "فشل تعديل الرسالة" };
    }
  };

  const deleteTicket = async (ticketId) => {
    try {
      const ticket = supportTickets.find(
        (t) => t.ticketId === ticketId || String(t.id) === String(ticketId)
      );
      const dbId = ticket?.id || ticketId;
      await apiClient.delete(`/complaints/${dbId}`);
      setSupportTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketId === ticketId || String(ticket.id) === String(dbId)
            ? { ...ticket, status: "CLOSED" }
            : ticket
        ),
      );
      return { success: true, message: "Ticket closed successfully" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Failed to close ticket" };
    }
  };

  const adminReplyToMessage = (msgId, replyText, fileBase64 = null) => {
  setMessages((prev) =>
    prev.map((msg) =>
      msg.id === msgId
        ? { ...msg, replyText: replyText, replyFile: fileBase64, isReplied: true }
        : msg,
    ),
  );

  setSupportTickets((prev) =>
    prev.map((t) =>
      t.id === msgId || t.subject === msgId
        ? {
            ...t,
            status: "REPLIED",
            messages: [
              ...t.messages, 
              { 
                sender: "admin", 
                text: replyText, 
                file: fileBase64, // تفعيل إرسال الملف من الأدمن هنا
                time: new Date().toLocaleTimeString(),
                createdAt: new Date().toISOString()
              }
            ],
          }
        : t,
    ),
  );
};
// دالة الإضافة والحذف من المفضلة (Toggle) - مع ربط الباك إند
  const toggleWishlist = async (product) => {
    playSuccessSound();
    // Try backend toggle first
    try {
      const res = await apiClient.post("/favorites/toggle", { product_id: product.id });
      if (res && res.isFavorite !== undefined) {
        if (res.isFavorite) {
          setWishlistItems((prev) => {
            const exists = prev.find((item) => item.id === product.id);
            if (exists) return prev;
            return [...prev, product];
          });
        } else {
          setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
        }
        return;
      }
    } catch {
      // Backend not available, fall through to localStorage
    }
    // Fallback: localStorage only
    setWishlistItems((prev) => {
      const isExist = prev.find((item) => item.id === product.id);
      if (isExist) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };
  return (
    <SiteContext.Provider
      value={{
        adminData,
        setAdminData,
        lang,
        setLang,
        isLoading,
        error,
        currentUser,
        loginUser,
        logoutUser,
        setCurrentUser,
        orders,
        createOrder,
        updateOrderStatus,
        sendOrderChangeRequest,
        messages,
        clientSendMessage,
        adminReplyToMessage,
        updateGeneralSettings,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        deleteCategory,
        updateHeroSliders,
        updateProfileImage,
        updateProfileData,
        updateUserPassword,
        supportTickets,
        setSupportTickets,
        createTicket,
        sendTicketMessage,
        refreshTicketMessages,
        fetchSupportTickets,
        editTicket,
        deleteTicket,
        editChatMessage,
        deleteChatMessage,
        toggleWishlist,
        wishlistItems,
        paymentMethods,
        // 🔔 الدوال والحالات الموحدة والجاهزة للاستدعاء مباشرة
        announcement,
        publishAnnouncement,
        clearAnnouncement,
        unreadReplyCount,
        markTicketRepliesSeen,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
