import DashboardCard from "../shared/DashboardCard";
import DashboardSectionHeader from "../shared/DashboardSectionHeader";
import DashboardListItem from "../shared/DashboardListItem";
import { useLanguage } from "../../../context/LanguageContext";

export default function LatestOrders({
  orders = [],
}) {
  const { lang } = useLanguage();

  return (
    <DashboardCard>
      <DashboardSectionHeader
        title="Latest Orders"
        subtitle="Most recent customer orders"
      />

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.slice(0, 5).map((order) => (
            <DashboardListItem key={order.id}>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {order.customerName ||
                    order.name ||
                    "Unknown Customer"}
                </h3>

                <p className="text-sm text-gray-500">
                  #{order.id}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  {order.total
                    ? `${order.total} EGP`
                    : "--"}
                </p>

                <p className="text-xs text-gray-500">
                  {order.status || "Pending"}
                </p>
              </div>
            </DashboardListItem>
          ))
        ) : (
          <div className="py-10 text-center text-gray-400">
            No recent orders.
          </div>
        )}
      </div>
    </DashboardCard>
  );
}