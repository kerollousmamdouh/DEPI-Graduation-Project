import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useOrderDetails } from "../hooks/useOrders";
import { useComplaints } from "../hooks/useComplaints";
import {
  ArrowRight,
  ArrowLeft,
  Printer,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ChevronDown,
  Check,
  Receipt,
  PackageX,
  Loader2,
  AlertTriangle,
  MessageSquareWarning,
  Bell,
  ExternalLink
} from "lucide-react";

const STATUS_OPTIONS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  const { order, isLoading, isUpdating, isError, error, updateStatus, refetch } = useOrderDetails(id);
  const { complaints } = useComplaints();

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState({ text: "", isError: false });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderText = (textObj) => {
    if (!textObj) return "";
    if (typeof textObj === "string" || typeof textObj === "number") return String(textObj);
    return isAr ? textObj.ar || textObj.en || "" : textObj.en || textObj.ar || "";
  };

  // نداء مباشر للحالات المسطحة في ملف الترجمة
  const getStatusTranslation = (status) => {
    const s = String(status).toLowerCase();
    return t(s) || status;
  };

  const getStatusClass = (status) => {
    switch (String(status).toUpperCase()) {
      case "PENDING":
        return "bg-amber-50  text-amber-600  border-amber-100 ";
      case "PROCESSING":
        return "bg-orange-50  text-orange-600  border-orange-100 ";
      case "SHIPPED":
        return "bg-blue-50  text-blue-600  border-blue-100 ";
      case "DELIVERED":
        return "bg-emerald-50  text-emerald-600  border-emerald-100 ";
      case "CANCELED":
        return "bg-rose-50  text-rose-600  border-rose-100 ";
      default:
        return "bg-gray-50  text-gray-600  border-gray-100 ";
    }
  };

  const handleStatusChange = async (newStatus) => {
    setIsStatusOpen(false);
    try {
      await updateStatus(newStatus);
      setInfoMessage({ text: t("statusUpdated"), isError: false }); // تم حذف orders.
    } catch (err) {
      setInfoMessage({ text: err.message || t("statusUpdateFailed"), isError: true }); // تم حذف orders.
    } finally {
      setTimeout(() => setInfoMessage({ text: "", isError: false }), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200/60 bg-white p-10 text-center shadow-xs max-w-md mx-auto my-12">
        <Loader2 size={32} className="mx-auto mb-3 text-green-500 animate-spin" />
        <p className="text-xs font-bold text-gray-400">{t("loadingDetails")}</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="rounded-xl border border-gray-200/60 bg-white p-10 text-center shadow-xs max-w-md mx-auto my-12">
        {isError ? <AlertTriangle size={36} className="mx-auto mb-3 text-rose-400" /> : <PackageX size={36} className="mx-auto mb-3 text-gray-200" />}
        <h2 className="mb-1.5 text-sm font-black text-gray-900">{t("notFoundTitle")}</h2>
        <p className="mb-5 text-xs text-gray-400">{error || t("notFoundBody")}</p>
        <div className="flex items-center justify-center gap-2.5">
          {isError && (
            <button onClick={() => refetch()} className="rounded-xl bg-gray-100 px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">
              {t("retry")}
            </button>
          )}
          <button onClick={() => navigate("/orders")} className="rounded-xl bg-green-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-green-700 transition-colors cursor-pointer">
            {t("back")} {/* تم حذف orders. */}
          </button>
        </div>
      </div>
    );
  }

  const { customerDetails, items, totalPrice, paymentMethod, paymentDetails, status, createdAt } = order;

  const relatedComplaint = complaints.find(
    (c) => String(c.orderId) === String(order.id) || String(c.id) === String(order.id)
  );

  const hasPendingCustomerMessage =
    relatedComplaint &&
    relatedComplaint.status === "PENDING" &&
    relatedComplaint.messages?.some((m) => m.sender === "user" || m.sender === "client");

  return (
    <div className="space-y-5 max-w-5xl mx-auto px-2 pb-12 text-start" dir={isAr ? "rtl" : "ltr"}>
      {/* Toast Notification */}
      <AnimatePresence>
        {infoMessage.text && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-xl border p-3 text-xs font-bold shadow-xs ${
              infoMessage.isError ? "bg-rose-50  border-rose-100  text-rose-600 " : "bg-green-50  border-green-100  text-green-600 "
            }`}
          >
            {infoMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Support Alert */}
      {hasPendingCustomerMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                <Bell size={20} />
                <span className="absolute -top-1 -end-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
                </span>
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-950 flex items-center gap-2">
                  {t("pendingNotifTitle")} {/* تم حذف orders. */}
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">Pending Reply</span>
                </h4>
                <p className="mt-0.5 text-xs text-amber-800/80 leading-relaxed max-w-2xl font-medium">{t("pendingNotifBody")}</p> {/* تم حذف orders. */}
              </div>
            </div>
            <button
              onClick={() => navigate(`/complaints?orderId=${order.id}`)}
              className="inline-flex items-center justify-center gap-2 shrink-0 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-amber-700 transition-all cursor-pointer group"
            >
              <span>{t("openChatBtn")}</span> {/* تم حذف orders. */}
              <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => navigate("/orders")}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-green-600 hover:opacity-80 cursor-pointer"
          >
            {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            {t("back")} {/* تم حذف orders. */}
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            {t("order")} #{renderText(order.id).replace("ORDER-", "")}
          </h1>
          <p className="mt-1 text-[10px] text-gray-400 font-bold">
            {createdAt && new Date(createdAt).toLocaleString(isAr ? "ar-EG" : "en-US")}
          </p>
        </div>

        {/* Status Dropdown */}
        <div ref={dropdownRef} className="relative z-10 w-full sm:w-52">
          <button
            disabled={isUpdating}
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50 ${getStatusClass(status)}`}
          >
            <span className="flex items-center gap-2">
              {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-current"></span>}
              {getStatusTranslation(status)}
            </span>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isStatusOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isStatusOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute end-0 top-full mt-2 w-full overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-2xl"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleStatusChange(opt)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-xs font-bold transition hover:bg-gray-50  cursor-pointer ${
                      String(status).toUpperCase() === opt ? "bg-green-50  text-green-600 " : "text-gray-600 "
                    }`}
                  >
                    {getStatusTranslation(opt)}
                    {String(status).toUpperCase() === opt && <Check size={14} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Grid structure */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Sidebar Panel */}
        <div className="space-y-5 lg:col-span-1">
          {/* Customer info card */}
          <div className="rounded-xl border border-gray-200/60 bg-white p-4 shadow-xs">
            <h2 className="mb-3.5 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2.5">
              {t("customerInfo")}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-black text-gray-900">{renderText(customerDetails?.name)}</p>
                {customerDetails?.email && (
                  <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Mail size={11} /> {customerDetails.email}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <Phone size={14} className="text-green-600 shrink-0" />
                <span className="font-bold" dir="ltr">{customerDetails?.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <MapPin size={14} className="text-rose-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{renderText(customerDetails?.address)}</span>
              </div>
            </div>
          </div>

          {/* Payment panel card */}
          <div className="rounded-xl border border-gray-200/60 bg-white p-4 shadow-xs">
            <h2 className="mb-3.5 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2.5">
              {t("paymentDetails")}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-blue-500 shrink-0" />
                <span className="font-bold text-xs text-gray-900">
                  {paymentMethod === "cod" ? t("cod") : renderText(paymentMethod).toUpperCase()}
                </span>
              </div>

              {paymentMethod !== "cod" && paymentDetails && (
                <div className="mt-3 space-y-2.5 rounded-xl bg-gray-50/70 p-3 border border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase">{t("transactionId")}</p>
                    <p className="font-black text-xs text-gray-900" dir="ltr">{paymentDetails.transactionId || "N/A"}</p>
                  </div>
                  {paymentDetails.receiptImage && (
                    <div className="space-y-1 pt-2 border-t border-gray-200">
                      <p className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
                        <Receipt size={11} /> {t("receipt")} {/* تم حذف orders. */}
                      </p>
                      <a
                        href={paymentDetails.receiptImage}
                        target="_blank"
                        rel="noreferrer"
                        className="block mt-1.5 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
                      >
                        <img src={paymentDetails.receiptImage} alt="Receipt" className="w-full h-28 object-cover" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="space-y-5 lg:col-span-2">
          {/* Products Ordered */}
          <div className="rounded-xl border border-gray-200/60 bg-white p-4 shadow-xs">
            <h2 className="mb-4 text-sm font-black text-gray-900">{t("productsOrdered")}</h2>
            <div className="space-y-2.5">
              {items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/40 p-2.5 sm:p-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image || item.img || item.thumbnail || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150"}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-gray-900 truncate">{renderText(item.nameAr || item.nameEn || item.title || item.name)}</h3>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                        {t("qty")} {item.isWeightType ? `${item.weightGrams}g` : item.quantity} {/* تم حذف orders. */}
                        {item.isOfferItem && (
                          <span className="mx-1.5 ms-1.5 text-[9px] bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-md">
                            Offer
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-xs font-black text-green-600">{renderText(item.totalPrice || item.pricePerUnit || item.price)} EGP</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Block */}
            <div className="mt-5 border-t border-gray-100 pt-5">
              <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100">
                <span className="text-sm font-black text-gray-900">{t("grandTotal")}</span>
                <span className="text-lg font-black text-green-600">{renderText(totalPrice)} EGP</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-gray-800 cursor-pointer col-span-1"
            >
              <Printer size={15} /> <span>{t("print")}</span> {/* تم حذف orders. */}
            </button>
            <button
              onClick={() => window.open(`https://wa.me/${String(customerDetails?.phone || "").replace(/\D/g, "")}`, "_blank")}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#20bd5a] cursor-pointer col-span-1"
            >
              <MessageCircle size={15} /> <span>{t("whatsapp")}</span> {/* تم حذف orders. */}
            </button>
            {relatedComplaint && (
              <button
                onClick={() => navigate(`/complaints?orderId=${order.id}`)}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-700 cursor-pointer col-span-2 sm:col-span-1"
              >
                <MessageSquareWarning size={15} /> <span>{t("siteChat")}</span> {/* تم حذف orders. */}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
