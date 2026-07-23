import { Users, ShoppingCart, Wallet, Clock } from "lucide-react";
import StatCard from "./StatCard";
import { useLanguage } from "../../../context/LanguageContext";

const ICONS = {
  totalUser: { icon: <Users size={20} className="text-indigo-600" />, bg: "bg-indigo-100" },
  totalOrder: { icon: <ShoppingCart size={20} className="text-blue-600" />, bg: "bg-blue-100" },
  totalSales: { icon: <Wallet size={20} className="text-emerald-600" />, bg: "bg-emerald-100" },
  totalPending: { icon: <Clock size={20} className="text-amber-600" />, bg: "bg-amber-100" },
};

export default function StatsGrid({ stats = [], loading = false }) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-2xl border border-gray-100 bg-gray-50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((s) => {
        const iconConfig = ICONS[s.title] || {};

        return (
          <StatCard
            key={s.title}
            title={t(s.title)}
            value={s.value}
            icon={iconConfig.icon}
            iconBg={iconConfig.bg}
            changePercent={s.percent}
            trend={s.trend}
            changeLabel={t(s.label)}
          />
        );
      })}
    </div>
  );
}
