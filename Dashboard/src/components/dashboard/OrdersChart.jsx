import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function OrdersChart({ data }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Weekly Orders
          </h2>

          <p className="text-gray-500">
            Orders during the last 7 days
          </p>
        </div>

        <div className="rounded-xl bg-green-50 px-4 py-2">
          <span className="text-sm font-semibold text-green-600">
            {data.reduce(
              (total, item) => total + item.orders,
              0
            )}{" "}
            Orders
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
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
    </div>
  );
}