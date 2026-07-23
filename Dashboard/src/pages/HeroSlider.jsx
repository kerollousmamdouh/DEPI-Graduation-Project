import React, { useMemo, useState, useRef } from "react";
import { 
  Upload, Link as LinkIcon, Check, Search, Plus, Trash2, Edit2, 
  Eye, EyeOff, SlidersHorizontal, Image as ImageIcon, RefreshCw, X, ChevronDown, ChevronUp
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useHeroSlider } from "../Hooks/useHeroSlider";
import { uploadService } from "../services/uploadService";

const HeroSliderManager = () => {
  const { t, lang } = useLanguage(); 
  const fileInputRef = useRef(null);

  const {
    slides,
    categories,
    loading,
    error,
    addSlide,
    updateSlide,
    deleteSlide,
    toggleStatus,
    changePriority,
  } = useHeroSlider();

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [deleteSlideId, setDeleteSlideId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isCatFormDropdownOpen, setIsCatFormDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [imageTab, setImageTab] = useState("file");
  const [submitError, setSubmitError] = useState(null);

  const emptyForm = { titleAr: "", titleEn: "", subtitleAr: "", subtitleEn: "", buttonTextAr: "", buttonTextEn: "", image: "", imageFile: null, categoryId: "" };
  const [formData, setFormData] = useState(emptyForm);

  // Statistics
  const totalSlides = slides.length;
  const activeSlides = slides.filter((s) => s.status === "Active").length;
  const hiddenSlides = slides.filter((s) => s.status === "Hidden").length;

  const activeCategoriesOnly = useMemo(() => {
    // Use API data only - no localStorage fallback
    return categories.filter(cat => cat.status !== "Hidden" && cat.is_active !== false);
  }, [categories]);
  
  // الـ useMemo للترجمة والـ Priority والـ Search
  const filteredSlides = useMemo(() => {
    const isSystemAr = String(lang || "").toLowerCase().startsWith("ar");

    let data = slides.map(slide => {
      const tAr = slide.titleAr || slide.title_ar || slide.title || "";
      const tEn = slide.titleEn || slide.title_en || slide.title || "";
      const subAr = slide.subtitleAr || slide.subtitle_ar || slide.subtitle || "";
      const subEn = slide.subtitleEn || slide.subtitle_en || slide.subtitle || "";
      const btnAr = slide.buttonTextAr || slide.buttonText || "";
      const btnEn = slide.buttonTextEn || slide.buttonText || "";

      return {
        ...slide,
        displayTitle: isSystemAr ? (tAr.trim() !== "" ? tAr : tEn) : (tEn.trim() !== "" ? tEn : tAr),
        displaySubtitle: isSystemAr ? (subAr.trim() !== "" ? subAr : subEn) : (subEn.trim() !== "" ? subEn : subAr),
        displayBtnText: isSystemAr ? (btnAr.trim() !== "" ? btnAr : btnEn) : (btnEn.trim() !== "" ? btnEn : btnAr)
      };
    });

    if (categoryFilter !== "all") {
      data = data.filter((s) => String(s.categoryId) === String(categoryFilter));
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      data = data.filter((s) => 
        s.displayTitle.toLowerCase().includes(query) || 
        s.displaySubtitle.toLowerCase().includes(query)
      );
    }

    return data.sort((a, b) => a.priority - b.priority);
  }, [slides, search, categoryFilter, lang]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image: preview, imageFile: file }));
    }
  };

  const openAddModal = () => {
    setSelectedSlide(null);
    setSubmitError(null);
    setFormData({ ...emptyForm, imageFile: null });
    setImageTab("file");
    setIsModalOpen(true);
  };

  const openEditModal = (slide) => {
    setSelectedSlide(slide);
    setSubmitError(null);
    setFormData({
      titleAr: slide.titleAr || slide.title_ar || slide.title || "",
      titleEn: slide.titleEn || slide.title_en || slide.title || "",
      subtitleAr: slide.subtitleAr || slide.subtitle_ar || slide.subtitle || "",
      subtitleEn: slide.subtitleEn || slide.subtitle_en || slide.subtitle || "",
      buttonTextAr: slide.buttonTextAr || slide.buttonText || "",
      buttonTextEn: slide.buttonTextEn || slide.buttonText || "",
      image: slide.image || "",
      categoryId: slide.categoryId || "",
    });
    setImageTab(slide.image && slide.image.startsWith("http") ? "url" : "file");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if ((!formData.titleAr.trim() && !formData.titleEn.trim()) || !formData.image || !formData.categoryId) {
      setSubmitError(t("pleaseFillRequiredFields") || "يرجى ملء الحقول المطلوبة والصورة والقسم");
      return;
    }

    const category = categories.find((c) => Number(c.id) === Number(formData.categoryId));

    try {
      setSubmitError(null);

      let imageUrl = formData.image;
      if (formData.imageFile) {
        const uploaded = await uploadService.uploadImage(formData.imageFile);
        imageUrl = uploaded.url || uploaded.imageUrl || imageUrl;
      }

      const payload = {
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        title_ar: formData.titleAr,
        title_en: formData.titleEn,
        subtitleAr: formData.subtitleAr,
        subtitleEn: formData.subtitleEn,
        subtitle_ar: formData.subtitleAr,
        subtitle_en: formData.subtitleEn,
        buttonTextAr: formData.buttonTextAr,
        buttonTextEn: formData.buttonTextEn,
        button_text_ar: formData.buttonTextAr,
        button_text_en: formData.buttonTextEn,
        image: imageUrl,
        image_url: imageUrl,
        categoryId: Number(formData.categoryId),
        category_id: Number(formData.categoryId),
        categoryName: category?.name || "",
        buttonLink: `/category/${formData.categoryId}`, 
      };

      if (selectedSlide) {
        await updateSlide(selectedSlide.id, payload);
      } else {
        await addSlide(payload);
      }
      setFormData(emptyForm);
      setSelectedSlide(null);
      setIsModalOpen(false);
    } catch (err) {
      setSubmitError(err.message || t("errorOccurred"));
    }
  };

  const handleDelete = async () => {
    if (!deleteSlideId) return;
    await deleteSlide(deleteSlideId);
    setDeleteSlideId(null);
  };

  const handleStatus = async (slide) => {
    await toggleStatus(slide.id, slide.status === "Active" ? "Hidden" : "Active");
  };

  const handlePriority = async (slide, direction) => {
    const priority = direction === "up" ? slide.priority - 1 : slide.priority + 1;
    if (priority < 1 || priority > slides.length) return;
    await changePriority(slide.id, priority);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-[rgb(0,166,62)]" size={40} />
        <h2 className="text-sm font-semibold text-gray-500">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-1.5 sm:px-4 overflow-x-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[rgba(0,166,62,0.12)] text-[rgb(0,166,62)]">
              <ImageIcon size={24} />
            </div>
            {t("heroSlider")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {t("heroSliderManager") || "إدارة سلايدر بوابات الرئيسية للعروض"}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[rgb(0,166,62)] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-600/20 hover:bg-[rgb(0,145,55)] transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <Plus size={18} />
          <span>{t("addNewSlide")}</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-2 sm:gap-5 grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-2 sm:p-6 shadow-sm">
          <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider line-clamp-1">{t("totalSlides") || "إجمالي السلايدات"}</p>
          <h2 className="mt-1 text-sm sm:text-3xl font-black text-gray-900">{totalSlides}</h2>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-2 sm:p-6 shadow-sm">
          <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider line-clamp-1">{t("activeSlides") || "السلايدات النشطة"}</p>
          <h2 className="mt-1 text-sm sm:text-3xl font-black text-[rgb(0,166,62)]">{activeSlides}</h2>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-2 sm:p-6 shadow-sm">
          <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider line-clamp-1">{t("hiddenSlides") || "السلايدات المخفية"}</p>
          <h2 className="mt-1 text-sm sm:text-3xl font-black text-rose-500">{hiddenSlides}</h2>
        </div>
      </div>

      {/* Search & Custom Category Dropdown */}
      <div className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchSlidesPlaceholder") || "ابحث عن السلايدر..."}
            className="w-full rounded-2xl border border-gray-200 bg-white ps-10 pe-4 py-2.5 text-xs sm:text-sm outline-none transition-all duration-300 focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-green-500/10"
          />
        </div>

        {/* الـ Custom Category Filter Dropdown - شكل مودرن واحترافي */}
        <div className="relative min-w-[180px]">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-gray-700 hover:border-[rgb(0,166,62)] transition-all duration-300 shadow-sm focus:ring-4 focus:ring-green-500/5 cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <SlidersHorizontal size={15} className="text-[rgb(0,166,62)] shrink-0" />
              <span className="truncate">
                {categoryFilter === "all" ? t("allCategories") : activeCategoriesOnly.find(c => String(c.id) === String(categoryFilter))?.name || t("allCategories")}
              </span>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isFilterDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsFilterDropdownOpen(false)} />
              <div className="absolute start-0 mt-2 z-20 w-full min-w-[210px] rounded-2xl border border-gray-100 bg-white p-1.5 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto backdrop-blur-md">
                <button
                  onClick={() => { setCategoryFilter("all"); setIsFilterDropdownOpen(false); }}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    {t("allCategories")}
                  </span>
                  {categoryFilter === "all" && <Check size={16} className="text-[rgb(0,166,62)]" />}
                </button>
                {activeCategoriesOnly.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategoryFilter(cat.id); setIsFilterDropdownOpen(false); }}
                    className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    {String(categoryFilter) === String(cat.id) && <Check size={16} className="text-[rgb(0,166,62)]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hero Slides Grid */}
      {filteredSlides.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
          <p className="text-sm font-medium">{t("noSlidesFound")}</p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredSlides.map((slide) => (
            <div
              key={slide.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between"
            >
              {/* Banner Image */}
              <div className="relative h-20 sm:h-36 md:h-44 w-full overflow-hidden bg-gray-100">
                <img src={slide.image} alt={slide.displayTitle} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-70" />

                <span
                  className={`absolute top-1.5 end-1.5 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[8px] sm:text-xs font-extrabold text-white border border-white/10 ${
                    slide.status === "Active" ? "bg-[rgb(0,166,62)]/80" : "bg-rose-500/80"
                  }`}
                >
                  {slide.status === "Active" ? t("activeStatus") : t("disabledStatus")}
                </span>
              </div>

              {/* Content Card */}
              <div className="p-2 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4">
                <div>
                  <h3 className="text-[11px] sm:text-base font-black text-gray-900 line-clamp-1">{slide.displayTitle}</h3>
                  <p className="text-[9px] sm:text-xs text-gray-400 line-clamp-1 mt-0.5">{slide.displaySubtitle}</p>
                </div>

                {/* Priority Arrows */}
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-1 sm:p-2 text-[9px] sm:text-xs">
                  <span className="text-gray-400 font-bold">{t("priority") || "ترتيب"}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handlePriority(slide, "up")} disabled={slide.priority === 1} className="p-0.5 border border-gray-200 hover:bg-green-50 rounded-full disabled:opacity-30"><ChevronUp size={12} /></button>
                    <span className="font-bold px-0.5">{slide.priority}</span>
                    <button onClick={() => handlePriority(slide, "down")} disabled={slide.priority === slides.length} className="p-0.5 border border-gray-200 hover:bg-green-50 rounded-full disabled:opacity-30"><ChevronDown size={12} /></button>
                  </div>
                </div>

                {/* Actions Buttons */}
                <div className="flex gap-1 text-[10px] sm:text-xs font-bold w-full">
                  <button
                    onClick={() => handleStatus(slide)}
                    className="flex-1 rounded-xl bg-[rgb(0,166,62)] hover:bg-[rgb(0,145,55)] py-2 text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center min-h-[32px]"
                  >
                    <span className="hidden xs:inline">{slide.status === "Active" ? t("hide") : t("show")}</span>
                    <span className="xs:hidden">{slide.status === "Active" ? <EyeOff size={13} /> : <Eye size={13} />}</span>
                  </button>

                  <button
                    onClick={() => openEditModal(slide)}
                    className="rounded-xl bg-blue-500 hover:bg-blue-600 px-2 sm:px-4 py-2 text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center min-h-[32px]"
                  >
                    <span className="hidden xs:inline">{t("update")}</span>
                    <span className="xs:hidden"><Edit2 size={13} /></span>
                  </button>

                  <button
                    onClick={() => setDeleteSlideId(slide.id)}
                    className="rounded-xl bg-red-500 hover:bg-red-600 px-2 sm:px-4 py-2 text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center min-h-[32px]"
                  >
                    <span className="hidden xs:inline">{t("delete")}</span>
                    <span className="xs:hidden"><Trash2 size={13} /></span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[95vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-8 shadow-2xl">
            
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-gray-900">
                  {selectedSlide ? t("editSlide") || "تعديل السلايد" : t("addNewSlide")}
                </h2>
                <p className="mt-0.5 text-[11px] text-gray-500">{t("modalSubtitle")}</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setSelectedSlide(null); setFormData(emptyForm); }} className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100">✕</button>
            </div>

            {submitError && (
              <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600 border border-rose-100">{submitError}</div>
            )}

            <div className="space-y-4">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t("slideTitle") + " (عربي)"}</label>
                  <input value={formData.titleAr} onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[rgb(0,166,62)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t("slideTitle") + " (English)"}</label>
                  <input value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[rgb(0,166,62)]" />
                </div>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t("slideSubtitle") + " (عربي)"}</label>
                  <input value={formData.subtitleAr} onChange={(e) => setFormData({ ...formData, subtitleAr: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[rgb(0,166,62)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t("slideSubtitle") + " (English)"}</label>
                  <input value={formData.subtitleEn} onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[rgb(0,166,62)]" />
                </div>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t("slideButtonText") + " (عربي)"}</label>
                  <input value={formData.buttonTextAr} onChange={(e) => setFormData({ ...formData, buttonTextAr: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[rgb(0,166,62)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">{t("slideButtonText") + " (English)"}</label>
                  <input value={formData.buttonTextEn} onChange={(e) => setFormData({ ...formData, buttonTextEn: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[rgb(0,166,62)]" />
                </div>
              </div>

              {/* Image Handler Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">{t("categoryIcon") || "صورة البنر"}</label>
                <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200/50">
                  <button type="button" onClick={() => setImageTab("file")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${imageTab === "file" ? "bg-white shadow-sm text-[rgb(0,166,62)]" : "text-gray-400"}`}>{t("uploadTab")}</button>
                  <button type="button" onClick={() => setImageTab("url")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${imageTab === "url" ? "bg-white shadow-sm text-[rgb(0,166,62)]" : "text-gray-400"}`}>{t("urlTab")}</button>
                </div>

                {imageTab === "file" ? (
                  <div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 hover:border-[rgb(0,166,62)] bg-gray-50/50 rounded-2xl py-4 transition-all cursor-pointer">
                      <Upload className="text-gray-400" size={18} />
                      <span className="text-[11px] font-semibold text-gray-600">{t("clickToUploadIcon")}</span>
                    </button>
                  </div>
                ) : (
                  <input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[rgb(0,166,62)]" />
                )}

                {formData.image && (
                  <div className="relative overflow-hidden rounded-2xl border h-28 mt-2"><img src={formData.image} alt="Preview" className="h-full w-full object-cover" /><button type="button" onClick={() => setFormData((p) => ({ ...p, image: "" }))} className="absolute top-1.5 end-1.5 p-1 bg-black/60 text-white rounded-full"><X size={12} /></button></div>
                )}
              </div>

              {/* 🌟 تم استبدال الـ <select> القديم بـ الـ Custom Dropdown المودرن والاحترافي بالملي */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-gray-700 block">{t("selectCategory")}</label>
                <button
                  type="button"
                  onClick={() => setIsCatFormDropdownOpen(!isCatFormDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-gray-700 hover:border-[rgb(0,166,62)] transition-all duration-300 cursor-pointer shadow-sm focus:ring-4 focus:ring-green-500/5"
                >
                  <span className="truncate">
                    {formData.categoryId ? activeCategoriesOnly.find(c => Number(c.id) === Number(formData.categoryId))?.name : t("selectCategory")}
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isCatFormDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isCatFormDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsCatFormDropdownOpen(false)} />
                    <div className="absolute start-0 end-0 mt-1.5 z-20 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-2xl max-h-44 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-md">
                      {activeCategoriesOnly.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => { setFormData({ ...formData, categoryId: cat.id }); setIsCatFormDropdownOpen(false); }}
                          className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <span className="truncate">{cat.name}</span>
                          {Number(formData.categoryId) === Number(cat.id) && <Check size={16} className="text-[rgb(0,166,62)]" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-2.5 pt-3.5 border-t border-gray-100">
              <button onClick={() => { setIsModalOpen(false); setSelectedSlide(null); setFormData(emptyForm); }} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 cursor-pointer">{t("cancel")}</button>
              <button onClick={handleSave} className="rounded-xl bg-[rgb(0,166,62)] hover:bg-[rgb(0,145,55)] px-4 py-2 text-xs font-bold text-white shadow-lg cursor-pointer">{selectedSlide ? t("update") : t("save")}</button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteSlideId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl text-center">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-2.5"><Trash2 size={20} /></div>
            <h2 className="text-base font-black text-gray-900">{t("deleteConfirmTitle")}</h2>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">{t("deleteConfirmMsg")}</p>
            
            <div className="mt-5 flex justify-center gap-2.5">
              <button onClick={() => setDeleteSlideId(null)} className="flex-1 rounded-xl border border-gray-200 py-2 text-xs font-bold text-gray-500 cursor-pointer">{t("cancel")}</button>
              <button onClick={handleDelete} className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 py-2 text-xs font-bold text-white shadow-lg cursor-pointer">{t("deleteNow")}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HeroSliderManager;