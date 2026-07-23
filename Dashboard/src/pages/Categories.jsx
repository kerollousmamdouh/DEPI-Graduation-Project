import React, { useMemo, useState, useRef } from "react";
import { 
  Upload, Link as LinkIcon, Check, Search, Plus, Trash2, Edit2, 
  Eye, EyeOff, SlidersHorizontal, Layers, RefreshCw, X, Scale, Boxes, ChevronDown
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCategories } from "../Hooks/useCategories";
import { uploadService } from "../services/uploadService";
import HasPermission from "../components/HasPermission";

const Categories = () => {
  const { t, lang } = useLanguage(); 
  const fileInputRef = useRef(null);

  const {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleStatus,
  } = useCategories();

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [imageTab, setImageTab] = useState("file");
  const [submitError, setSubmitError] = useState(null);

  const emptyForm = { nameAr: "", nameEn: "", image: "", imageFile: null, unitType: "weight" };
  const [formData, setFormData] = useState(emptyForm);

  // Statistics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((cat) => cat.status === "Active").length;
  const hiddenCategories = categories.filter((cat) => cat.status === "Hidden").length;

  // الـ useMemo المُدار بالكامل
  const filteredCategories = useMemo(() => {
    const isSystemAr = String(lang || "").toLowerCase().startsWith("ar");

    let data = categories.map(cat => {
      const arName = cat.nameAr || cat.name_ar || "";
      const enName = cat.nameEn || cat.name_en || cat.name || "";
      
      return {
        ...cat,
        displayName: isSystemAr ? (arName.trim() !== "" ? arName : enName) : (enName.trim() !== "" ? enName : arName)
      };
    });

    if (statusFilter !== "all") {
      data = data.filter((cat) => cat.status === statusFilter);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      data = data.filter((cat) => {
        const displayMatch = cat.displayName.toLowerCase().includes(query);
        const arMatch = (cat.nameAr || cat.name_ar || "").toLowerCase().includes(query);
        const enMatch = (cat.nameEn || cat.name_en || cat.name || "").toLowerCase().includes(query);
        return displayMatch || arMatch || enMatch;
      });
    }

    return data;
  }, [categories, search, statusFilter, lang]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image: preview, imageFile: file }));
    }
  };

  const openAddModal = () => {
    setSelectedCategory(null);
    setSubmitError(null);
    setFormData({ ...emptyForm, imageFile: null });
    setImageTab("file");
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setSubmitError(null);
    setFormData({
      nameAr: category.nameAr || category.name_ar || "",
      nameEn: category.nameEn || category.name_en || category.name || "",
      image: category.image || "",
      unitType: category.unitType || category.unit_type || "weight",
    });
    setImageTab(category.image && category.image.startsWith("http") ? "url" : "file");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nameAr.trim() && !formData.nameEn.trim()) {
      setSubmitError(t("pleaseEnterAtLeastOneName") || "يرجى كتابة اسم واحد على الأقل");
      return;
    }

    try {
      setSubmitError(null);

      let imageUrl = formData.image.trim() || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500";
      if (formData.imageFile) {
        const uploaded = await uploadService.uploadImage(formData.imageFile);
        imageUrl = uploaded.url || uploaded.imageUrl || imageUrl;
      }

      const payload = {
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim(),
        name_ar: formData.nameAr.trim(),
        name_en: formData.nameEn.trim(),
        name: formData.nameAr.trim() || formData.nameEn.trim(),
        unitType: formData.unitType,
        unit_type: formData.unitType,
        image: imageUrl,
      };

      if (selectedCategory) {
        await updateCategory(selectedCategory.id, payload);
      } else {
        await addCategory({ ...payload, status: "Active" });
      }
      setFormData(emptyForm);
      setSelectedCategory(null);
      setIsModalOpen(false);
    } catch (err) {
      setSubmitError(err.message || t("errorOccurred"));
    }
  };

  const handleDelete = async () => {
    if (!deleteCategoryId) return;
    await deleteCategory(deleteCategoryId);
    setDeleteCategoryId(null);
  };

  const handleStatus = async (category) => {
    await toggleStatus(category.id, category.status === "Active" ? "Hidden" : "Active");
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-[rgb(0,166,62)]" size={40} />
        <h2 className="text-sm font-semibold text-gray-500">Loading...</h2>
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

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-1.5 sm:px-4 overflow-x-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[rgba(0,166,62,0.12)] text-[rgb(0,166,62)]">
              <Layers size={24} />
            </div>
            {t("categories")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {t("categoriesSubtitle")}
          </p>
        </div>

        <HasPermission resource="categories" action="add">
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[rgb(0,166,62)] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-600/20 hover:bg-[rgb(0,145,55)] transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>{t("addCategory")}</span>
          </button>
        </HasPermission>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-2 sm:gap-5 grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-2 sm:p-6 shadow-sm">
          <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider line-clamp-1">{t("totalCategories")}</p>
          <h2 className="mt-1 text-sm sm:text-3xl font-black text-gray-900">{totalCategories}</h2>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-2 sm:p-6 shadow-sm">
          <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider line-clamp-1">{t("activeCategories")}</p>
          <h2 className="mt-1 text-sm sm:text-3xl font-black text-[rgb(0,166,62)]">{activeCategories}</h2>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-2 sm:p-6 shadow-sm">
          <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider line-clamp-1">{t("hiddenCategories")}</p>
          <h2 className="mt-1 text-sm sm:text-3xl font-black text-rose-500">{hiddenCategories}</h2>
        </div>
      </div>

      {/* Search & Custom Dropdown */}
      <div className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchByNamePlaceholder")}
            className="w-full rounded-2xl border border-gray-200 bg-white ps-10 pe-4 py-2.5 text-xs sm:text-sm outline-none transition-all duration-300 focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-green-500/10"
          />
        </div>

        {/* Custom Status Dropdown */}
        <div className="relative min-w-[150px]">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:border-[rgb(0,166,62)] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-[rgb(0,166,62)]" />
              <span>
                {statusFilter === "all" && t("allStatus")}
                {statusFilter === "Active" && t("activeOnly")}
                {statusFilter === "Hidden" && t("hiddenOnly")}
              </span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isFilterDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsFilterDropdownOpen(false)} />
              <div className="absolute start-0 mt-2 z-20 w-full min-w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => { setStatusFilter("all"); setIsFilterDropdownOpen(false); }}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" /> {t("allStatus")}
                  </span>
                  {statusFilter === "all" && <Check size={16} className="text-[rgb(0,166,62)]" />}
                </button>
                <button
                  onClick={() => { setStatusFilter("Active"); setIsFilterDropdownOpen(false); }}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[rgb(0,166,62)]" /> {t("activeOnly")}
                  </span>
                  {statusFilter === "Active" && <Check size={16} className="text-[rgb(0,166,62)]" />}
                </button>
                <button
                  onClick={() => { setStatusFilter("Hidden"); setIsFilterDropdownOpen(false); }}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> {t("hiddenOnly")}
                  </span>
                  {statusFilter === "Hidden" && <Check size={16} className="text-[rgb(0,166,62)]" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Categories Grid - مؤمن تماماً وممتاز لشاشات الـ 320px الفئات الاقتصادية */}
      {filteredCategories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
          <p className="text-sm font-medium">{t("noCategories")}</p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between"
            >
              {/* Banner Image */}
              <div className="relative h-20 sm:h-36 md:h-44 w-full overflow-hidden bg-gray-100">
                <img
                  src={category.image}
                  alt={category.displayName}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-70 group-hover:opacity-50 transition-opacity" />

                <span
                  className={`absolute top-1.5 end-1.5 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[8px] sm:text-xs font-extrabold text-white shadow-sm border border-white/10 ${
                    category.status === "Active" ? "bg-[rgb(0,166,62)]/80" : "bg-rose-500/80"
                  }`}
                >
                  {category.status === "Active" ? t("activeStatus") : t("disabledStatus")}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-2 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4">
                <h3 className="text-[11px] sm:text-base font-black text-gray-900 line-clamp-1">
                  {category.displayName}
                </h3>

                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-1.5 sm:p-2 text-[9px] sm:text-xs">
                  <div className="flex items-center gap-1 text-gray-600 font-bold">
                    {(category.unitType === "weight" || category.unit_type === "weight") ? (
                      <Scale size={11} className="text-[rgb(0,166,62)] sm:size-[14px]" />
                    ) : (
                      <Boxes size={11} className="text-blue-500" />
                    )}
                    <span>
                      {(category.unitType === "weight" || category.unit_type === "weight") ? t("weight") : t("quantity")}
                    </span>
                  </div>
                </div>

                {/* Actions Buttons - الميزة السحرية: أوبشن الـ Icons للموبايل الصغير والنصوص للـ سمارت فون */}
                <div className="flex gap-1 text-[10px] sm:text-xs font-bold w-full">
                  <HasPermission resource="categories" action="edit">
                    <button
                      onClick={() => handleStatus(category)}
                      title={category.status === "Active" ? t("hide") : t("show")}
                      className="flex-1 rounded-xl bg-[rgb(0,166,62)] hover:bg-[rgb(0,145,55)] py-2 px-1 text-white transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center min-h-[32px]"
                    >
                      <span className="hidden xs:inline truncate">
                        {category.status === "Active" ? t("hide") : t("show")}
                      </span>
                      <span className="xs:hidden">
                        {category.status === "Active" ? <EyeOff size={13} /> : <Eye size={13} />}
                      </span>
                    </button>
                  </HasPermission>

                  <HasPermission resource="categories" action="edit">
                    <button
                      onClick={() => openEditModal(category)}
                      title={t("update")}
                      className="rounded-xl bg-blue-500 hover:bg-blue-600 px-2 sm:px-4 py-2 text-white transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center shrink-0 min-h-[32px]"
                    >
                      <span className="hidden xs:inline">{t("update")}</span>
                      <span className="xs:hidden"><Edit2 size={13} /></span>
                    </button>
                  </HasPermission>

                  <HasPermission resource="categories" action="delete">
                    <button
                      onClick={() => setDeleteCategoryId(category.id)}
                      title={t("delete")}
                      className="rounded-xl bg-red-500 hover:bg-red-600 px-2 sm:px-4 py-2 text-white transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center shrink-0 min-h-[32px]"
                    >
                      <span className="hidden xs:inline">{t("delete")}</span>
                      <span className="xs:hidden"><Trash2 size={13} /></span>
                    </button>
                  </HasPermission>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[95vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-8 shadow-2xl transition-all">
            
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-gray-900">
                  {selectedCategory ? t("categoryDetails") : t("addCategory")}
                </h2>
                <p className="mt-0.5 text-[11px] text-gray-500">{t("modalSubtitle")}</p>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setSelectedCategory(null); setFormData(emptyForm); }}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {submitError && (
              <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600 border border-rose-100">
                {submitError}
              </div>
            )}

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  {t("categoryNameAr")}
                </label>
                <input
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder={t("categoryNameArPlaceholder")}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-green-500/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  {t("categoryNameEn")}
                </label>
                <input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder={t("categoryNameEnPlaceholder")}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-green-500/10 transition-all"
                />
              </div>

              {/* Image Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">{t("categoryIcon")}</label>
                
                <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200/50">
                  <button
                    type="button"
                    onClick={() => setImageTab("file")}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      imageTab === "file" ? "bg-white  shadow-sm text-[rgb(0,166,62)]" : "text-gray-400 "
                    }`}
                  >
                    <Upload size={13} />
                    <span>{t("uploadTab")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab("url")}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      imageTab === "url" ? "bg-white  shadow-sm text-[rgb(0,166,62)]" : "text-gray-400 "
                    }`}
                  >
                    <LinkIcon size={13} />
                    <span>{t("urlTab")}</span>
                  </button>
                </div>

                {imageTab === "file" ? (
                  <div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 hover:border-[rgb(0,166,62)] bg-gray-50/50 rounded-2xl py-4 cursor-pointer transition-all"
                    >
                      <Upload className="text-gray-400" size={18} />
                      <span className="text-[11px] font-semibold text-gray-600">{t("clickToUploadIcon")}</span>
                      <span className="text-[9px] text-gray-400">{t("supportsImageFormats")}</span>
                    </button>
                  </div>
                ) : (
                  <input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder={t("urlPlaceholder")}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[rgb(0,166,62)] transition-all"
                  />
                )}

                {formData.image && (
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200 h-28 mt-2">
                    <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, image: "" }))}
                      className="absolute top-1.5 end-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Selling Unit Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-gray-700 block">{t("productTypeInCategory")}</label>
                <button
                  type="button"
                  onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:border-[rgb(0,166,62)] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    {formData.unitType === "weight" ? <Scale size={15} className="text-[rgb(0,166,62)]" /> : <Boxes size={15} className="text-blue-500" />}
                    <span>{formData.unitType === "weight" ? t("weight") : t("quantity")}</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isUnitDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isUnitDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUnitDropdownOpen(false)} />
                    <div className="absolute start-0 end-0 mt-1 z-20 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                      <button
                        type="button"
                        onClick={() => { setFormData({ ...formData, unitType: "weight" }); setIsUnitDropdownOpen(false); }}
                        className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Scale size={14} className="text-[rgb(0,166,62)]" />
                          {t("weight")}
                        </span>
                        {formData.unitType === "weight" && <Check size={16} className="text-[rgb(0,166,62)]" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFormData({ ...formData, unitType: "quantity" }); setIsUnitDropdownOpen(false); }}
                        className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Boxes size={14} className="text-blue-500" />
                          {t("quantity")}
                        </span>
                        {formData.unitType === "quantity" && <Check size={16} className="text-[rgb(0,166,62)]" />}
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-2.5 pt-3.5 border-t border-gray-100">
              <button
                onClick={() => { setIsModalOpen(false); setSelectedCategory(null); setFormData(emptyForm); }}
                className="rounded-xl border border-gray-200 hover:bg-gray-50 px-4 py-2 text-xs font-bold text-gray-600 transition-all cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-[rgb(0,166,62)] hover:bg-[rgb(0,145,55)] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-green-600/10 transition-all cursor-pointer"
              >
                {t("saveCategory")}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCategoryId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl text-center">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-2.5">
              <Trash2 size={20} />
            </div>
            <h2 className="text-base font-black text-gray-900">{t("deleteConfirmTitle")}</h2>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">{t("deleteConfirmMsg")}</p>
            
            <div className="mt-5 flex justify-center gap-2.5">
              <button
                onClick={() => setDeleteCategoryId(null)}
                className="flex-1 rounded-xl border border-gray-200 hover:bg-gray-50 py-2 text-xs font-bold text-gray-500 transition-all cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/10 transition-all cursor-pointer"
              >
                {t("deleteNow")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;