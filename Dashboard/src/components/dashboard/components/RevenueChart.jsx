import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import DashboardCard from "../shared/DashboardCard";
import DashboardSectionHeader from "../shared/DashboardSectionHeader";

export default function RevenueChart({ data = [] }) {
  return (
    <DashboardCard>
      <DashboardSectionHeader
        title="Revenue Overview"
        subtitle="Revenue during the year"
      />

      {/* Empty State */}
      {data.length === 0 ? (
        <div className="flex h-80 items-center justify-center text-gray-400">
          No revenue data available
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#00A63E"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="#00A63E"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000}k`}
              />

              <Tooltip
                formatter={(value) => [
                  `EGP ${Number(value).toLocaleString()}`,
                  "Revenue",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 8px 24px rgba(0,0,0,.12)",
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00A63E"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  );
}