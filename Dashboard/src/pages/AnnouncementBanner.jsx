import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
// 1. استيراد السيرفيس الخاصة بالإعلانات (هنعمل الملف ده في خطوة 2)
import { announcementService } from "../services/announcementService";
import { Megaphone, Clock, Trash2, Send, AlertTriangle, Radio, Loader2 } from "lucide-react";

const DEFAULT_COLORS = {
  bgColor: "#064e3b",
  textColor: "#f0fdf4",
  titleColor: "#34d399",
};

const AnnouncementBanner = () => {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  // 2. تعريف حالات البيانات محلياً بدل الـ Context
  const [announcement, setAnnouncement] = useState(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const [form, setForm] = useState({
    text: "",
    titleAr: "",
    titleEn: "",
    durationValue: "1",
    durationUnit: "h",
    ...DEFAULT_COLORS,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [toast, setToast] = useState({ text: "", isError: false });
  const [now, setNow] = useState(Date.now());

  // 3. دالة جلب الإعلان الحالي من السيرفر عند فتح الصفحة
  const fetchCurrentAnnouncement = async () => {
    try {
      setIsLoadingPage(true);
      const response = await announcementService.getCurrentAnnouncement();
      const data = response?.data || response;
      if (data && data.id) {
        const createdAtTime = new Date(data.start_at).getTime();
        const expiresTime = new Date(data.expires_at).getTime();
        setAnnouncement({
          id: data.id,
          text: data.message_ar || data.text || "",
          titleAr: data.title_ar || data.titleAr || "",
          titleEn: data.title_en || data.titleEn || "",
          createdAt: createdAtTime,
          totalDurationMs: expiresTime - createdAtTime,
          bgColor: data.bg_color || data.bgColor || "#064e3b",
          textColor: data.text_color || data.textColor || "#f0fdf4",
          titleColor: data.title_color || data.titleColor || "#34d399",
        });
      }
    } catch (err) {
      console.error("Failed to fetch announcement:", err);
    } finally {
      setIsLoadingPage(false);
    }
  };

  useEffect(() => {
    fetchCurrentAnnouncement();
  }, []);

  // عداد الوقت المتبقي للتنويه الحالي
  useEffect(() => {
    if (!announcement) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [announcement]);

  const remainingMs = useMemo(() => {
    if (!announcement) return 0;
    // التأكد من أن التواريخ القادمة من الباك إند تتحول لأرقام بشكل صحيح
    const createdAtTime = new Date(announcement.createdAt).getTime();
    return Math.max(0, announcement.totalDurationMs - (now - createdAtTime));
  }, [announcement, now]);

  const formatRemaining = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const showToast = (text, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast({ text: "", isError: false }), 4000);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 4. دالة النشر عبر السيرفيس
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) {
      showToast(t("pleaseEnterAnnouncementText"), true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await announcementService.publishAnnouncement({
        text: form.text.trim(),
        titleAr: form.titleAr.trim() || undefined,
        titleEn: form.titleEn.trim() || undefined,
        durationValue: form.durationValue,
        durationUnit: form.durationUnit,
        colors: {
          bgColor: form.bgColor,
          textColor: form.textColor,
          titleColor: form.titleColor,
        }
      });
      
      showToast(t("announcementPublished"), false);
      // إعادة جلب البيانات لتحديث القسم العلوي بالإعلان الجديد
      fetchCurrentAnnouncement(); 
    } catch (err) {
      showToast(err?.message || t("announcementPublishFailed"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. دالة الحذف عبر السيرفيس
  const handleClear = async () => {
    setConfirmClearOpen(false);
    setIsClearing(true);
    try {
      await announcementService.clearAnnouncement();
      showToast(t("announcementCleared"), false);
      setAnnouncement(null); // مسحه من الشاشة فوراً
    } catch (err) {
      showToast(err?.message || t("errorOccurred"), true);
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoadingPage) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto px-2 pb-12 text-start" dir={isAr ? "rtl" : "ltr"}>
      {/* Toast */}
      <AnimatePresence>
        {toast.text && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-xl border p-3 text-xs font-bold shadow-xs ${
              toast.isError ? "bg-rose-50 border-rose-100 text-rose-600   " : "bg-green-50 border-green-100 text-green-600   "
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
          <Megaphone size={22} className="text-green-600" />
          {t("announcementBanner")}
        </h1>
        <p className="mt-1 text-xs text-gray-400 font-bold">{t("announcementBannerSubtitle")}</p>
      </div>

      {/* Current announcement */}
      <div className="rounded-xl border border-gray-200/60 bg-white p-4 shadow-xs">
        <h2 className="mb-3.5 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2.5">
          {t("currentAnnouncement")}
        </h2>

        {!announcement ? (
          <div className="py-8 text-center">
            <Radio size={28} className="mx-auto mb-3 text-gray-200" />
            <p className="font-bold text-xs text-gray-400">{t("noActiveAnnouncement")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="rounded-xl p-4 text-center shadow-inner"
              style={{ backgroundColor: announcement.bgColor || announcement.colors?.bgColor, color: announcement.textColor || announcement.colors?.textColor }}
            >
              <p className="text-xs font-black mb-1" style={{ color: announcement.titleColor || announcement.colors?.titleColor }}>
                {isAr ? announcement.titleAr : announcement.titleEn}
              </p>
              <p className="text-sm font-bold">{announcement.text}</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <Clock size={14} className="text-amber-500" />
                {t("timeRemaining")}:
                <span className="font-black text-gray-900" dir="ltr">{formatRemaining(remainingMs)}</span>
              </div>
              <button
                onClick={() => setConfirmClearOpen(true)}
                disabled={isClearing}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-100 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 size={14} />
                {t("clearAnnouncementBtn")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Publish new announcement */}
      <form
        onSubmit={handlePublish}
        className="rounded-xl border border-gray-200/60 bg-white p-4 shadow-xs space-y-4"
      >
        <h2 className="text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2.5">
          {t("publishNewAnnouncement")}
        </h2>

        {/* Message */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">{t("announcementTextLabel")}</label>
          <textarea
            rows={3}
            value={form.text}
            onChange={(e) => handleChange("text", e.target.value)}
            placeholder={t("announcementTextPlaceholder")}
            className="w-full rounded-xl border border-gray-200/60 bg-white p-3 text-xs font-bold text-gray-900 shadow-xs outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/5 transition-all resize-none"
          />
        </div>

        {/* Titles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">{t("titleArLabel")}</label>
            <input
              type="text"
              value={form.titleAr}
              onChange={(e) => handleChange("titleAr", e.target.value)}
              placeholder={t("titleArPlaceholder")}
              className="w-full rounded-xl border border-gray-200/60 bg-white p-2.5 text-xs font-bold text-gray-900 shadow-xs outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/5 transition-all"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">{t("titleEnLabel")}</label>
            <input
              type="text"
              value={form.titleEn}
              onChange={(e) => handleChange("titleEn", e.target.value)}
              placeholder={t("titleEnPlaceholder")}
              className="w-full rounded-xl border border-gray-200/60 bg-white p-2.5 text-xs font-bold text-gray-900 shadow-xs outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/5 transition-all"
              dir="ltr"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">{t("duration")}</label>
            <input
              type="number"
              min="1"
              value={form.durationValue}
              onChange={(e) => handleChange("durationValue", e.target.value)}
              placeholder={t("durationValuePlaceholder")}
              className="w-full rounded-xl border border-gray-200/60 bg-white p-2.5 text-xs font-bold text-gray-900 shadow-xs outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/5 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">{t("durationUnit")}</label>
            <select
              value={form.durationUnit}
              onChange={(e) => handleChange("durationUnit", e.target.value)}
              className="w-full rounded-xl border border-gray-200/60 bg-white p-2.5 text-xs font-bold text-gray-900 shadow-xs outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/5 transition-all"
            >
              <option value="h" className="">{t("hoursUnit")}</option>
              <option value="m" className="">{t("minutesUnit")}</option>
              <option value="s" className="">{t("secondsUnit")}</option>
            </select>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">{t("bgColorLabel")}</label>
            <input
              type="color"
              value={form.bgColor}
              onChange={(e) => handleChange("bgColor", e.target.value)}
              className="w-full h-10 rounded-xl border border-gray-200/60 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">{t("textColorLabel")}</label>
            <input
              type="color"
              value={form.textColor}
              onChange={(e) => handleChange("textColor", e.target.value)}
              className="w-full h-10 rounded-xl border border-gray-200/60 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">{t("titleColorLabel")}</label>
            <input
              type="color"
              value={form.titleColor}
              onChange={(e) => handleChange("titleColor", e.target.value)}
              className="w-full h-10 rounded-xl border border-gray-200/60 cursor-pointer"
            />
          </div>
        </div>

        {/* Live preview */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">{t("livePreview")}</label>
          <div
            className="rounded-xl p-4 text-center shadow-inner"
            style={{ backgroundColor: form.bgColor, color: form.textColor }}
          >
            <p className="text-xs font-black mb-1" style={{ color: form.titleColor }}>
              {isAr ? form.titleAr || t("titleArPlaceholder") : form.titleEn || t("titleEnPlaceholder")}
            </p>
            <p className="text-sm font-bold">{form.text || t("announcementTextPlaceholder")}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-green-700 disabled:opacity-50 cursor-pointer"
        >
          <Send size={15} />
          {t("publishBtn")}
        </button>
      </form>

      {/* Confirm clear modal */}
      <AnimatePresence>
        {confirmClearOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setConfirmClearOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-rose-500" />
                <h4 className="text-sm font-black text-gray-900">{t("confirmClearTitle")}</h4>
              </div>
              <p className="text-xs text-gray-500 mb-5">{t("confirmClearMsg")}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  {t("clearAnnouncementBtn")}
                </button>
                <button
                  onClick={() => setConfirmClearOpen(false)}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {t("cancel")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementBanner;