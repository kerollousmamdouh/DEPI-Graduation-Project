import { Link } from "react-router-dom";
import { MessageSquareWarning, BadgePercent, ArrowRight } from "lucide-react";

import DashboardSection from "../layout/DashboardSection";
import DashboardSectionHeader from "../shared/DashboardSectionHeader";
import DashboardCard from "../shared/DashboardCard";

import LowStockProducts from "../components/LowStockProducts";

export default function StoreHealthSection({
  data = {},
}) {
  const {
    lowStockProducts = [],
    pendingComplaintsCount = 0,
    expiringDealsCount = 0,
  } = data;

  return (
    <DashboardSection>
      <DashboardSectionHeader
        title="Store Health"
        subtitle="Monitor issues requiring attention"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LowStockProducts
            products={lowStockProducts}
          />
        </div>

        <div className="space-y-6">
          <DashboardCard className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
              <MessageSquareWarning size={22} />
            </div>

            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">
                {pendingComplaintsCount}
              </p>
              <p className="text-sm text-gray-500">
                Pending complaints
              </p>
            </div>

            <Link
              to="/complaints"
              className="text-gray-400 hover:text-[rgb(0,166,62)]"
            >
              <ArrowRight size={18} />
            </Link>
          </DashboardCard>

          <DashboardCard className="flex items-center gap-4">
            <div className="rounded-xl bg-rose-100 p-3 text-rose-600">
              <BadgePercent size={22} />
            </div>

            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">
                {expiringDealsCount}
              </p>
              <p className="text-sm text-gray-500">
                Deals expiring soon
              </p>
            </div>

            <Link
              to="/deals"
              className="text-gray-400 hover:text-[rgb(0,166,62)]"
            >
              <ArrowRight size={18} />
            </Link>
          </DashboardCard>
        </div>
      </div>
    </DashboardSection>
  );
}
