import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon,
  color,
  change,
  positive = true,
}) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>

        {change && (
          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              positive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {positive ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}

            {change}
          </div>
        )}
      </div>

      <h3 className="mt-6 text-sm font-medium text-gray-500">
        {title}
      </h3>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}