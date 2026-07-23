import { BEST_SELLERS } from "../data/bestSellers";

function calculateTrend(current, previous) {
  if (previous === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function getUnits(product, period) {
  switch (period) {
    case "today":
      return product.todaySold;
    case "week":
      return product.weekSold;
    case "month":
      return product.monthSold;
    case "year":
      return product.yearSold;
    default:
      return product.weekSold;
  }
}

function getPreviousUnits(product, period) {
  switch (period) {
    case "today":
      return product.previousToday;
    case "week":
      return product.previousWeek;
    case "month":
      return product.previousMonth;
    case "year":
      return product.previousYear;
    default:
      return product.previousWeek;
  }
}

export async function fetchBestSellers(filters = {}) {
  // المحاكاة
  await new Promise((resolve) => setTimeout(resolve, 300));

  const period = filters.time || "week";
  const limit = filters.limit || "all";

  let products = [...BEST_SELLERS];

  // 1. فلترة الأقسام (بواسطة Category name أو categoryId)
  if (filters.category && filters.category !== "All") {
    products = products.filter(
      (product) =>
        product.category === filters.category ||
        product.categoryId === filters.categoryId
    );
  }

  // 2. حساب المبيادات والإيراد الفعلي بناءً على سعر الخصم إن وجد
  products = products.map((product) => {
    const unitsSold = getUnits(product, period);
    const previousUnits = getPreviousUnits(product, period);

    // السعر الفعلي المباع به (سعر العرض أو السعر الأصلي)
    const effectivePrice =
      product.salePrice && product.salePrice > 0
        ? product.salePrice
        : product.price;

    return {
      ...product,
      effectivePrice,
      quantitySold: unitsSold,
      totalRevenue: unitsSold * effectivePrice, // الإيراد الدقيق
      percentChange: calculateTrend(unitsSold, previousUnits),
      currentPeriod: period,
    };
  });

  // 3. الترتيب مع معالجة التساوي (Tie-Breaking)
  products.sort((a, b) => {
    // الشرط 1: عدد القطع المباعة
    if (b.quantitySold !== a.quantitySold) {
      return b.quantitySold - a.quantitySold;
    }

    // الشرط 2 (عند التساوي): الإيراد الكلي
    if (b.totalRevenue !== a.totalRevenue) {
      return b.totalRevenue - a.totalRevenue;
    }

    // الشرط 3 (عند التساوي التام): الترتيب بحسب المعرف id
    return a.id - b.id;
  });

  // 4. إعادة ترتيب الرتبة (Rank)
  products = products.map((product, index) => ({
    ...product,
    rank: index + 1,
  }));

  // 5. تطبيق فلتر الحد الأقصى للمنتجات (Limit Filter)
  if (limit !== "all" && !isNaN(Number(limit))) {
    products = products.slice(0, Number(limit));
  }

  return products;
}