import { useState, useEffect } from "react";
import StatCard from "./StatCard";
import { fetchDashboardStats } from "../services/dashboardService"; // استدعاء الخدمة
import { useLanguage } from "../context/LanguageContext";

export default function StatsGrid() {
  const { t } = useLanguage();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب البيانات عند تحميل الصفحة
    fetchDashboardStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>; // ممكن تحط Skeleton هنا مستقبلاً

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((s) => (
        <StatCard 
          key={s.title} 
          title={t(s.title)} 
          value={s.value} 
          changePercent={s.percent}
          trend={s.trend}
          changeLabel={t(s.label)}
          // ملاحظة: الأيقونات ممكن تدمجها في الـ Service برضه
        />
      ))}
    </div>
  );
}