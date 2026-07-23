import { useState, useContext, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteContext } from "../Store/SiteContext";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Settings,
  MessageSquare,
  LogOut,
  Home,
  User,
  MapPin,
  Clock,
  CheckCircle,
  Trash2,
  Edit2,
  Send,
  Globe,
  X,
  Paperclip,
} from "lucide-react";

const UserProfile = () => {
  const {
    currentUser,
    logoutUser,
    orders = [],
    wishlistItems = [],
    toggleWishlist,
    sendOrderChangeRequest,
    supportTickets = [],
    createTicket,
    sendTicketMessage: sendTicketMessageCtx,
    refreshTicketMessages,
    editTicket,
    editChatMessage,
    setSupportTickets,
    fetchSupportTickets,
    updateProfileData,
    updateUserPassword,
    updateProfileImage,
    markTicketRepliesSeen,
  } = useContext(SiteContext);

  const navigate = useNavigate();

  const [lang, setLang] = useState("en");
  const isAr = lang === "ar";

  const editContainerRef = useRef(null);

  const t = {
    myAccount: isAr ? "حسابي" : "My Account",
    home: isAr ? "الرئيسية" : "Home",
    dashboard: isAr ? "لوحة التحكم" : "Dashboard",
    orders: isAr ? "الطلبات" : "Orders",
    wishlist: isAr ? "المفضلة" : "Wishlist",
    settings: isAr ? "الإعدادات" : "Settings",
    support: isAr ? "الدعم الفني" : "Support",
    logout: isAr ? "تسجيل الخروج" : "Log-out",
    welcome: isAr ? "مرحباً بك،" : "Welcome,",
    subtitle: isAr
      ? "هذه هي لوحة التحكم الخاصة بك. يمكنك متابعة نشاطك من هنا."
      : "This is your dashboard. Check your activity from here.",
    totalOrders: isAr ? "إجمالي الطلبات" : "Total Orders",
    pendingOrders: isAr ? "طلبات قيد الانتظار" : "Pending Orders",
    completedOrders: isAr ? "طلبات مكتملة" : "Completed Orders",
    accountInfo: isAr ? "معلومات الحساب" : "Account Info",
    fullName: isAr ? "الاسم الكامل" : "Full Name",
    displayName: isAr ? "اسم العرض" : "Display Name",
    email: isAr ? "البريد الإلكتروني" : "Email Address",
    phone: isAr ? "رقم الهاتف" : "Phone Number",
    shippingAddress: isAr ? "عنوان الشحن" : "Shipping Address",
    noAddress: isAr
      ? "لم يتم تحديد عنوان شحن بعد."
      : "No shipping address provided yet.",
    recentActivity: isAr ? "أحدث النشاطات" : "Recent Activity",
    noOrders: isAr
      ? "لم تقم بأي طلبات حتى الآن."
      : "You haven't placed any orders yet.",
    orderId: isAr ? "رقم الطلب" : "Order ID",
    status: isAr ? "الحالة" : "Status",
    date: isAr ? "التاريخ" : "Date",
    total: isAr ? "الإجمالي" : "Total",
    actions: isAr ? "إجراءات" : "Actions",
    sendMessage: isAr ? "إرسال رسالة" : "Send Message",
    orderHistory: isAr ? "سجل الطلبات" : "Order History",
    saveChanges: isAr ? "حفظ التغييرات" : "Save Changes",
    security: isAr ? "الأمان وتغيير كلمة المرور" : "Security",
    currentPassword: isAr ? "كلمة المرور الحالية" : "Current Password",
    newPassword: isAr
      ? "كلمة المرور الجديدة (7 أرقام)"
      : "New Password (7 Digits)",
    updatePassword: isAr ? "تحديث كلمة المرور" : "Update Password",
    emptyWishlist: isAr
      ? "قائمة المفضلة فارغة حالياً."
      : "Your wishlist is currently empty.",
    openTicket: isAr ? "تحدث مع الدعم الفني" : "Chat with Support",
    description: isAr ? "اكتب رسالتك هنا..." : "Type your message here...",
    submitTicket: isAr ? "إرسال" : "Send",
    ticketHistory: isAr ? "محادثات الدعم" : "Support Chats",
    noTickets: isAr ? "لا توجد رسائل سابقة." : "No messages found.",
    orderTitle: isAr ? "تفاصيل الطلب #" : "Order #",
    purchasedOn: isAr ? "تاريخ الشراء:" : "Purchased on:",
    payment: isAr ? "طريقة الدفع" : "Payment",
    cashOnDelivery: isAr ? "الدفع عند الاستلام" : "Cash on Delivery",
    productsOrdered: isAr ? "المنتجات المطلوبة" : "Products Ordered",
    qty: isAr ? "الكمية:" : "Qty:",
    close: isAr ? "إغلاق" : "Close",
    modalTitle: isAr
      ? "إرسال رسالة للدعم بخصوص الطلب"
      : "Send Message to Support",
    modalSubtitle: isAr
      ? "اكتب تعديلاتك أو طلبك أدناه وسيتواصل معك موظف خدمة العملاء فوراً لتنفيذه."
      : "Write your request below and our team will get in touch with you.",
    messageLabel: isAr ? "نص الرسالة" : "Your Message",
    placeholderMessage: isAr
      ? "اكتب تفاصيل التعديل أو التعليمات هنا..."
      : "Type your changes or instructions here...",
    cancel: isAr ? "إلغاء" : "Cancel",
    alertMessage: isAr
      ? "برجاء كتابة الرسالة أولاً."
      : "Please enter your message first.",
    successMessage: isAr
      ? "تم إرسال رسالتك بنجاح! سيتواصل معك فريقنا قريباً."
      : "Your message has been sent successfully! Our team will contact you.",
    phoneAlert: isAr
      ? "يجب أن يتكون رقم الهاتف من 11 رقماً ويبدأ بـ 0."
      : "Phone number must be exactly 11 digits and start with 0.",
    passRequired: isAr
      ? "برجاء إدخال كلمة المرور الحالية والجديدة."
      : "Please enter both current and new passwords.",
    passDigitsAlert: isAr
      ? "يجب أن تتكون كلمة المرور الجديدة من 7 أرقام بالضبط."
      : "New password must be exactly 7 digits.",
  };

  const renderText = (textObj) => {
    if (!textObj) return "";
    if (typeof textObj === "string") return textObj;
    if (typeof textObj === "number") return String(textObj);
    if (typeof textObj === "object") {
      if (isAr && textObj.ar) return textObj.ar;
      if (!isAr && textObj.en) return textObj.en;
      if (textObj.en || textObj.ar) return textObj.en || textObj.ar;
      if (textObj.displayName || textObj.fullName || textObj.name) {
        return textObj.displayName || textObj.fullName || textObj.name;
      }
      return "";
    }
    return String(textObj);
  };

  const [userInfo, setUserInfo] = useState(() => ({
    displayName: renderText(
      currentUser?.displayName || currentUser?.fullName?.split(" ")[0],
    ),
    fullName: renderText(currentUser?.fullName),
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: renderText(currentUser?.address),
    oldPassword: "",
    newPassword: "",
  }));

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("dealora_profile_active_tab") || "dashboard";
  });
  const [infoMessage, setInfoMessage] = useState({ text: "", isError: false });
  const [imgError, setImgError] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [orderMessageText, setOrderMessageText] = useState("");
  const [orderToContact, setOrderToContact] = useState(null);

  const [editingTicketId, setEditingTicketId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingMsgText, setEditingMsgText] = useState("");

  const userPhotoSrc = currentUser?.image || currentUser?.photo_url || null;

  // حفظ التابة الحالية في الـ LocalStorage علشان تفتكرها بعد الريفرش
  useEffect(() => {
    localStorage.setItem("dealora_profile_active_tab", activeTab);
  }, [activeTab]);
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        editingTicketId &&
        editContainerRef.current &&
        !editContainerRef.current.contains(event.target)
      ) {
        setEditingTicketId(null);
        setEditingText("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingTicketId]);

  const [newTicketText, setNewTicketText] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const chatFileInputRef = useRef(null);

  const realOrders = currentUser?.orders || orders;
  const totalOrdersCount = realOrders.length;
  const pendingOrdersCount = realOrders.filter(
    (o) => String(o.status).toUpperCase() === "PENDING",
  ).length;
  const completedOrdersCount = realOrders.filter((o) =>
    ["COMPLETED", "DELIVERED"].includes(String(o.status).toUpperCase()),
  ).length;

  const handleProfileImageUpdate = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setImgError(false);
        if (updateProfileImage) {
          const result = await updateProfileImage(base64Image);
          setInfoMessage({
            text: renderText(result.message),
            isError: !result.success,
          });
          setTimeout(() => setInfoMessage({ text: "", isError: false }), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const phoneRegex = /^0\d{10}$/;
    if (userInfo.phone && !phoneRegex.test(userInfo.phone)) {
      setInfoMessage({ text: t.phoneAlert, isError: true });
      return;
    }

    if (updateProfileData) {
      const result = await updateProfileData({
        fullName: userInfo.fullName,
        displayName: userInfo.displayName,
        email: userInfo.email,
        phone: userInfo.phone,
        address: userInfo.address,
      });
      setInfoMessage({
        text: renderText(result.message),
        isError: !result.success,
      });
      setTimeout(() => setInfoMessage({ text: "", isError: false }), 3000);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!userInfo.oldPassword || !userInfo.newPassword) {
      setInfoMessage({ text: t.passRequired, isError: true });
      return;
    }

    const passwordRegex = /^\d{7}$/;
    if (!passwordRegex.test(userInfo.newPassword)) {
      setInfoMessage({ text: t.passDigitsAlert, isError: true });
      return;
    }

    if (updateUserPassword) {
      const result = await updateUserPassword(
        userInfo.oldPassword,
        userInfo.newPassword,
      );
      if (result.success) {
        setUserInfo((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
      }
      setInfoMessage({
        text: renderText(result.message),
        isError: !result.success,
      });
      setTimeout(() => setInfoMessage({ text: "", isError: false }), 3000);
    }
  };

  const handleChatFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFile({
          name: file.name,
          type: file.type,
          base64: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const sendTicketMessage = async () => {
    if (!newTicketText.trim() && !attachedFile) return;

    const finalMsgText = attachedFile
      ? `${newTicketText.trim()} [File: ${attachedFile.name}]`
      : newTicketText.trim();

    const openTicket = supportTickets.find(
      (t) => t.status === "OPEN" || t.status === "REPLIED"
    );

    if (openTicket && openTicket.ticketId && sendTicketMessageCtx) {
      const result = await sendTicketMessageCtx(
        openTicket.ticketId,
        finalMsgText,
        attachedFile?.base64 || null
      );
      setNewTicketText("");
      setAttachedFile(null);
      if (chatFileInputRef.current) chatFileInputRef.current.value = "";
      if (result?.success && refreshTicketMessages) {
        setTimeout(() => refreshTicketMessages(openTicket.ticketId), 500);
      }
      setInfoMessage({
        text: result?.success
          ? isAr
            ? "تم إرسال رسالتك بنجاح!"
            : "Message sent successfully!"
          : renderText(result?.message || "Failed to send"),
        isError: !result?.success,
      });
    } else if (createTicket) {
      const result = await createTicket(finalMsgText, attachedFile?.base64);
      setNewTicketText("");
      setAttachedFile(null);
      if (chatFileInputRef.current) chatFileInputRef.current.value = "";
      if (result?.success) {
        setTimeout(() => fetchSupportTickets(), 1000);
      }
      setInfoMessage({
        text: result?.success
          ? isAr
            ? "تم إرسال رسالتك بنجاح!"
            : "Message sent successfully!"
          : renderText(result?.message),
        isError: !result?.success,
      });
    } else {
      setInfoMessage({
        text: isAr ? "خطأ في الاتصال بالخادم" : "Server connection error",
        isError: true,
      });
    }
    setTimeout(() => setInfoMessage({ text: "", isError: false }), 3000);
  };

  const handleCreateTicket = (e) => {
    if (e) e.preventDefault();
    sendTicketMessage();
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTicketMessage();
    }
  };

  const handleSaveEditTicket = async (ticketId) => {
    if (!editingText.trim()) return;

    if (editTicket) {
      const result = await editTicket(ticketId, editingText);
      setEditingTicketId(null);
      setEditingText("");
      setInfoMessage({
        text: result?.success
          ? isAr
            ? "تم تعديل الرسالة بنجاح."
            : "Message updated successfully."
          : renderText(result?.message),
        isError: !result?.success,
      });
    }
    setTimeout(() => setInfoMessage({ text: "", isError: false }), 3000);
  };

  const handleEditMessage = async (msgId) => {
    if (!editingMsgText.trim()) return;
    const rawId = String(msgId).replace(/^CHAT-/, "");
    try {
      if (editChatMessage) {
        await editChatMessage(rawId, editingMsgText.trim());
      }
      setSupportTickets((prev) =>
        prev.map((ticket) => ({
          ...ticket,
          messages: ticket.messages.map((m) =>
            String(m.id) === String(msgId) ? { ...m, text: editingMsgText.trim() } : m
          ),
        }))
      );
      setEditingMsgId(null);
      setEditingMsgText("");
      setInfoMessage({ text: isAr ? "تم تعديل الرسالة بنجاح" : "Message edited successfully", isError: false });
    } catch {
      setInfoMessage({ text: isAr ? "فشل تعديل الرسالة" : "Failed to edit message", isError: true });
    }
    setTimeout(() => setInfoMessage({ text: "", isError: false }), 3000);
  };

  const handleLogout = () => {
    if (logoutUser) logoutUser();
    navigate("/home");
  };

  const handleSendMessageClick = (e, order) => {
    if (e) e.stopPropagation();
    setOrderToContact(order);
    setIsMessageModalOpen(true);
  };

  const handleSendMessageSubmit = async (e) => {
    e.preventDefault();
    if (!orderMessageText.trim()) {
      setInfoMessage({
        text: t.alertMessage,
        isError: true,
      });
      setTimeout(() => setInfoMessage({ text: "", isError: false }), 3000);
      return;
    }

    if (sendOrderChangeRequest && orderToContact) {
      // تفصيل البيانات وتنسيقها بشكل جميل عبر استخدام الخطوط الفاصلة لإعطاء مظهر منسق ومنفصل تماماً
      const formattedMessage = isAr
        ? `🚨 [طلب تعديل] 🚨\n----------------------------------\n📦 رقم الطلب: #${orderToContact.id}\n----------------------------------\n💬 نص الرسالة:\n${orderMessageText}`
        : `🚨 [Change Request] 🚨\n----------------------------------\n📦 Order ID: #${orderToContact.id}\n----------------------------------\n💬 Message:\n${orderMessageText}`;

      const result = await sendOrderChangeRequest(
        orderToContact.id,
        formattedMessage,
      );

      setInfoMessage({
        text: result?.message || t.successMessage,
        isError: !result?.success,
      });

      setIsMessageModalOpen(false);
      setOrderMessageText("");
      setOrderToContact(null);
      setSelectedOrder(null);

      setActiveTab("chat");

      setTimeout(() => setInfoMessage({ text: "", isError: false }), 4000);
    }
  };

  const getInitials = (name) => {
    if (!name) return "DM";
    const cleanName = typeof name === "object" ? renderText(name) : name;
    const parts = String(cleanName).trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return String(cleanName).substring(0, 2).toUpperCase();
  };

  const getStatusTranslation = (status) => {
    const s = String(status).toUpperCase();
    if (!isAr) return s;
    switch (s) {
      case "PENDING":
        return "قيد الانتظار";
      case "PROCESSING":
      case "IN PROGRESS":
        return "جاري التجهيز";
      case "SHIPPED":
        return "تم الشحن";
      case "COMPLETED":
      case "DELIVERED":
        return "مكتمل";
      case "CANCELED":
      case "CANCELLED":
        return "ملغي";
      default:
        return s;
    }
  };

  const getStatusClass = (status) => {
    switch (String(status).toUpperCase()) {
      case "PENDING":
        return "bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block";
      case "IN PROGRESS":
      case "PROCESSING":
        return "bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block";
      case "COMPLETED":
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block";
      case "CANCELED":
      case "CANCELLED":
        return "bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-100 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block";
    }
  };

  const isPending = (status) => {
    return String(status).toUpperCase() === "PENDING";
  };

  useEffect(() => {
    if (activeTab !== "chat" || !refreshTicketMessages) return;
    const openTickets = supportTickets.filter(
      (t) => t.ticketId && (t.status === "OPEN" || t.status === "REPLIED")
    );
    if (openTickets.length === 0) return;
    if (markTicketRepliesSeen) {
      openTickets.forEach((t) => markTicketRepliesSeen(t.ticketId));
    }
    const interval = setInterval(() => {
      openTickets.forEach((t) => refreshTicketMessages(t.ticketId));
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, supportTickets, refreshTicketMessages]);

  if (!currentUser) return null;

  const sidebarTabs = [
    {
      id: "dashboard",
      label: t.dashboard,
      icon: <LayoutDashboard size={18} />,
    },
    { id: "orders", label: t.orders, icon: <ShoppingBag size={18} /> },
    { id: "chat", label: t.support, icon: <MessageSquare size={18} /> },
    {
      id: "favs",
      label: t.wishlist,
      icon: <Heart size={18} />,
      badge: wishlistItems.length,
    },
    { id: "info", label: t.settings, icon: <Settings size={18} /> },
  ];

  return (
    <div
      key={currentUser?.email || "loading"}
      className="min-h-screen bg-[#fafbfe] font-sans pb-24 pt-4 text-gray-800 px-3 sm:px-0"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-1 sm:px-6">
        {/* Upper Action Bar */}
        <div className="flex flex-row justify-between items-center gap-2 mb-5 border-b pb-4 border-gray-200/50">
          <div className="flex items-center gap-3">
            <h1 className="font-extrabold text-gray-900 text-lg sm:text-2xl tracking-tight">
              {t.myAccount}
            </h1>

            {/* Custom Toggle Switch */}
            <div
              onClick={() => setLang(isAr ? "en" : "ar")}
              className="relative w-14 h-7 bg-gray-200 rounded-full p-1 cursor-pointer select-none transition-colors duration-300 flex items-center justify-between px-1.5 shrink-0"
              style={{ backgroundColor: isAr ? "#10b981" : "#e5e7eb" }}
            >
              <span className="text-[8px] font-black text-gray-400 z-0 select-none">
                EN
              </span>
              <span className="text-[8px] font-black text-white z-0 select-none">
                AR
              </span>

              <motion.div
                className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center z-10"
                animate={{ x: isAr ? 26 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Globe
                  size={12}
                  className={isAr ? "text-emerald-500" : "text-gray-400"}
                />
              </motion.div>
            </div>
          </div>

          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-1 text-[11px] font-bold bg-white text-green-600 border border-gray-200 px-2.5 py-1.5 rounded-xl shadow-xs transition-all"
          >
            {!isAr && <Home size={13} />}
            {t.home}
            {isAr && <Home size={13} />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Desktop Only Layout */}
          <div className="hidden lg:block w-full lg:w-1/4 bg-white rounded-2xl border border-gray-200/60 p-3 shadow-xs lg:sticky lg:top-4 h-fit">
            <div className="flex flex-col gap-1.5">
              {sidebarTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-linear-to-r from-green-600 to-emerald-500 text-white shadow-xs"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white text-green-600" : "bg-gray-100 text-gray-500"}`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
              <div className="h-px w-full bg-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50"
              >
                <LogOut size={16} />
                {t.logout}
              </button>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="w-full lg:w-3/4 space-y-6">
            {infoMessage.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 border text-xs font-bold rounded-xl text-center shadow-xs ${
                  infoMessage.isError
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
                }`}
              >
                {infoMessage.text}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18 }}
              >
                {/* ================= TABS 1: DASHBOARD ================= */}
                {activeTab === "dashboard" && (
                  <div className="space-y-5">
                    {/* Welcome Header */}
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/60 shadow-2xs flex flex-row items-center gap-4 text-start">
                      <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-green-500 bg-green-600/10 flex items-center justify-center shadow-inner text-green-700 font-bold text-base sm:text-xl overflow-hidden shrink-0">
                        {userPhotoSrc && !imgError ? (
                          <img
                            src={userPhotoSrc}
                            onError={() => setImgError(true)}
                            className="w-full h-full object-cover rounded-full"
                            alt="Profile"
                          />
                        ) : (
                          getInitials(currentUser?.fullName)
                        )}

                        <label className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 sm:py-1 flex items-center justify-center cursor-pointer transition-colors hover:bg-black/80 z-10">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-3 h-3 text-white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                            />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpdate}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div>
                        <h2 className="text-sm sm:text-lg font-extrabold text-gray-900">
                          {t.welcome}{" "}
                          {renderText(
                            currentUser?.displayName ||
                              currentUser?.fullName?.split(" ")[0],
                          )}
                          !
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                          {t.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#f0f7ff] border border-[#e0efff] p-2.5 sm:p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between text-center sm:text-start">
                        <div className="space-y-0.5">
                          <span className="block text-sm sm:text-xl font-black text-gray-900">
                            {String(totalOrdersCount).padStart(2, "0")}
                          </span>
                          <span className="block text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            {t.totalOrders}
                          </span>
                        </div>
                        <div className="hidden sm:flex w-9 h-9 bg-white rounded-lg border border-[#e2efff] items-center justify-center text-blue-500 shrink-0">
                          <ShoppingBag size={18} />
                        </div>
                      </div>

                      <div className="bg-[#fff6f0] border border-[#ffeade] p-2.5 sm:p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between text-center sm:text-start">
                        <div className="space-y-0.5">
                          <span className="block text-sm sm:text-xl font-black text-gray-900">
                            {String(pendingOrdersCount).padStart(2, "0")}
                          </span>
                          <span className="block text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            {t.pendingOrders}
                          </span>
                        </div>
                        <div className="hidden sm:flex w-9 h-9 bg-white rounded-lg border border-[#ffe0cf] items-center justify-center text-orange-500 shrink-0">
                          <Clock size={18} />
                        </div>
                      </div>

                      <div className="bg-[#f2faf5] border border-[#e1f3e8] p-2.5 sm:p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between text-center sm:text-start">
                        <div className="space-y-0.5">
                          <span className="block text-sm sm:text-xl font-black text-gray-900">
                            {String(completedOrdersCount).padStart(2, "0")}
                          </span>
                          <span className="block text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            {t.completedOrders}
                          </span>
                        </div>
                        <div className="hidden sm:flex w-9 h-9 bg-white rounded-lg border border-[#d3ede0] items-center justify-center text-green-600 shrink-0">
                          <CheckCircle size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Account Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start">
                      <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-3xs space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b pb-1.5 flex items-center gap-1.5">
                          <User size={13} /> {t.accountInfo}
                        </h3>
                        <div className="space-y-1.5 text-xs text-gray-500">
                          <p>
                            <strong className="text-gray-700 font-medium">
                              {t.fullName}:
                            </strong>{" "}
                            {renderText(currentUser?.fullName)}
                          </p>
                          <p>
                            <strong className="text-gray-700 font-medium">
                              {t.email}:
                            </strong>{" "}
                            {currentUser?.email}
                          </p>
                          <p>
                            <strong className="text-gray-700 font-medium">
                              {t.phone}:
                            </strong>{" "}
                            {currentUser?.phone || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-3xs space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b pb-1.5 flex items-center gap-1.5">
                          <MapPin size={13} /> {t.shippingAddress}
                        </h3>
                        <div className="text-xs text-gray-500 leading-relaxed min-h-10">
                          {renderText(currentUser?.address) || t.noAddress}
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-xl border border-gray-200/60 shadow-3xs overflow-hidden">
                      <div className="p-3 border-b border-gray-100 font-bold text-[10px] uppercase tracking-wider text-gray-400 text-start">
                        {t.recentActivity}
                      </div>
                      <div className="overflow-x-auto">
                        {realOrders.length === 0 ? (
                          <div className="p-6 text-center space-y-2">
                            <p className="text-xs text-gray-400">
                              {t.noOrders}
                            </p>
                          </div>
                        ) : (
                          <table className="w-full border-collapse text-xs text-start">
                            <thead>
                              <tr className="bg-gray-50/70 text-gray-400 uppercase font-bold border-b border-gray-100">
                                <th className="p-3">{t.orderId}</th>
                                <th className="p-3">{t.status}</th>
                                <th className="p-3">{t.total}</th>
                                <th className="p-3 text-center">{t.actions}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {realOrders.slice(0, 3).map((order) => (
                                <tr
                                  key={order.id}
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-gray-600 hover:bg-gray-50/50 cursor-pointer whitespace-nowrap"
                                >
                                  <td className="p-3 font-bold text-gray-900">
                                    {renderText(order.id)}
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={getStatusClass(order.status)}
                                    >
                                      {getStatusTranslation(order.status)}
                                    </span>
                                  </td>
                                  <td className="p-3 font-bold text-gray-900">
                                    {renderText(
                                      order.total || order.totalPrice,
                                    )}{" "}
                                    EGP
                                  </td>
                                  <td
                                    className="p-3 text-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {isPending(order.status) && (
                                      <button
                                        onClick={(e) =>
                                          handleSendMessageClick(e, order)
                                        }
                                        className="text-[9px] bg-green-50 text-green-600 border border-green-100 px-2 py-1 rounded-md font-bold"
                                      >
                                        {t.sendMessage}
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= TABS 2: ORDER HISTORY ================= */}
                {activeTab === "orders" && (
                  <div className="bg-white rounded-xl border border-gray-200/60 shadow-3xs overflow-hidden">
                    <div className="p-4 border-b border-gray-100 font-bold text-sm text-gray-800 text-start">
                      {t.orderHistory}
                    </div>
                    <div className="overflow-x-auto">
                      {realOrders.length === 0 ? (
                        <div className="p-10 text-center space-y-3">
                          <p className="text-xs text-gray-400">{t.noOrders}</p>
                        </div>
                      ) : (
                        <table className="w-full border-collapse text-xs text-start">
                          <thead>
                            <tr className="bg-gray-50/70 text-gray-400 uppercase font-bold border-b border-gray-100">
                              <th className="p-3">{t.orderId}</th>
                              <th className="p-3">{t.status}</th>
                              <th className="p-3">{t.total}</th>
                              <th className="p-3 text-center">{t.actions}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {realOrders.map((order) => (
                              <tr
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className="text-gray-600 hover:bg-gray-50/50 cursor-pointer whitespace-nowrap"
                              >
                                <td className="p-3 font-bold text-gray-900">
                                  {renderText(order.id)}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={getStatusClass(order.status)}
                                  >
                                    {getStatusTranslation(order.status)}
                                  </span>
                                </td>
                                <td className="p-3 font-bold text-gray-900">
                                  {renderText(order.total || order.totalPrice)}{" "}
                                  EGP
                                </td>
                                <td
                                  className="p-3 text-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {isPending(order.status) && (
                                    <button
                                      onClick={(e) =>
                                        handleSendMessageClick(e, order)
                                      }
                                      className="text-[9px] bg-green-50 text-green-600 border border-green-100 px-2 py-1 rounded-md font-bold"
                                    >
                                      {t.sendMessage}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* ================= TABS 3: SETTINGS & PASSWORD ================= */}
                {activeTab === "info" && (
                  <div className="space-y-4 text-start pb-6">
                    <form
                      onSubmit={handleUpdateProfile}
                      className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-3xs space-y-3.5"
                    >
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b pb-1.5">
                        {t.settings}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                            {t.displayName}
                          </label>
                          <input
                            type="text"
                            value={userInfo.displayName}
                            onChange={(e) =>
                              setUserInfo({
                                ...userInfo,
                                displayName: e.target.value,
                              })
                            }
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/5 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                            {t.fullName}
                          </label>
                          <input
                            type="text"
                            value={userInfo.fullName}
                            onChange={(e) =>
                              setUserInfo({
                                ...userInfo,
                                fullName: e.target.value,
                              })
                            }
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/5 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                            {t.email}
                          </label>
                          <input
                            type="email"
                            value={userInfo.email}
                            onChange={(e) =>
                              setUserInfo({
                                ...userInfo,
                                email: e.target.value,
                              })
                            }
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                            {t.phone}
                          </label>
                          <input
                            type="tel"
                            maxLength={11}
                            placeholder="01xxxxxxxxx"
                            value={userInfo.phone}
                            onChange={(e) =>
                              setUserInfo({
                                ...userInfo,
                                phone: e.target.value,
                              })
                            }
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-green-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                            {t.shippingAddress}
                          </label>
                          <input
                            type="text"
                            value={userInfo.address}
                            onChange={(e) =>
                              setUserInfo({
                                ...userInfo,
                                address: e.target.value,
                              })
                            }
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-green-500"
                            placeholder="Apartment, Street, City"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-green-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors shadow-xs"
                      >
                        {t.saveChanges}
                      </button>
                    </form>

                    <form
                      onSubmit={handleUpdatePassword}
                      autoComplete="off"
                      className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-3xs space-y-3.5"
                    >
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b pb-1.5">
                        {t.security}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                            {t.currentPassword}
                          </label>
                          <input
                            type="password"
                            autoComplete="new-password"
                            value={userInfo.oldPassword}
                            onChange={(e) =>
                              setUserInfo({
                                ...userInfo,
                                oldPassword: e.target.value,
                              })
                            }
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                            {t.newPassword}
                          </label>
                          <input
                            type="password"
                            maxLength={7}
                            autoComplete="new-password"
                            value={userInfo.newPassword}
                            onChange={(e) =>
                              setUserInfo({
                                ...userInfo,
                                newPassword: e.target.value,
                              })
                            }
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-green-500"
                            placeholder="1234567"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-green-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors shadow-xs"
                      >
                        {t.updatePassword}
                      </button>
                    </form>

                    <button
                      onClick={handleLogout}
                      className="w-full sm:hidden border border-rose-200 text-rose-500 font-bold text-xs py-3 rounded-xl bg-rose-50/30"
                    >
                      {t.logout}
                    </button>
                  </div>
                )}

                {/* ================= TABS 4: WISHLIST ================= */}
                {activeTab === "favs" && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-3xs text-start">
                    <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b pb-2.5 mb-3">
                      {t.wishlist}
                    </h2>
                    {!wishlistItems || wishlistItems.length === 0 ? (
                      <div className="py-10 text-center">
                        <p className="text-xs text-gray-400">
                          {t.emptyWishlist}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {wishlistItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex gap-2.5 p-2.5 border border-gray-100 rounded-xl items-center bg-gray-50/20 justify-between"
                          >
                            <div className="flex gap-2.5 items-center overflow-hidden">
                              <img
                                src={
                                  item.image ||
                                  item.img ||
                                  item.thumbnail ||
                                  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150"
                                }
                                alt="product"
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                              <div className="overflow-hidden">
                                <h4 className="text-xs font-bold text-gray-800 truncate">
                                  {renderText(item.title || item.name)}
                                </h4>
                                <p className="text-xs text-green-600 font-black mt-0.5">
                                  {renderText(item.price || "0")} EGP
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleWishlist(item)}
                              className="text-rose-500 p-1.5 rounded-lg hover:bg-rose-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ================= TABS 5: SUPPORT CHAT (فريق الدعم) ================= */}
                {activeTab === "chat" && (
                  <div className="space-y-4 text-start pb-6">
                    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-md overflow-hidden flex flex-col h-[70vh] sm:h-[60vh]">
                      {/* Chat Header */}
                      <div className="bg-linear-to-r from-green-600 to-emerald-500 p-3 sm:p-4 text-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                            💬
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs sm:text-sm tracking-wide">
                              {t.openTicket}
                            </h4>
                            <p className="text-[9px] text-emerald-100/80">
                              Delora Support Team is online
                            </p>
                          </div>
                        </div>
                        <span className="bg-emerald-700/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                          Live
                        </span>
                      </div>

                      {/* Chat Messages Body */}
                      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#efeae2] space-y-3.5 flex flex-col-reverse pattern-bg">
                        {supportTickets.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                            <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-400 shadow-sm">
                              <MessageSquare size={18} />
                            </div>
                            <p className="text-xs font-bold text-gray-500">
                              {t.noTickets}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              Send your first message below, our team will reply
                              instantly!
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4 w-full">
                            {[...supportTickets].reverse().map((ticket) => (
                              <div key={ticket.id} className="space-y-2.5">
                                <div className="flex justify-center">
                                  <span className="bg-white/70 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full text-gray-500 shadow-2xs border border-gray-200/30">
                                    {ticket.date} •{" "}
                                    {getStatusTranslation(ticket.status)}
                                  </span>
                                </div>

                                <div className="space-y-2.5">
                                  {ticket.messages.map((msg, i) => {
                                    const isUser =
                                      msg.sender === "user" ||
                                      msg.sender === "client";
                                    const isAdmin = msg.sender === "admin";
                                    const isEditingMsg = editingMsgId === String(msg.id);
                                    const msgId = String(msg.id);

                                    // Customer can edit only own messages + only before admin replies
                                    const hasAdminReplied = ticket.messages.some(
                                      (m) => m.sender === "admin"
                                    );
                                    const canEdit = isUser && !hasAdminReplied && String(msg.id).startsWith("CHAT-");

                                    return (
                                      <div
                                        key={i}
                                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                                      >
                                        <div className="max-w-[85%] sm:max-w-[70%] space-y-1">
                                          {isEditingMsg ? (
                                            <div
                                              ref={editContainerRef}
                                              className="flex gap-1.5 items-center bg-white p-1.5 rounded-xl shadow-sm border border-gray-200"
                                            >
                                              <input
                                                type="text"
                                                value={editingMsgText}
                                                onChange={(e) =>
                                                  setEditingMsgText(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") handleEditMessage(msgId);
                                                  if (e.key === "Escape") { setEditingMsgId(null); setEditingMsgText(""); }
                                                }}
                                                autoFocus
                                                className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-900 outline-none"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => handleEditMessage(msgId)}
                                                className="bg-green-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shrink-0"
                                              >
                                                {isAr ? "حفظ" : "Save"}
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingMsgId(null);
                                                  setEditingMsgText("");
                                                }}
                                                className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shrink-0"
                                              >
                                                <X size={12} />
                                              </button>
                                            </div>
                                          ) : (
                                            <>
                                              <div
                                                className={`p-3 rounded-2xl text-xs leading-relaxed shadow-3xs ${
                                                  isUser
                                                    ? "bg-[#dcf8c6] text-gray-800 rounded-tr-none ml-auto whitespace-pre-line"
                                                    : "bg-white text-gray-800 rounded-tl-none border border-gray-200/50 whitespace-pre-line"
                                                }`}
                                              >
                                                {/* Show admin name for multiple admins */}
                                                {isAdmin && msg.senderName && (
                                                  <span className="block text-[9px] font-black mb-1 text-emerald-700">
                                                    {msg.senderName}
                                                  </span>
                                                )}
                                                {msg.file ? (
                                                  <div className="space-y-2">
                                                    <img
                                                      src={msg.file}
                                                      alt="Attached File"
                                                      className="max-w-full rounded-lg max-h-48 object-contain cursor-pointer hover:opacity-95 transition-opacity"
                                                      onClick={() => {
                                                        const win =
                                                          window.open();
                                                        win.document.write(
                                                          `<iframe src="${msg.file}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`,
                                                        );
                                                      }}
                                                    />
                                                    {msg.text && (
                                                      <p className="text-[11px] text-gray-700 mt-1 border-t border-black/5 pt-1">
                                                        {renderText(msg.text)}
                                                      </p>
                                                    )}
                                                  </div>
                                                ) : (
                                                  renderText(msg.text)
                                                )}
                                                <div className="flex items-center justify-end gap-1 mt-1">
                                                  <span className="text-[9px] font-bold text-gray-400">
                                                    {msg.createdAt
                                                      ? new Date(msg.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", { month: "short", day: "numeric" }) +
                                                        " " +
                                                        new Date(msg.createdAt).toLocaleTimeString(isAr ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })
                                                      : ""}
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Edit button — only for customer's own messages before admin replies */}
                                              {canEdit && !isEditingMsg && (
                                                <div className={`flex gap-2.5 text-[9px] text-gray-500 font-bold px-1 ${isUser ? "justify-end" : "justify-start"}`}>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setEditingMsgId(msgId);
                                                      setEditingMsgText(msg.text || "");
                                                    }}
                                                    className="hover:text-blue-600 flex items-center gap-0.5 transition-colors"
                                                  >
                                                    <Edit2 size={9} />
                                                    {isAr ? "تعديل" : "Edit"}
                                                  </button>
                                                </div>
                                              )}

                                            </>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {attachedFile && (
                        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600 shrink-0">
                          <span className="truncate flex items-center gap-1.5 font-bold">
                            📎 {attachedFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAttachedFile(null)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded-full hover:bg-gray-200 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}

                      {/* Chat Input Area */}
                      <form
                        onSubmit={handleCreateTicket}
                        className="p-2.5 sm:p-3 bg-white border-t border-gray-200 flex gap-2 items-center shrink-0"
                      >
                        <input
                          type="file"
                          ref={chatFileInputRef}
                          onChange={handleChatFileChange}
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.txt"
                        />
                        <button
                          type="button"
                          onClick={() => chatFileInputRef.current?.click()}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0"
                        >
                          <Paperclip size={18} />
                        </button>

                        <input
                          type="text"
                          placeholder={t.description}
                          value={newTicketText}
                          required={!attachedFile}
                          onChange={(e) => setNewTicketText(e.target.value)}
                          onKeyDown={handleChatKeyDown}
                          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-900 outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/5 transition-all"
                        />
                        <button
                          type="submit"
                          className="bg-green-600 text-white p-2.5 sm:p-3 rounded-full hover:bg-green-700 transition-all shadow-xs flex items-center justify-center shrink-0 w-9 h-9 sm:w-11 sm:h-11"
                        >
                          <Send size={15} />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ================= 📱 MOBILE BOTTOM NAVIGATION BAR ================= */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-xl z-50 px-2 pb-safe">
        <div className="flex justify-between items-center py-2 max-w-md mx-auto">
          {sidebarTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 px-2.5 gap-1 transition-all rounded-xl ${
                  isSelected ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${isSelected ? "bg-green-50" : ""}`}
                >
                  {tab.icon}
                </div>
                <span className="text-[9px] font-extrabold tracking-tight">
                  {tab.label}
                </span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute top-1.5 right-4 bg-rose-500 text-white text-[8px] font-bold px-1.5 rounded-full shadow-sm scale-90">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 🔎 MODAL تفاصيل الطلب ================= */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-3 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-start border border-gray-100"
            >
              <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-gray-900">
                    {t.orderTitle}
                    {renderText(selectedOrder.id)}
                  </h3>
                  <p className="text-[9px] text-gray-400">
                    {t.purchasedOn}{" "}
                    {renderText(selectedOrder.date || selectedOrder.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 p-1.5 rounded-full hover:bg-gray-200"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3.5 space-y-4 overflow-y-auto flex-1">
                <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <div className="space-y-0.5">
                    <span className="block text-[9px] text-gray-400 uppercase font-black">
                      {t.status}
                    </span>
                    <span className={getStatusClass(selectedOrder.status)}>
                      {getStatusTranslation(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[9px] text-gray-400 uppercase font-black">
                      {t.payment}
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      {selectedOrder.paymentMethod
                        ? renderText(selectedOrder.paymentMethod)
                        : t.cashOnDelivery}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t.productsOrdered}
                  </h4>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 border border-gray-100 rounded-xl bg-gray-50/20"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <img
                              src={
                                item.image ||
                                item.img ||
                                item.thumbnail ||
                                "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150"
                              }
                              alt="product"
                              className="w-8 h-8 rounded-lg object-cover shrink-0"
                            />
                            <div className="overflow-hidden">
                              <h5 className="text-xs font-bold text-gray-800 truncate">
                                {renderText(item.nameAr || item.nameEn || item.title || item.name)}
                              </h5>
                              <p className="text-[9px] text-gray-400">
                                {t.qty}{" "}
                                {item.isWeightType
                                  ? `${item.weightGrams}g`
                                  : item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-green-600 shrink-0">
                            {renderText(item.totalPrice || item.price || item.currentPrice)} EGP
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      No product details.
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                <div>
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">
                    {isAr ? "المبلغ الإجمالي" : "Grand Total"}
                  </span>
                  <span className="text-sm font-black text-green-600">
                    {renderText(
                      selectedOrder.total || selectedOrder.totalPrice,
                    )}{" "}
                    EGP
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {isPending(selectedOrder.status) && (
                    <button
                      onClick={(e) => handleSendMessageClick(e, selectedOrder)}
                      className="bg-green-600 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl"
                    >
                      {t.sendMessage}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="bg-white border border-gray-200 text-gray-700 font-bold text-[10px] px-3 py-2 rounded-xl"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 📩 MODAL نافذة المراسلة الفورية بخصوص الطلبات ================= */}
      <AnimatePresence>
        {isMessageModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-110 flex items-center justify-center p-3 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl text-start border border-gray-100"
            >
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 mb-1">
                {t.modalTitle}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-3.5 leading-relaxed">
                {t.modalSubtitle}
              </p>

              <form onSubmit={handleSendMessageSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                    {t.messageLabel}
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder={t.placeholderMessage}
                    value={orderMessageText}
                    onChange={(e) => setOrderMessageText(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-green-500"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMessageModalOpen(false);
                      setOrderMessageText("");
                      setOrderToContact(null);
                    }}
                    className="bg-white border border-gray-200 text-gray-700 font-bold text-[10px] px-3.5 py-2 rounded-xl"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white font-bold text-[10px] px-4 py-2 rounded-xl"
                  >
                    {t.sendMessage}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
