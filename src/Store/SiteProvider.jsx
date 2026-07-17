import { useState, useEffect } from "react";
import { SiteContext } from "./SiteContext";
import { initialAdminData } from "./initialData";

export const SiteProvider = ({ children }) => {
  const [lang, setLang] = useState("ar");
  const [adminData, setAdminData] = useState(() => {
    const savedAdminData = localStorage.getItem("dealora_market_admin_data");
    return savedAdminData ? JSON.parse(savedAdminData) : initialAdminData;
  });
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem("dealora_market_orders");
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [supportTickets, setSupportTickets] = useState(() => {
    const savedTickets = localStorage.getItem("dealora_market_tickets");
    return savedTickets ? JSON.parse(savedTickets) : [];
  });

  // 🔔 1. حالة الإعلان النشط (مع الإعلان الافتراضي بالألوان والأبعاد الجديدة)
  const [announcement, setAnnouncement] = useState(() => {
    const savedAnn = localStorage.getItem("dealora_market_announcement");
    if (savedAnn) {
      try {
        const parsed = JSON.parse(savedAnn);
        const isExpiredGlobally =
          Date.now() - parsed.createdAt >= parsed.totalDurationMs;
        if (!isExpiredGlobally) return parsed;
        localStorage.removeItem("dealora_market_announcement");
      } catch (err) {
        console.error("Error parsing announcement:", err);
      }
    }

    // الإعلان الافتراضي المنسق تلقائيًا (أخضر ديلورا)
    return {
      id: "ANN-AUTO-TEST",
      text: "مساء الخير عملائنا الكرام الهايبر مغلق اليوم",
      titleAr: "تنويه هام للغاية",
      titleEn: "IMPORTANT NOTICE",
      createdAt: Date.now(),
      totalDurationMs: 60 * 60 * 1000, // ساعة
      viewDurationMs: 5 * 60 * 1000, // 5 دقائق
      bgColor: "#00a650", // لون اليافطة والحبل تلقائيًا
      textColor: "#f0fdf4", // لون نص الإعلان
      titleColor: "#000000", // لون العنوان
    };
  });

  // 🔔 2. فحص دوري تلقائي لانتهاء صلاحية الإعلان الإجمالية
  useEffect(() => {
    if (!announcement) return;

    const interval = setInterval(() => {
      const isExpiredGlobally =
        Date.now() - announcement.createdAt >= announcement.totalDurationMs;
      if (isExpiredGlobally) {
        setAnnouncement(null);
        localStorage.removeItem("dealora_market_announcement");
      }
    }, 10000); // يفحص كل 10 ثوانٍ

    return () => clearInterval(interval);
  }, [announcement]);

  // 🔔 دالة النشر: تدعم تحديد مدة (ساعات/دقائق) أو تشغيل مستمر بدون وقت انتهاء
  const publishAnnouncement = async (
    text,
    titleAr = "تنويه هام",
    titleEn = "IMPORTANT NOTICE",
    totalVal = null, // لو الأدمن مسابهاش فاضية، الإعلان شغال علطول
    totalUnit = "h",
    colors = {},
  ) => {
    try {
      const toMs = (val, unit) => {
        if (!val) return 100 * 365 * 24 * 60 * 60 * 1000; // 100 سنة (يعني شغال علطول لحد ما يتلغي يدوي)
        const num = Number(val);
        if (unit === "h") return num * 60 * 60 * 1000;
        if (unit === "s") return num * 1000;
        return num * 60 * 1000;
      };

      const newAnn = {
        id: `ANN-${Date.now()}`,
        text,
        titleAr,
        titleEn,
        createdAt: Date.now(),
        // لو الأدمن حدد وقت هيتحسب، لو محددش (null) هيبقى إعلان مستمر
        totalDurationMs: toMs(totalVal, totalUnit),
        bgColor: colors.bgColor || "#064e3b",
        textColor: colors.textColor || "#f0fdf4",
        titleColor: colors.titleColor || "#34d399",
      };

      setAnnouncement(newAnn);
      localStorage.setItem(
        "dealora_market_announcement",
        JSON.stringify(newAnn),
      );
    } catch (err) {
      console.error("Failed to publish announcement:", err);
    }
  };

  // 🔔 دالة الحذف الفوري: الأدمن بيشيل بيها اليافطة في ثانية
  const clearAnnouncement = async () => {
    try {
      setAnnouncement(null);
      localStorage.removeItem("dealora_market_announcement");
    } catch (err) {
      console.error("Failed to clear announcement:", err);
    }
  };

  // حفظ الأوردرات في الـ LocalStorage تلقائياً عند تحديثها
  useEffect(() => {
    localStorage.setItem("dealora_market_orders", JSON.stringify(orders));
  }, [orders]);

  // حفظ بيانات المتجر والمنتجات في الـ LocalStorage
  useEffect(() => {
    localStorage.setItem(
      "dealora_market_admin_data",
      JSON.stringify(adminData),
    );
  }, [adminData]);

  // مزامنة التذاكر
  useEffect(() => {
    localStorage.setItem(
      "dealora_market_tickets",
      JSON.stringify(supportTickets),
    );
  }, [supportTickets]);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("dealora_market_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const loginUser = (user, token = "user-mock-token") => {
    setCurrentUser(user);
    localStorage.setItem("dealora_market_current_user", JSON.stringify(user));
    localStorage.setItem("dealora_market_token", token);

    const savedUsers = localStorage.getItem("dealora_market_users");
    const usersList = savedUsers ? JSON.parse(savedUsers) : [];
    const userExists = usersList.find((u) => u.email === user.email);
    if (!userExists) {
      usersList.push(user);
      localStorage.setItem("dealora_market_users", JSON.stringify(usersList));
    }
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
        const savedAdminData = localStorage.getItem(
          "dealora_market_admin_data",
        );
        if (savedAdminData) {
          setAdminData(JSON.parse(savedAdminData));
        } else {
          setAdminData(initialAdminData);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load store configurations.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDynamicData();
  }, []);

  const updateProfileImage = async (base64Image) => {
    try {
      const updatedUser = { ...currentUser, image: base64Image };
      setCurrentUser(updatedUser);
      localStorage.setItem(
        "dealora_market_current_user",
        JSON.stringify(updatedUser),
      );

      const savedUsers = localStorage.getItem("dealora_market_users");
      if (savedUsers) {
        const usersList = JSON.parse(savedUsers);
        const updatedUsersList = usersList.map((u) =>
          u.email === currentUser.email ? { ...u, image: base64Image } : u,
        );
        localStorage.setItem(
          "dealora_market_users",
          JSON.stringify(updatedUsersList),
        );
      }
      return { success: true, message: "تم تحديث الصورة الشخصية بنجاح" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "فشل تحديث الصورة" };
    }
  };

  const updateProfileData = async (formData) => {
    try {
      const updatedUser = { ...currentUser, ...formData };
      setCurrentUser(updatedUser);
      localStorage.setItem(
        "dealora_market_current_user",
        JSON.stringify(updatedUser),
      );

      const savedUsers = localStorage.getItem("dealora_market_users");
      const usersList = savedUsers ? JSON.parse(savedUsers) : [];
      const updatedUsersList = usersList.map((u) =>
        u.email === currentUser.email ? { ...u, ...formData } : u,
      );
      localStorage.setItem(
        "dealora_market_users",
        JSON.stringify(updatedUsersList),
      );
      return { success: true, message: "تم حفظ بيانات الحساب بنجاح" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "فشل حفظ التعديلات" };
    }
  };

  const updateUserPassword = async (oldPassword, newPassword) => {
    try {
      const updatedUser = { ...currentUser, password: newPassword };
      setCurrentUser(updatedUser);
      localStorage.setItem(
        "dealora_market_current_user",
        JSON.stringify(updatedUser),
      );

      const savedUsers = localStorage.getItem("dealora_market_users");
      if (savedUsers) {
        const usersList = JSON.parse(savedUsers);
        const updatedUsersList = usersList.map((u) =>
          u.email === currentUser.email ? { ...u, password: newPassword } : u,
        );
        localStorage.setItem(
          "dealora_market_users",
          JSON.stringify(updatedUsersList),
        );
      }
      return { success: true, message: "تم تغيير كلمة المرور بنجاح" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "حدث خطأ أثناء تحديث كلمة المرور" };
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

  const createOrder = (orderPayload) => {
    const newOrder = {
      id: `ORDER-${Date.now()}`,
      items: orderPayload.items,
      totalPrice: orderPayload.totalPrice,
      customerDetails: orderPayload.customer,
      paymentMethod: "paymob", // مثبتة دائماً كـ paymob بناء على التحديث الجديد
      paymentDetails: null, // سيتم تحديثه برابط وبينات الدفع عند إتمام الربط مع الـ API
      paymentUrl: orderPayload.paymentUrl || null,
      status: "pending",
      createdAt: orderPayload.createdAt || new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    setAdminData((prev) => {
      const updatedProducts = prev.products.map((product) => {
        const purchasedItem = orderPayload.items.find(
          (item) => String(item.id) === String(product.id),
        );

        if (purchasedItem) {
          const purchaseQty = purchasedItem.quantity || 1;
          const currentStock = Number(product.stock || product.quantity || 0);
          const newStock = Math.max(0, currentStock - purchaseQty);

          return {
            ...product,
            stock: newStock,
            quantity: newStock,
          };
        }
        return product;
      });

      return {
        ...prev,
        products: updatedProducts,
      };
    });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
  };

  // 🔔 دالة إرسال طلب تعديل الأوردر (تم التأكد من ربطها وتحديث الـ LocalStorage فوراً)
  const sendOrderChangeRequest = async (orderId, messageText) => {
    try {
      const ticketSubject = `تعديل طلب رقم #${orderId}`;

      const existingTicketIndex = supportTickets.findIndex(
        (t) => t.subject === ticketSubject && t.userId === currentUser?.id,
      );

      let updatedTickets = [...supportTickets];

      if (existingTicketIndex > -1) {
        const targetTicket = updatedTickets[existingTicketIndex];
        const updatedMessages = [
          ...targetTicket.messages,
          {
            sender: "user",
            text: messageText,
            createdAt: new Date().toISOString(),
            time: new Date().toLocaleTimeString(),
          },
        ];

        updatedTickets[existingTicketIndex] = {
          ...targetTicket,
          status: "NEW",
          messages: updatedMessages,
        };
      } else {
        const newTicket = {
          id: `TICKET-${Date.now()}`,
          userId: currentUser?.id || "guest",
          customerName: currentUser?.fullName || "عميل ديلورا",
          email: currentUser?.email || "",
          phone: currentUser?.phone || "",
          subject: ticketSubject, // سيظهر العنوان بوضوح: "تعديل طلب رقم #ORDER-XXXX"
          orderId: orderId,
          status: "NEW",
          date: new Date().toLocaleDateString(
            lang === "ar" ? "ar-EG" : "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            },
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
        updatedTickets = [newTicket, ...updatedTickets];
      }

      setSupportTickets(updatedTickets);
      localStorage.setItem(
        "dealora_market_tickets",
        JSON.stringify(updatedTickets),
      );

      return {
        success: true,
        message: "تم إرسال طلب التعديل للدعم الفني بنجاح!",
      };
    } catch (err) {
      console.error("Error sending order change request:", err);
      return { success: false, message: "فشل إرسال طلب التعديل." };
    }
  };

  // 💬 دالة إنشاء التذكرة العامة المحدثة لتتوافق تماماً مع بنية تذاكر الأوردرات وتظهر فوراً
  const createTicket = async (ticketText, fileBase64 = null) => {
    try {
      const ticketSubject =
        ticketText.length > 30
          ? ticketText.substring(0, 30) + "..."
          : ticketText;

      const newTicket = {
        id: `TCK-${Date.now()}`,
        userId: currentUser?.id || "guest",
        customerName: currentUser?.fullName || "عميل ديلورا",
        email: currentUser?.email || "",
        phone: currentUser?.phone || "",
        subject: ticketSubject,
        status: "PENDING",
        date: new Date().toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
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

      setSupportTickets((prev) => [newTicket, ...prev]);
      return { success: true, message: "تم إرسال تذكرتك بنجاح" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "حدث خطأ أثناء إرسال التذكرة" };
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
      setSupportTickets((prev) =>
        prev.map((ticket) => {
          if (ticket.id === ticketId) {
            const updatedMessages = ticket.messages.map((msg) =>
              msg.sender === "user" ? { ...msg, text: updatedText } : msg,
            );
            return {
              ...ticket,
              subject: updatedText.substring(0, 30) + "...",
              messages: updatedMessages,
            };
          }
          return ticket;
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
      setSupportTickets((prev) =>
        prev.filter((ticket) => ticket.id !== ticketId),
      );
      return { success: true, message: "تم حذف الرسالة بنجاح" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "فشل حذف الرسالة" };
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
                  file: fileBase64,
                  time: new Date().toLocaleTimeString(),
                  createdAt: new Date().toISOString()
                }
              ],
            }
          : t,
      ),
    );
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
        editTicket,
        deleteTicket,
        announcement,
        publishAnnouncement,
        clearAnnouncement,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};