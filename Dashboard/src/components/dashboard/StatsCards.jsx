import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  BadgePercent,
  MessageSquareWarning,
} from "lucide-react";

import StatCard from "./StatCard";

export default function StatsCards({ stats }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        title="Products"
        value={stats.products}
        icon={<Package size={24} />}
        color="#2563EB"
      />

      <StatCard
        title="Orders"
        value={stats.orders}
        icon={<ShoppingCart size={24} />}
        color="#EA580C"
      />

      <StatCard
        title="Users"
        value={stats.users}
        icon={<Users size={24} />}
        color="#7C3AED"
      />

      <StatCard
        title="Revenue"
        value={`EGP ${stats.revenue.toLocaleString()}`}
        icon={<DollarSign size={24} />}
        color="#16A34A"
      />

      <StatCard
        title="Active Deals"
        value={stats.deals}
        icon={<BadgePercent size={24} />}
        color="#DC2626"
      />

      <StatCard
        title="Complaints"
        value={stats.complaints}
        icon={<MessageSquareWarning size={24} />}
        color="#CA8A04"
      />
    </div>
  );
}