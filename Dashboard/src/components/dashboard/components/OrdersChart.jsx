import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import DashboardCard from "../shared/DashboardCard";
import DashboardSectionHeader from "../shared/DashboardSectionHeader";

export default function OrdersChart({ data = [] }) {
  const totalOrders = data.reduce(
    (total, item) => total + item.orders,
    0
  );

  return (
    <DashboardCard>
      <DashboardSectionHeader
        title="Weekly Orders"
        subtitle="Orders during the last 7 days"
        action={
          <div className="rounded-xl bg-green-50 px-4 py-2">
            <span className="text-sm font-semibold text-green-600">
              {totalOrders} Orders
            </span>
          </div>
        }
      />

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              cursor={{
                fill: "rgba(0,166,62,.08)",
              }}
            />

            <Bar
              dataKey="orders"
              fill="#00A63E"
              radius={[8, 8, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}