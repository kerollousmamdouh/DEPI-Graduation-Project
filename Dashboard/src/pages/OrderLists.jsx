import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useOrders } from "../hooks/useOrders";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  PackageSearch,
  ListFilter,
  Loader2,
  AlertTriangle
} from "lucide-react";

const STATUS_FILTERS = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];

const OrderLists = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage(); 
  const isAr = lang === "ar";

  const { orders, isLoading, isError, error, refetch } = useOrders();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const statusCounts = useMemo(() => {
    const counts = { ALL: orders.length };
    orders.forEach(o => {
      const s = String(o.status || "pending").toUpperCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const renderText = (textObj) => {
    if (!textObj) return "";
    if (typeof textObj === "string" || typeof textObj === "number") return String(textObj);
    return isAr ? textObj.ar || textObj.en || "" : textObj.en || textObj.ar || "";
  };

  const getStatusTranslation = (status) => {
    const s = String(status).toLowerCase();
    return t(s) || status;
  };

  const getStatusClass = (status) => {
    switch (String(status).toUpperCase()) {
      case "PENDING":
        return "bg-amber-50  text-amber-600  border border-amber-100  px-2.5 py-1 rounded-full text-[10px] font-bold inline-block";
      case "PROCESSING":
        return "bg-orange-50  text-orange-600  border border-orange-100  px-2.5 py-1 rounded-full text-[10px] font-bold inline-block";
      case "SHIPPED":
        return "bg-blue-50  text-blue-600  border border-blue-100  px-2.5 py-1 rounded-full text-[10px] font-bold inline-block";
      case "DELIVERED":
        return "bg-emerald-50  text-emerald-600  border border-emerald-100  px-2.5 py-1 rounded-full text-[10px] font-bold inline-block";
      case "CANCELED":
        return "bg-rose-50  text-rose-600  border border-rose-100  px-2.5 py-1 rounded-full text-[10px] font-bold inline-block";
      default:
        return "bg-gray-50  text-gray-600  border border-gray-100  px-2.5 py-1 rounded-full text-[10px] font-bold inline-block";
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const matchesStatus = statusFilter === "ALL" || String(o.status).toUpperCase() === statusFilter;
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          String(o.id).toLowerCase().includes(q) ||
          renderText(o.customerDetails?.name).toLowerCase().includes(q) ||
          String(o.customerDetails?.phone || "").toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
      });
  }, [orders, statusFilter, search, isAr]);

  return (
    <div className="space-y-5 max-w-6xl mx-auto px-2 pb-12 text-start" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">{t("title")}</h1>
          <p className="mt-1 text-xs text-gray-400 font-bold">
            {t("subtitleOf") 
              .replace("{{shown}}", filteredOrders.length)
              .replace("{{total}}", orders.length)}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")} 
            className="w-full rounded-xl border border-gray-200/60 bg-white py-2.5 ps-9 pe-3 text-xs font-bold text-gray-900 shadow-xs outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/5 transition-all"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <ListFilter size={14} className="text-gray-300 hidden sm:block" />
        {STATUS_FILTERS.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
              statusFilter === st
                ? "bg-green-600 text-white border-green-600 shadow-xs"
                : "bg-white  text-gray-500  border-gray-200/60  hover:bg-gray-50 "
            }`}
          >
            {getStatusTranslation(st)} {statusCounts[st] != null ? `(${statusCounts[st]})` : ""}
          </button>
        ))}
      </div>

      {/* States */}
      {isLoading && (
        <div className="rounded-xl border border-gray-200/60 bg-white p-12 text-center shadow-xs">
          <Loader2 size={28} className="mx-auto mb-3 text-green-500 animate-spin" />
          <p className="font-bold text-xs text-gray-400">{t("loading")}</p>
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-12 text-center shadow-xs">
          <AlertTriangle size={28} className="mx-auto mb-3 text-rose-400" />
          <p className="font-bold text-xs text-rose-500 mb-3">{error || t("retry")}</p>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
          >
            {t("retry")} {/* تم حذف orders. */}
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-gray-200/60 bg-white p-12 text-center shadow-xs">
            <PackageSearch size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="font-bold text-xs text-gray-400">{t("noOrders")}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-xs overflow-hidden divide-y divide-gray-50">
            <AnimatePresence initial={false}>
              {filteredOrders.map((order) => (
                <motion.button
                  key={order.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="flex w-full items-center justify-between gap-3 p-3.5 sm:p-4 text-start transition-colors hover:bg-gray-50/60 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50 font-black text-green-600 text-[10px] border border-gray-100">
                      {renderText(order.id).replace("ORDER-", "#")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                        {renderText(order.customerDetails?.name)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5" dir="ltr">
                        {order.customerDetails?.phone}
                      </p>
                      <p className="text-[9px] text-gray-300 mt-0.5">
                        {order.createdAt &&
                          new Date(order.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`hidden sm:inline-block ${getStatusClass(order.status)}`}>
                      {getStatusTranslation(order.status)}
                    </span>
                    <span className="font-black text-green-600 text-xs sm:text-sm whitespace-nowrap">
                      {renderText(order.totalPrice)} EGP
                    </span>
                    {isAr ? <ChevronLeft size={16} className="text-gray-300" /> : <ChevronRight size={16} className="text-gray-300" />}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )
      )}
    </div>
  );
};

export default OrderLists;
