# DeaLora — Supermarket Management Dashboard (React)

نظام إدارة سوبر ماركت مبني بـ React.js، متجاوب بالكامل (Responsive)، بوضع
داكن (Dark Mode) شغال على كل الصفحات، ودعم لغتين (English / العربية) مع
انقلاب تلقائي لاتجاه الصفحة (RTL) عند اختيار العربية.

## المميزات

- **Routing حقيقي** بين كل الصفحات عبر react-router-dom
- **Dark Mode** كامل: زرار تبديل في الشريط العلوي، محفوظ في localStorage
- **ثنائية اللغة (i18n)**: تبديل فوري بين الإنجليزية والعربية، مع انقلاب الاتجاه (RTL)
- **React Query** لعمل Caching للبيانات (صفحة Best Sellers) عشان الصفحة متجيبش نفس البيانات تاني من غير داعي
- **بيانات سوبر ماركت واقعية**: منتجات غذائية، فئات، عملاء، فريق عمل
- **أنيميشن وترانزيشن** ناعمة في كل مكان

## الصفحات

| الصفحة | المسار | الوصف |
|---|---|---|
| Dashboard | `/` | نظرة عامة: إحصائيات، رسم بياني للمبيعات، آخر الصفقات |
| Products | `/products` | شبكة منتجات مع صور carousel وتقييم |
| Product Details (Edit) | `/products/:id/edit` | فورم تعديل منتج + رفع صور متعددة فعلي |
| **Best Sellers** | `/best-sellers` | تقرير المنتجات الأكثر مبيعًا (فلاتر، Top 3، جدول، تحليلات + رسم بياني) — تفاصيل كاملة تحت |
| Order Lists | `/orders` | فلاتر شغالة فعليًا (تاريخ، فئة، حالة) + جدول طلبات + Pagination |
| Orders by Users | `/orders-by-users` | إدارة العملاء: نظرة عامة، دليل عملاء، لوحة تفاصيل عميل مع رسم بياني |
| Team | `/team` | شبكة أعضاء الفريق، كل كارت فيه أيقونة تعديل |
| Add/Edit Team Member | `/team/add`, `/team/edit/:id` | فورم إضافة أو تعديل عضو |
| Settings | `/settings` | بيانات البروفايل الأدمن + رفع صورة شخصية فعلي |
| Login | `/login` | صفحة تسجيل دخول مستقلة (بدون قائمة جانبية) |

## صفحة Best Sellers بالتفصيل

**الفلاتر (أعلى الصفحة):**
- اختيارات سريعة للفترة الزمنية: النهاردة، آخر 7 أيام، الشهر الحالي، الشهر اللي فات، أو تحديد مخصص (From/To)
- Dropdown للفئة (Electronics, Food, Beverages, Cleaning Supplies)
- Dropdown للفرع (لو في أكتر من فرع)
- زرار "عرض التقرير" يطبّق الفلاتر ويعمل fetch جديد (مش بيجيب كل حاجة تاني لو الفلتر نفسه، بفضل React Query caching)

**Top 3 Cards:**
- 3 كروت جنب بعض، الكارت الأول عليه تاج ذهبي وحلقة مميزة
- كل كارت فيه: صورة، اسم، الكمية المباعة، إجمالي الإيرادات، ونسبة تغيّر بسهم أخضر/أحمر

**جدول الترتيب 4-10:**
- الأعمدة: الترتيب، صورة مصغرة، الاسم، الكمية المباعة، إجمالي السعر، نسبة التغيّر، المخزون المتبقي
- زرار "عرض التفاصيل" بيفتح Modal فيه تقرير مفصل عن المنتج

**التحليلات (أسفل الصفحة):**
- 3 KPIs: إجمالي مبيعات الـ Top 10، نسبتهم من إجمالي مبيعات السوبر ماركت، وأقل منتج مبيعًا
- رسم بياني خطي (recharts) لاتجاه مبيعات أعلى 5 منتجات، كل منتج بلون مختلف

**الجانب التقني:**
- `useQuery` من `@tanstack/react-query` لعمل caching (staleTime 5 دقايق)
- Skeleton loaders (نبضة رمادية) في كل الأقسام وقت التحميل
- الترتيب معتمد على **عدد القطع المباعة** فقط (زي ما هو مطلوب)، وإجمالي السعر بيتعرض كمعلومة إضافية جنبه
- `src/services/bestSellersApi.js` جاهزة لاستبدالها بـ API حقيقي — بتحوّل الفلاتر لـ Query Parameters؛ لما يبقى عندك Backend، غيّر جسم الدالة بـ `fetch(...)` وسيب باقي الصفحة زي ما هي

## هيكل الملفات

```
src/
  App.jsx                          كل الـ Routes
  context/
    ThemeContext.jsx                 إدارة الوضع الداكن/الفاتح
    LanguageContext.jsx              إدارة اللغة (en/ar) + اتجاه الصفحة
  i18n/
    translations.js                  قاموس الترجمة
  data/
    supermarket.js                   بيانات المنتجات، الطلبات، الفريق، العملاء
    bestSellers.js                   بيانات صفحة Best Sellers
  services/
    bestSellersApi.js                استدعاء API جاهز لصفحة Best Sellers
  components/
    Layout.jsx / Sidebar.jsx / Topbar.jsx
    common/                          DarkModeToggle, LanguageToggle, ProfileMenu
    bestsellers/
      BestSellersFilters.jsx           فلاتر التاريخ/الفئة/الفرع
      TopProductsCards.jsx              كروت الـ Top 3
      ProductsTable.jsx                 جدول الترتيب 4-10 + فتح المودال
      ProductDetailsModal.jsx           مودال تقرير المنتج
      ProductsAnalytics.jsx             KPIs + الرسم البياني
    orderlists/ / products/ / team/ / ordersbyusers/
  pages/                             كل صفحة رئيسية
```

## التشغيل محلياً

```bash
npm install
npm run dev
```

المشروع مبني بـ **Vite + Tailwind CSS (darkMode: 'class') + react-router-dom + recharts + @tanstack/react-query**.

## ملاحظات

- كل البيانات التجريبية في `src/data/` — استبدلها ببيانات حقيقية من الـ API بتاعك.
- تسجيل الدخول (`/login`) شكلي فقط حاليًا — اربطه بنظام مصادقة حقيقي حسب الـ backend بتاعك.
