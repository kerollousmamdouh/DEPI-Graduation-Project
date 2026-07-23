import React, { useEffect, useState, useRef } from "react";
import {
  Save, Phone, MapPin, Clock, Globe, Image as ImageIcon,
  Trash2, Plus, LayoutTemplate, Share2, Upload, X, Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import { useFooter } from "../Hooks/useFooter";
import { useLanguage } from "../context/LanguageContext";

const FooterSettings = () => {
  const { t, lang } = useLanguage();
  const { footer, loading, error, saveFooter } = useFooter();
  
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("identity"); 
  const [imageTab, setImageTab] = useState("file");

  useEffect(() => {
    if (footer) {
      setFormData(footer);
      if (footer.logo2 && footer.logo2.startsWith("http")) {
        setImageTab("url");
      }
    }
  }, [footer]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, logo2: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveFooter(formData);
      toast.success(t("footerUpdatedSuccess") || "تم حفظ إعدادات الفوتر بنجاح!");
    } catch (err) {
      toast.error(err.message || t("errorOccurred"));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[rgb(0,166,62)] border-t-transparent"></div>
        <h2 className="text-sm font-semibold text-gray-500">{t("loadingFooter") || "جاري التحميل..."}</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600 max-w-md mx-auto my-12">
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  const tabs = [
    { id: "identity", icon: <LayoutTemplate size={18} />, label: t("identitySettings") || "الهوية والنبذة" },
    { id: "contact", icon: <Phone size={18} />, label: t("contactSettings") || "التواصل ومواعيد العمل" },
    { id: "locations", icon: <MapPin size={18} />, label: t("locationsSettings") || "الفروع والمواقع" },
    { id: "social", icon: <Share2 size={18} />, label: t("socialSettings") || "التواصل الاجتماعي" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8 px-2 sm:px-4 pb-24">
      
      {/* Header Section - تم تنظيفه تماماً وإزالة زر الـ Reset */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[rgba(0,166,62,0.12)] text-[rgb(0,166,62)]">
            <Globe size={24} />
          </div>
          {t("footerSettingsTitle") || "إعدادات تذييل الموقع"}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          {t("footerSettingsSubtitle") || "إدارة الروابط، الفروع، وأرقام التواصل في الـ Footer."}
        </p>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="flex overflow-x-auto hide-scrollbar rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "bg-[rgb(0,166,62)] text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content Area */}
      <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-8 shadow-sm">
        
        {/* ================= TAB 1: Identity ================= */}
        {activeTab === "identity" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} className="text-[rgb(0,166,62)]" /> {t("logoUrlDark") || "رابط اللوجو (للخلفيات الغامقة)"}
              </label>

              <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200/50 max-w-md">
                <button type="button" onClick={() => setImageTab("file")} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${imageTab === "file" ? "bg-white shadow-sm text-[rgb(0,166,62)]" : "text-gray-400"}`}>
                  <Upload size={14} /> {t("uploadTab") || "رفع ملف"}
                </button>
                <button type="button" onClick={() => setImageTab("url")} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${imageTab === "url" ? "bg-white shadow-sm text-[rgb(0,166,62)]" : "text-gray-400"}`}>
                  <LinkIcon size={14} /> {t("urlTab") || "رابط URL"}
                </button>
              </div>

              {imageTab === "file" ? (
                <div className="max-w-md">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-[rgb(0,166,62)] bg-gray-50/50 rounded-2xl py-6 transition-all cursor-pointer">
                    <Upload className="text-gray-400" size={24} />
                    <span className="text-xs font-semibold text-gray-600">{t("clickToUploadIcon") || "اضغط هنا لرفع اللوجو"}</span>
                  </button>
                </div>
              ) : (
                <div className="max-w-md">
                  <input
                    type="text"
                    value={formData.logo2}
                    onChange={(e) => setFormData({ ...formData, logo2: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-green-500/10 transition-all"
                  />
                </div>
              )}

              {formData.logo2 && (
                <div className="relative mt-3 rounded-2xl bg-[#0b1120] p-4 w-max inline-block border border-gray-800 shadow-sm">
                  <img src={formData.logo2} alt="Logo Preview" className="h-16 object-contain" />
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, logo2: "" }))}
                    className="absolute -top-2 -end-2 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer shadow-md"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t("aboutAr") || "النبذة (عربي)"}</label>
                <textarea
                  rows={4}
                  value={formData.aboutAr}
                  onChange={(e) => setFormData({ ...formData, aboutAr: e.target.value })}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[rgb(0,166,62)] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t("aboutEn") || "النبذة (إنجليزي)"}</label>
                <textarea
                  rows={4}
                  value={formData.aboutEn}
                  onChange={(e) => setFormData({ ...formData, aboutEn: e.target.value })}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[rgb(0,166,62)] transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: Contact & Working Hours ================= */}
        {activeTab === "contact" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-4 border-b border-gray-100 pb-8">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-[rgb(0,166,62)]" /> {t("workingHours") || "مواعيد العمل (نصي)"}
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">{t("workingHoursAr") || "عربي"}</label>
                  <input
                    type="text"
                    value={formData.workingHoursAr}
                    onChange={(e) => setFormData({ ...formData, workingHoursAr: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[rgb(0,166,62)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">{t("workingHoursEn") || "English"}</label>
                  <input
                    type="text"
                    value={formData.workingHoursEn}
                    onChange={(e) => setFormData({ ...formData, workingHoursEn: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[rgb(0,166,62)]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Phone size={18} className="text-[rgb(0,166,62)]" /> {t("phoneNumbers") || "أرقام الهواتف"}
                </h3>
                <button
                  onClick={() => setFormData({ ...formData, phones: [...formData.phones, ""] })}
                  className="flex items-center gap-1 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-[rgb(0,166,62)] hover:bg-green-100 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> {t("addPhone") || "إضافة رقم"}
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(formData.phones || []).map((phone, idx) => (
                  <div key={idx} className="relative flex items-center">
                    <input
                      type="text"
                      value={phone}
                      dir="ltr"
                      onChange={(e) => {
                        const newPhones = [...formData.phones];
                        newPhones[idx] = e.target.value;
                        setFormData({ ...formData, phones: newPhones });
                      }}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-left outline-none focus:border-[rgb(0,166,62)] pe-12"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, phones: formData.phones.filter((_, i) => i !== idx) })}
                      className="absolute end-2 p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: Locations ================= */}
        {activeTab === "locations" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <MapPin size={18} className="text-[rgb(0,166,62)]" /> {t("branches") || "الفروع والمواقع"}
              </h3>
              <button
                onClick={() => setFormData({ ...formData, locations: [...formData.locations, { id: Date.now(), nameAr: "", nameEn: "", url: "" }] })}
                className="flex items-center gap-1 rounded-xl bg-[rgb(0,166,62)] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[rgb(0,145,55)] transition-colors shadow-lg cursor-pointer"
              >
                <Plus size={16} /> {t("addBranch") || "إضافة فرع"}
              </button>
            </div>

            {(formData.locations || []).length === 0 ? (
               <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm font-bold">
                 {t("noBranchesAdded") || "لا توجد فروع مضافة."}
               </div>
            ) : (
              (formData.locations || []).map((loc, idx) => (
                <div key={loc.id} className="relative rounded-2xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5">
                  <button
                    onClick={() => setFormData({ ...formData, locations: formData.locations.filter((_, i) => i !== idx) })}
                    className="absolute top-4 end-4 p-2 text-rose-500 bg-white shadow-sm hover:bg-rose-500 hover:text-white rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="grid gap-4 sm:grid-cols-2 pe-10 sm:pe-0 mt-6 sm:mt-0">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">{t("branchNameAr") || "اسم الفرع (عربي)"}</label>
                      <input value={loc.nameAr} onChange={(e) => { const newLocs = [...formData.locations]; newLocs[idx].nameAr = e.target.value; setFormData({ ...formData, locations: newLocs }); }} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[rgb(0,166,62)]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">{t("branchNameEn") || "اسم الفرع (English)"}</label>
                      <input value={loc.nameEn} onChange={(e) => { const newLocs = [...formData.locations]; newLocs[idx].nameEn = e.target.value; setFormData({ ...formData, locations: newLocs }); }} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[rgb(0,166,62)]" />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500">{t("googleMapsLink") || "رابط خريطة جوجل"}</label>
                      <input value={loc.url} dir="ltr" onChange={(e) => { const newLocs = [...formData.locations]; newLocs[idx].url = e.target.value; setFormData({ ...formData, locations: newLocs }); }} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[rgb(0,166,62)]" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= TAB 4: Social Media ================= */}
        {activeTab === "social" && (
          <div className="space-y-5 animate-in fade-in duration-300">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Share2 size={18} className="text-[rgb(0,166,62)]" /> {t("socialLinks") || "منصات السوشيال ميديا"}
              </h3>
              <button
                onClick={() => setFormData({ ...formData, socialLinks: [...formData.socialLinks, { id: Date.now(), icon: "facebook", name: "Facebook", url: "" }] })}
                className="flex items-center gap-1 rounded-xl bg-[rgb(0,166,62)] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[rgb(0,145,55)] transition-colors shadow-lg cursor-pointer"
              >
                <Plus size={16} /> {t("addSocialLink") || "إضافة منصة"}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(formData.socialLinks || []).map((link, idx) => (
                <div key={link.id} className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-gray-200 bg-gray-50/50 p-2">
                  <select
                    value={link.icon}
                    onChange={(e) => {
                      const newLinks = [...formData.socialLinks];
                      newLinks[idx].icon = e.target.value;
                      newLinks[idx].name = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
                      setFormData({ ...formData, socialLinks: newLinks });
                    }}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold outline-none sm:w-1/3"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="snapchat">Snapchat</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">X (Twitter)</option>
                    <option value="telegram">Telegram</option>
                  </select>
                  
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={link.url}
                      placeholder="URL..."
                      dir="ltr"
                      onChange={(e) => {
                        const newLinks = [...formData.socialLinks];
                        newLinks[idx].url = e.target.value;
                        setFormData({ ...formData, socialLinks: newLinks });
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[rgb(0,166,62)]"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, socialLinks: formData.socialLinks.filter((_, i) => i !== idx) })}
                      className="shrink-0 p-3 text-rose-500 bg-white border border-gray-200 hover:bg-rose-500 hover:border-rose-500 hover:text-white rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-4 start-4 end-4 sm:start-auto sm:w-auto z-40 bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-gray-200 shadow-2xl flex justify-center sm:justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[rgb(0,166,62)] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-[rgb(0,145,55)] disabled:opacity-70 disabled:scale-100 active:scale-95 cursor-pointer"
        >
          <Save size={18} className={saving ? "animate-pulse" : ""} />
          {saving ? (t("saving") || "جاري الحفظ...") : (t("saveChanges") || "حفظ التعديلات")}
        </button>
      </div>

    </div>
  );
};

export default FooterSettings;