import DashboardSection from "../layout/DashboardSection";
import DashboardSectionHeader from "../shared/DashboardSectionHeader";

import TopProducts from "../components/TopProducts";
import LowStockProducts from "../components/LowStockProducts";

export default function InventorySection({
  data = {},
}) {
  const {
    bestProducts = {},
    lowStockProducts = [],
  } = data;

  const topProducts = bestProducts.products || [];

  return (
    <DashboardSection>
      <DashboardSectionHeader
        title="Inventory"
        subtitle="Products overview"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <TopProducts
          products={topProducts}
        />

        <LowStockProducts
          products={lowStockProducts}
        />
      </div>
    </DashboardSection>
  );
}
