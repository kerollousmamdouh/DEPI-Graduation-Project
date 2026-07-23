import DashboardSection from "../layout/DashboardSection";
import DashboardSectionHeader from "../shared/DashboardSectionHeader";
import LatestOrders from "../cards/LatestOrders";

export default function OrdersOverviewSection({
  data = {},
}) {
  const {
    latestOrders = [],
  } = data;

  return (
    <DashboardSection>
      <DashboardSectionHeader
        title="Orders Overview"
        subtitle="Latest customer orders"
      />

      <div className="grid gap-6">
        <LatestOrders orders={latestOrders} />
      </div>
    </DashboardSection>
  );
}