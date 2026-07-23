import DashboardSection from "../layout/DashboardSection";
import DashboardSectionHeader from "../shared/DashboardSectionHeader";

import StatsGrid from "../cards/StatsGrid";
import RevenueChart from "../components/RevenueChart";
import OrdersChart from "../components/OrdersChart";

export default function StoreOverviewSection({
  data = {},
}) {
  const {
    stats = [],
    statsLoading = false,
    revenueChartData = [],
    ordersChartData = [],
  } = data;

  return (
    <DashboardSection>
      <DashboardSectionHeader
        title="Store Overview"
        subtitle="Overall business performance"
      />

      <StatsGrid stats={stats} loading={statsLoading} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RevenueChart data={revenueChartData} />

        <OrdersChart data={ordersChartData} />
      </div>
    </DashboardSection>
  );
}
