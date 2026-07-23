import { useState, useEffect, useRef } from "react";
import { useCategories } from "../../Hooks/useCategories";
import { useLanguage } from "../../context/LanguageContext";

export default function ProductForm({ onSubmit, initialData = null, onCancelEdit = null, onOpenAddCategory = null }) {
  const { lang } = useLanguage();
  
  // استدعاء activeCategories لضمان عرض الأقسام النشطة فقط
  const { activeCategories } = useCategories(); 
  
  const nameInputRef = useRef(null);

  // مرجع للتحكم في إغلاق القائمة المنسدلة عند الضغط خارجها
  const categoryDropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    price: "",
    discount: "",
    stock: "",
    categoryId: "",
    image: "",
    imageFile: null,
    unitType: "quantity",    // "quantity" أو "weight" (per-product)
    weightUnit: "kg",        // "kg" أو "g"
    discountType: "stock",   // "stock" أو "date"
    discountExpiryDate: "",
    discountStockQty: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  // إغلاق قائمة الأقسام عند الضغط خارج المكون
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (initialData) {
      let calcDiscount = initialData.discount || "";
      if (!calcDiscount && initialData.price && initialData.offerPrice) {
        calcDiscount = Math.round(((initialData.price - initialData.offerPrice) / initialData.price) * 100);
      }

      // تحديد نوع المنتج (وزن أم قطعة) - من بيانات المنتج itself أولاً
      const isWeight = initialData.unitType === "weight" || initialData.unit === "kg" || initialData.unit === "g";
      let displayStock = initialData.stock || "";

      // إذا كانت البيانات مخزنة بالجرام في الباك إند، نقوم بتحويلها وعرضها بالكيلو جرام للأدمن لسهولة القراءة
      if (isWeight && initialData.stock) {
        displayStock = Number(initialData.stock) / 1000;
      }

      setFormData({
        nameAr: initialData.name?.ar || "",
        nameEn: initialData.name?.en || "",
        price: initialData.price || "",
        discount: calcDiscount,
        stock: displayStock,
        categoryId: initialData.categoryId || "",
        image: initialData.image || "",
        imageFile: null,
        weightUnit: "kg",
        unitType: isWeight ? "weight" : "quantity",
        discountType: initialData.offerExpiresAt ? "date" : "stock",
        discountExpiryDate: initialData.offerExpiresAt ? initialData.offerExpiresAt.substring(0, 16) : "",
        discountStockQty: initialData.offerStock || "",
      });

      const formElement = document.getElementById("product-form-container");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 300);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorMsg("");

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "categoryId") {
        const selectedCat = activeCategories.find((c) => String(c.id) === String(value));
        if (selectedCat) {
          const isWeight = selectedCat.unitType === "weight" || [1, 2, 4].includes(Number(selectedCat.id));
          updated.unitType = isWeight ? "weight" : "quantity";
          updated.weightUnit = isWeight ? "kg" : "piece";
        }
      }
      return updated;
    });
  };

  // اختيار قسم جديد من الـ Custom Dropdown
  const handleSelectCategory = (catId) => {
    setErrorMsg("");
    
    const selectedCat = activeCategories.find((c) => String(c.id) === String(catId));
    
    setFormData((prev) => {
      const isWeight = selectedCat 
        ? (selectedCat.unitType === "weight" || [1, 2, 4].includes(Number(selectedCat.id))) 
        : false;

      return {
        ...prev,
        categoryId: catId,
        unitType: isWeight ? "weight" : "quantity",
        weightUnit: isWeight ? "kg" : "piece",
      };
    });
    setIsDropdownOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.nameAr.trim() && !formData.nameEn.trim()) {
      setErrorMsg(lang === "ar" ? "برجاء كتابة اسم المنتج بالعربي أو الإنجليزي على الأقل" : "Please enter product name in Arabic or English");
      return;
    }

    if (!formData.categoryId) {
      setErrorMsg(lang === "ar" ? "يرجى اختيار قسم للمنتج" : "Please select a category");
      return;
    }

    const price = Number.parseFloat(formData.price) || 0;
    const discountVal = Number.parseFloat(formData.discount) || 0;
    
    // التعامل مع المخزون: تحويل الكيلوجرام إلى جرامات إذا كان المنتج يعتمد على الوزن
    let stock = Number.parseFloat(formData.stock) || 0;
    if (formData.unitType === "weight") {
      if (formData.weightUnit === "kg") {
        stock = Math.round(stock * 1000); // تحويل الكيلو لجرام في الداتابيز
      } else {
        stock = Math.round(stock); // جرام مباشر
      }
    } else {
      stock = Math.round(stock); // عدد قطع صحيح
    }

    let offerPrice = null;
    if (discountVal > 0) {
      offerPrice = Math.round((price - (price * discountVal) / 100) * 100) / 100;
    }

    // تجهيز حقول العروض الذكية بناءً على اختيار الأدمن والـ Database Schema
    let offerStock = null;
    let offerExpiresAt = null;

    if (discountVal > 0) {
      if (formData.discountType === "stock") {
        offerStock = formData.discountStockQty ? Number(formData.discountStockQty) : null;
        offerExpiresAt = null;

        const checkStockLimit = formData.unitType === "weight" && formData.weightUnit === "kg" ? stock : Number(formData.discountStockQty);
        const totalStockForCheck = stock;
        if (checkStockLimit > totalStockForCheck) {
          setErrorMsg(lang === "ar" ? "كمية العرض لا يمكن أن تتجاوز كمية المخزون الإجمالي!" : "Offer stock cannot exceed total stock!");
          return;
        }
      } else if (formData.discountType === "date") {
        offerExpiresAt = formData.discountExpiryDate ? new Date(formData.discountExpiryDate).toISOString() : null;
        offerStock = null;
      }
    }

    const productPayload = {
      categoryId: Number(formData.categoryId),
      name: {
        ar: formData.nameAr.trim() || null,
        en: formData.nameEn.trim() || null,
      },
      price,
      offerPrice,
      stock,
      unitType: formData.unitType,
      image: formData.image || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80",
      imageFile: formData.imageFile,
      offerStock,
      offerExpiresAt
    };

    onSubmit(productPayload);

    setFormData({
      nameAr: "", nameEn: "", price: "", discount: "", stock: "",
      categoryId: "", image: "", imageFile: null, unitType: "quantity",
      weightUnit: "kg", discountType: "stock", discountExpiryDate: "", discountStockQty: ""
    });
  };

  // مطابقة الـ Dropdown مع البيانات المفلترة بأمان
  const selectedCategory = activeCategories.find((cat) => String(cat.id) === String(formData.categoryId));
  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[rgb(0,166,62)] focus:ring-2 focus:ring-[rgb(0,166,62)]/20 text-gray-900 transition-all";

  return (
    <div id="product-form-container" className="scroll-mt-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-gray-100">
        
        {/* رأس النموذج */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {initialData ? (lang === "ar" ? "تعديل المنتج" : "Edit Product") : (lang === "ar" ? "إضافة منتج جديد" : "Add New Product")}
            </h2>
          </div>
          {initialData && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              {lang === "ar" ? "إلغاء التعديل" : "Cancel Edit"}
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* الأسماء */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {lang === "ar" ? "اسم المنتج (بالعربي)" : "Product Name (AR)"}
            </label>
            <input
              ref={nameInputRef}
              name="nameAr"
              value={formData.nameAr}
              onChange={handleChange}
              placeholder="مثال: أرز الضحى 1كجم"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {lang === "ar" ? "اسم المنتج (بالإنجليزي)" : "Product Name (EN)"}
            </label>
            <input
              name="nameEn"
              value={formData.nameEn}
              onChange={handleChange}
              placeholder="e.g. Al Doha Rice 1kg"
              className={inputClass}
              dir="ltr"
            />
          </div>
        </div>

        {/* القسم ونوع الوحدة والمخزون */}
        <div className="grid gap-3 md:grid-cols-3">
          
          {/* قائمة الأقسام العصرية المخصصة */}
          <div className="relative" ref={categoryDropdownRef}>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {lang === "ar" ? "القسم" : "Category"}
            </label>

            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${inputClass} text-start flex items-center justify-between gap-2 cursor-pointer ${
                isDropdownOpen ? "border-[rgb(0,166,62)] ring-2 ring-[rgb(0,166,62)]/20" : ""
              }`}
            >
              <span className={selectedCategory ? "font-semibold text-gray-900" : "text-gray-400"}>
                {selectedCategory
                  ? (lang === "ar" ? selectedCategory.nameAr || selectedCategory.name : selectedCategory.name)
                  : (lang === "ar" ? "-- اختر القسم --" : "-- Select Category --")}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-[rgb(0,166,62)]" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-30 top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn p-1.5 max-h-56 overflow-y-auto space-y-1">
                {activeCategories.length === 0 ? (
                  <div className="p-3 text-center text-xs text-gray-400">
                    {lang === "ar" ? "لا توجد أقسام متاحة" : "No categories available"}
                  </div>
                ) : (
                  activeCategories.map((cat) => {
                    const isSelected = String(cat.id) === String(formData.categoryId);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`w-full text-start px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-between ${
                          isSelected
                            ? "bg-[rgb(0,166,62)]/10 text-[rgb(0,166,62)]"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-[rgb(0,166,62)] scale-125" : "bg-gray-300"}`}></span>
                          <span>{lang === "ar" ? cat.nameAr || cat.name : cat.name}</span>
                        </div>
                        
                        {isSelected && (
                          <svg className="w-4 h-4 text-[rgb(0,166,62)]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    );
                  })
                )}

                {onOpenAddCategory && (
                  <div className="pt-1 mt-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenAddCategory();
                      }}
                      className="w-full text-center px-3 py-2 rounded-xl text-xs font-bold text-[rgb(0,166,62)] hover:bg-[rgb(0,166,62)]/10 transition flex items-center justify-center gap-1"
                    >
                      <span>+</span>
                      <span>{lang === "ar" ? "إضافة قسم جديد" : "Add Category"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* نوع الوحدة - per product */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {lang === "ar" ? "نوع الوحدة" : "Unit Type"}
            </label>
            <select
              name="unitType"
              value={formData.unitType}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="quantity">{lang === "ar" ? "عدد قطع" : "Piece (Qty)"}</option>
              <option value="weight">{lang === "ar" ? "وزن (كيلو/جرام)" : "Weight (Kg/G)"}</option>
            </select>
          </div>

          {/* الكمية والمخزون الديناميكي بالكامل */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {formData.unitType === "weight" 
                ? (lang === "ar" ? "الكمية المتاحة (بالكيلو جرام)" : "Stock (in Kg)") 
                : (lang === "ar" ? "الكمية المتاحة (عدد القطع)" : "Stock (Pieces)")}
            </label>
            <div className="flex gap-2">
              <input 
                type="number" 
                step={formData.unitType === "weight" ? "0.001" : "1"} 
                name="stock" 
                value={formData.stock} 
                onChange={handleChange} 
                placeholder={formData.unitType === "weight" ? "مثال: 5.200" : "عدد القطع"} 
                className={inputClass} 
                min="0" 
                required 
              />
              {formData.unitType === "weight" && (
                <select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="w-28 rounded-xl border border-gray-200 bg-gray-50 px-2 py-2.5 text-xs font-bold text-gray-700">
                  <option value="kg">{lang === "ar" ? "كيلو" : "Kg"}</option>
                  <option value="g">{lang === "ar" ? "جرام" : "Gram"}</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* السعر والخصم */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "السعر الأساسي" : "Base Price"}</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" className={inputClass} min="0" step="0.01" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "نسبة الخصومات (%) إن وجدت" : "Discount % (Optional)"}</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              placeholder="مثال: 15"
              className={inputClass}
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* إعدادات الشروط للعروض */}
        {Number(formData.discount) > 0 && (
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3 transition-all">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <span className="text-xs font-bold text-[rgb(0,166,62)]">
                {lang === "ar" ? "إعدادات شروط العرض والخصم" : "Discount Rules Settings"}
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-gray-700">
                  <input type="radio" name="discountType" value="stock" checked={formData.discountType === "stock"} onChange={handleChange} className="accent-[rgb(0,166,62)]" />
                  {lang === "ar" ? "حسب كمية محددة" : "By Specific Stock"}
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-gray-700">
                  <input type="radio" name="discountType" value="date" checked={formData.discountType === "date"} onChange={handleChange} className="accent-[rgb(0,166,62)]" />
                  {lang === "ar" ? "حسب تاريخ انتهاء" : "By Expiry Date"}
                </label>
              </div>
            </div>

            <div>
              {formData.discountType === "stock" ? (
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">
                    {lang === "ar" ? "عدد الكمية المتاحة ضمن العرض" : "Offer Stock Limit"}
                  </label>
                  <input
                    type="number"
                    name="discountStockQty"
                    value={formData.discountStockQty}
                    onChange={handleChange}
                    placeholder={`مثال: 10 من إجمالي ${formData.stock || 'الكمية'}`}
                    className={inputClass}
                    min="1"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">
                    {lang === "ar" ? "تاريخ ووقت انتهاء العرض" : "Offer Expiration Date & Time"}
                  </label>
                  <input
                    type="datetime-local"
                    name="discountExpiryDate"
                    value={formData.discountExpiryDate}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* الصورة ورابطها */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="flex-1 w-full">
            <input name="image" value={formData.image.startsWith("blob:") ? "" : formData.image} onChange={handleChange} placeholder={lang === "ar" ? "رابط الصورة (اختياري)" : "Image URL (Optional)"} className={inputClass} dir="ltr" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <input type="file" id="product-img-file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <label htmlFor="product-img-file" className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer transition whitespace-nowrap">
              {lang === "ar" ? "رفع صورة" : "Upload File"}
            </label>
            {formData.image && (
              <img src={formData.image} alt="Preview" className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
            )}
          </div>
        </div>

        {/* زر الحفظ والتأكيد */}
        <button type="submit" className="w-full rounded-xl bg-[rgb(0,166,62)] py-2.5 font-bold text-white text-sm transition hover:bg-[rgb(0,140,52)] shadow-sm">
          {initialData ? (lang === "ar" ? "حفظ وتحديث المنتج" : "Update Product") : (lang === "ar" ? "إضافة المنتج الآن" : "Save Product")}
        </button>
      </form>
    </div>
  );
}