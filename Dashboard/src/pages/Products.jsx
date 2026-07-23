import { useMemo, useState } from "react";
import { toast } from "sonner";

import ProductCard from "../components/products/ProductCard";
import ProductForm from "../components/products/ProductForm";

import { useProducts } from "../Hooks/useProducts";
import { useCategories } from "../Hooks/useCategories";
import { useLanguage } from "../context/LanguageContext";
import { usePermission } from "../Hooks/usePermission";
import { uploadService } from "../services/uploadService";

const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80";

export default function Products() {
  const { t, lang } = useLanguage();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { can } = usePermission();
  
  // استدعاء activeCategories لضمان مطابقة الـ 6 أقسام النشطة فقط وتفادي قراءة الأقسام المخفية
  const { activeCategories } = useCategories(); 

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [maxStock, setMaxStock] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  
  // نافذة تأكيد مخصصة (Custom Modal state)
  const [productToDelete, setProductToDelete] = useState(null);

  const hasActiveFilters = query.trim() !== "" || categoryFilter !== "all" || maxStock !== "" || maxPrice !== "";

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setMaxStock("");
    setMaxPrice("");
  };

  // دالة اختيار القسم مع التمرير التلقائي السلس إلى المنتصف
  const handleCategorySelect = (categoryId, event) => {
    setCategoryFilter(categoryId);
    if (event?.currentTarget) {
      event.currentTarget.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const filteredProducts = useMemo(() => {
    const text = query.toLowerCase();
    return products.filter((product) => {
      let name = "";
      if (product.name && typeof product.name === "object") {
        name = (product.name[lang] || product.name.ar || product.name.en || "").toLowerCase();
      } else if (typeof product.name === "string") {
        name = product.name.toLowerCase();
      }

      const stockLimit = maxStock === "" ? true : product.stock <= Number(maxStock);
      const priceLimit = maxPrice === "" ? true : product.price <= Number(maxPrice);
      const categoryMatch = categoryFilter === "all" ? true : product.categoryId === Number(categoryFilter);
      return name.includes(text) && stockLimit && priceLimit && categoryMatch;
    });
  }, [products, query, maxStock, maxPrice, categoryFilter, lang]);

  const handleAddOrUpdateProduct = async (data) => {
    try {
      let imageUrl = data.image;
      if (data.imageFile) {
        const uploaded = await uploadService.uploadImage(data.imageFile);
        imageUrl = uploaded.url || uploaded.imageUrl || imageUrl;
      }

      const payload = { ...data, image: imageUrl };
      delete payload.imageFile;

      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, data: payload });
        toast.success(lang === "ar" ? "تم تعديل المنتج ومزامنة البيانات بنجاح!" : "Product updated successfully!");
        setEditingProduct(null);
      } else {
        await addProduct(payload);
        toast.success(lang === "ar" ? "تم إضافة المنتج بنجاح!" : "Product added successfully!");
      }
    } catch (err) {
      toast.error(lang === "ar" ? "حدث خطأ أثناء حفظ المنتج!" : "Something went wrong!");
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete);
      toast.success(lang === "ar" ? "تم حذف المنتج بنجاح!" : "Product deleted successfully!");
    } catch (err) {
      toast.error(lang === "ar" ? "فشل في إتمام عملية الحذف" : "Failed to delete");
    } finally {
      setProductToDelete(null);
    }
  };

  // 🔹 دالة جلب اسم القسم بدعم ديناميكي كامل للغة الواجهة (ar / en)
  const getCategoryName = (id) => {
    const category = activeCategories.find((item) => item.id === id);
    if (!category) return lang === "ar" ? "غير معروف" : "Unknown";
    
    if (lang === "ar") {
      return category.nameAr || category.name_ar || category.name || "";
    } else {
      return category.nameEn || category.name_en || category.name || "";
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 overflow-hidden">
      
      {/* الهيدر الرئيسي وتطوير صندوق المنتجات */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* عنوان الصفحة الصريح */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {t("products")}
          </h1>
        </div>
        
        {/* كارت إجمالي المنتجات المطور */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-[rgb(0,166,62)] to-teal-700 p-4 sm:p-5 text-white shadow-xl shadow-[rgb(0,166,62)]/15 border border-white/10 w-full md:w-80 transition-all duration-300 hover:shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-100 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                {t("totalProducts")}
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {products.length}
                </h3>
                <span className="text-xs font-medium text-emerald-100/90">
                  {lang === "ar" ? "منتج مسجل" : "items"}
                </span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة الأقسام مع التمرير والتأثيرات الخضراء */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* شريط الأقسام */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm space-y-3 lg:sticky lg:top-4 w-full min-w-0">
          
          <div className="flex items-center justify-between px-1 pb-2 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[rgb(0,166,62)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v12a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
              </svg>
              <span>{t("allCategories")}</span>
            </h3>
            <span className="text-[11px] font-bold text-[rgb(0,166,62)] bg-[rgb(0,166,62)]/10 px-2 py-0.5 rounded-full">
              {activeCategories.length}
            </span>
          </div>

          {/* قائمة الأقسام القابلة للتمرير أفقيًا ورأسيًا */}
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-y-auto lg:max-h-[60vh] pb-2 lg:pb-0 scrollbar-none custom-scrollbar">
            
            {/* خيار كل الأقسام */}
            <button
              onClick={(e) => handleCategorySelect("all", e)}
              className={`flex-shrink-0 lg:flex-shrink group text-start px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-between gap-3 ${
                categoryFilter === "all"
                  ? "bg-[rgb(0,166,62)] text-white shadow-md shadow-[rgb(0,166,62)]/20"
                  : "hover:bg-gray-50 text-gray-600 bg-gray-50/50 lg:bg-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 whitespace-nowrap">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  categoryFilter === "all" 
                    ? "bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                    : "bg-gray-300 group-hover:bg-[rgb(0,166,62)] group-hover:scale-110 group-hover:shadow-[0_0_8px_rgba(0,166,62,0.8)]"
                }`}></div>
                <span>{t("allCategories")}</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-lg font-bold transition ${
                categoryFilter === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {products.length}
              </span>
            </button>

            {/* باقي الأقسام النشطة مع دعم اللغة الديناميكي */}
            {activeCategories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              const isSelected = categoryFilter === String(cat.id);
              
              // تحديد الاسم المناسب حسب لغة الواجهة الحالية
              const categoryDisplayName = lang === "ar" 
                ? (cat.nameAr || cat.name_ar || cat.name) 
                : (cat.nameEn || cat.name_en || cat.name);

              return (
                <button
                  key={cat.id}
                  onClick={(e) => handleCategorySelect(String(cat.id), e)}
                  className={`flex-shrink-0 lg:flex-shrink group text-start px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-[rgb(0,166,62)] text-white shadow-md shadow-[rgb(0,166,62)]/20"
                      : "hover:bg-gray-50 text-gray-600 bg-gray-50/50 lg:bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 whitespace-nowrap">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isSelected 
                        ? "bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                        : "bg-gray-300 group-hover:bg-[rgb(0,166,62)] group-hover:scale-110 group-hover:shadow-[0_0_8px_rgba(0,166,62,0.8)]"
                    }`}></div>
                    <span className="truncate max-w-[120px] sm:max-w-[150px]">
                      {categoryDisplayName}
                    </span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-lg font-bold transition ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* الفلاتر وقائمة الكروت */}
        <div className="lg:col-span-3 space-y-6 w-full min-w-0">
          
          {/* شريط السيرش والبحث المتقدم */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 ltr:left-3 rtl:right-3 flex items-center text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder={t("searchByNamePlaceholder")} 
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl ltr:pl-9 rtl:pr-9 ltr:pr-4 rtl:pl-4 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-[rgb(0,166,62)] focus:ring-2 focus:ring-[rgb(0,166,62)]/20 transition" 
              />
            </div>
            
            <div className="w-full sm:w-48 relative">
              <input 
                type="number" 
                min="0" 
                value={maxStock} 
                onChange={(e) => setMaxStock(e.target.value)} 
                placeholder={lang === "ar" ? "المخزون أقل من..." : "Stock less than..."} 
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-[rgb(0,166,62)] focus:ring-2 focus:ring-[rgb(0,166,62)]/20 transition" 
              />
            </div>

            <div className="w-full sm:w-48 relative">
              <input 
                type="number" 
                min="0" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)} 
                placeholder={lang === "ar" ? "السعر أقل من..." : "Price less than..."} 
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-[rgb(0,166,62)] focus:ring-2 focus:ring-[rgb(0,166,62)]/20 transition" 
              />
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition whitespace-nowrap">
                {t("clearFilters")}
              </button>
            )}
          </div>

          {/* نموذج المنتج: يظهر فقط لمن يملك صلاحية الإضافة أو التعديل بحسب الوضع الحالي */}
          {(editingProduct ? can("products", "edit") : can("products", "add")) && (
            <ProductForm
              key={editingProduct ? editingProduct.id : "new"}
              onSubmit={handleAddOrUpdateProduct}
              initialData={editingProduct}
              onCancelEdit={() => setEditingProduct(null)}
            />
          )}

          {/* عرض كروت المنتجات */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-sm font-medium">{t("noProductsFound")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
              {filteredProducts.map((product) => {
                const currentName = product.name && typeof product.name === "object"
                  ? (product.name[lang] || product.name.ar || product.name.en || "")
                  : product.name;

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={currentName}
                    price={product.price}
                    category={getCategoryName(product.categoryId)}
                    stock={product.stock}
                    unit={product.unit}
                    discountDetails={product.discountDetails}
                    discount={
                      product.offerPrice
                        ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
                        : 0
                    }
                    images={[product.image]}
                    onEdit={() => setEditingProduct(product)}
                    onDelete={(id) => setProductToDelete(id)}
                    canEdit={can("products", "edit")}
                    canDelete={can("products", "delete")}
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* modal الحذف */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-gray-100 shadow-xl space-y-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">{lang === "ar" ? "تأكيد الحذف" : "Confirm Delete"}</h4>
              <p className="text-xs text-gray-500 mt-1">{lang === "ar" ? "هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this product?"}</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-xs shadow-sm"
              >
                {lang === "ar" ? "نعم، احذف" : "Yes, Delete"}
              </button>
              <button 
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-xs"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
