import { Search } from "lucide-react";

const SearchBar = ({ query, setQuery, onTriggerScroll, lang = 'ar' }) => {
  
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    console.log("تمت عملية البحث عن:", query);
    if (onTriggerScroll) {
      onTriggerScroll();
    }
  };

  return (
    // استخدام dir سيجعل الـ input والـ button يتبادلان أماكنهما تلقائياً
    <form 
      onSubmit={handleSearchSubmit} 
      className="relative w-full group" 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <input
  type="text"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder={lang === 'ar' ? "ابحث عن المنتجات، السوبر ماركت..." : "Search for products, supermarket..."}
  // التعديل هنا: إضافة padding ديناميكي للجهة التي فيها الأيقونة
  className={`w-full h-11 px-4 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all duration-300 focus:bg-white focus:border-green-200 focus:ring-4 focus:ring-green-500/5 placeholder:text-slate-400 ${
    lang === 'ar' ? 'pl-4 pr-11' : 'pr-4 pl-11'
  }`}
/>
      
      <button
        type="submit"
        className="absolute top-1/2 -translate-y-1/2 left-3 rtl:right-3 rtl:left-auto text-slate-400 group-focus-within:text-[#00a650] transition-colors duration-300 bg-transparent border-none cursor-pointer p-1"
        title={lang === 'ar' ? "بحث" : "Search"}
      >
        <Search size={18} className="stroke-[2.2]" />
      </button>
    </form>
  );
};

export default SearchBar;