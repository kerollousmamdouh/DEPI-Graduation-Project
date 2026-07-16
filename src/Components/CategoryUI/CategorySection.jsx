import { useContext } from 'react';
import { SiteContext } from '../../Store/SiteContext'; // 👈 تأكد من صحة مسار الـ Context عندك
import CategoryCard from './CategoryCard';

function CategoriesSection({lang}) {
  // 📥 سحب البيانات واللغة وحالة التحميل مباشرة من الـ Context
  const { adminData, isLoading } = useContext(SiteContext);

  // ⏳ حالة التحميل: لو الباك اند لسه بيجيب الداتا، ممكن تعرض Skeleton أو تسيبه يعرض الداتا الافتراضية
  if (isLoading) {
    return <div className="text-center py-6">جاري التحميل...</div>; 
  }

  // 🛡️ حماية حتي لا يحدث كراش لو البيانات لم تصل بعد
  const categories = adminData?.categories || [];
  const products = adminData?.products || [];

  return (
    <section className="container mx-auto px-2 py-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
        {categories.map((category) => {
          // 🔢 حساب عدد المنتجات في كل قسم ديناميكياً من الباك اند
          const count = products.filter(p => p.categoryId === category.id).length;
          
          return (
            <CategoryCard 
              key={category.id} 
              category={category} 
              productCount={count} 
              lang={lang} 
            />
          );
        })}
      </div>
    </section>
  );
}

export default CategoriesSection;