import React from 'react';
import { useLanguage } from "../context/LanguageContext"; // ربط الـ Context اللي بعته بالظبط
import { useBestProducts } from '../hooks/useBestProducts';
import { Search, Loader2, ArrowUpRight, ArrowDownRight, AlertTriangle, PackageSearch } from 'lucide-react';

const BestProducts = () => {
    // سحب اللغة الحالية (ar / en) ودالة الترجمة جاهزة من الـ Context
    const { t, lang } = useLanguage();

    const {
        products,
        activeCategories,
        isLoading,
        isError,
        error,
        filters,
        totalPages,
        updateFilter,
        refetch
    } = useBestProducts();

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            
            {/* العناوين والترويسة */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {t('bestProducts')}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {t('bestProductsSubtitle')}
                </p>
            </div>

            {/* أدوات التصفية والتحكم الديناميكي بالكامل */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm">
                
                {/* 1. حقل البحث النصي */}
                <div className="relative">
                    <Search className={`absolute top-2.5 h-5 w-5 text-gray-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
                    <input
                        type="text"
                        placeholder={t('search')}
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className={`w-full py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                    />
                </div>

                {/* 2. فلتر مربوط بالأقسام النشطة فقط (active categories) */}
                <div>
                    <select
                        value={filters.category}
                        onChange={(e) => updateFilter('category', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">{t('allCategories')}</option>
                        {activeCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {lang === 'ar' ? cat.name_ar : cat.name_en}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 3. Input رقمي حر لتحديد عدد الـ Top Products (مكان الـ select) */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 whitespace-nowrap">
                        {t('showTop')}
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={filters.limit}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            updateFilter('limit', isNaN(val) || val < 1 ? 1 : val);
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* عرض الجدول والأعمدة المطلوبة فقط */}
            {isLoading ? (
                <div className="rounded-xl border border-gray-200/60 bg-white p-12 text-center shadow-sm">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-blue-600" />
                    <p className="font-bold text-xs text-gray-400">{t('loading')}</p>
                </div>
            ) : isError ? (
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-12 text-center shadow-sm">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-rose-400" />
                    <p className="font-bold text-xs text-rose-500 mb-3">{error || t('retry')}</p>
                    <button
                        onClick={() => refetch()}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                        {t('retry')}
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 font-semibold text-gray-600">{t('rank')}</th>
                                    <th className="p-4 font-semibold text-gray-600">{t('productName')}</th>
                                    <th className="p-4 font-semibold text-gray-600">{t('category')}</th>
                                    <th className="p-4 font-semibold text-gray-600">{t('unitsSold')}</th>
                                    <th className="p-4 font-semibold text-gray-600">{t('totalRevenue')}</th>
                                    <th className="p-4 font-semibold text-gray-600">{t('change')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-gray-400">
                                            <PackageSearch className="h-9 w-9 mx-auto mb-3 text-gray-200" />
                                            {t('noProductsFound')}
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product, index) => (
                                        <tr key={product.id} className="hover:bg-gray-50/50">
                                            {/* الرتبة المحسوبة ديناميكياً بناءً على الصفحة والـ limit */}
                                            <td className="p-4 font-bold text-gray-700">
                                                #{(filters.page - 1) * filters.limit + index + 1}
                                            </td>
                                            
                                            {/* اسم المنتج باللغة النشطة فقط */}
                                            <td className="p-4 font-medium text-gray-900">
                                                {lang === 'ar' ? product.name_ar : product.name_en}
                                            </td>
                                            
                                            {/* القسم باللغة النشطة فقط */}
                                            <td className="p-4 text-gray-600">
                                                {lang === 'ar' ? product.category_name_ar : product.category_name_en}
                                            </td>
                                            
                                            {/* عدد القطع التي بيعت */}
                                            <td className="p-4 font-semibold text-gray-900">
                                                {product.units_sold?.toLocaleString() || 0}
                                            </td>
                                            
                                            {/* الإيراد الكلي */}
                                            <td className="p-4 font-semibold text-green-600">
                                                {product.total_revenue?.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                                            </td>
                                            
                                            {/* نسبة التغير مع الـ Icon المناسب */}
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                                                    product.change >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {product.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                                    {Math.abs(product.change)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* الـ Pagination الديناميكي المتوافق مع السيرفر */}
                    {totalPages > 1 && (
                        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
                            <button
                                disabled={filters.page === 1}
                                onClick={() => updateFilter('page', filters.page - 1)}
                                className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50"
                            >
                                {t('previous')}
                            </button>
                            <span className="text-sm text-gray-600">
                                {lang === 'ar' 
                                    ? `صفحة ${filters.page} من ${totalPages}` 
                                    : `Page ${filters.page} of ${totalPages}`}
                            </span>
                            <button
                                disabled={filters.page === totalPages}
                                onClick={() => updateFilter('page', filters.page + 1)}
                                className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50"
                            >
                                {t('next')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BestProducts;