import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ActiveDeals({
  deals = [],
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Active Deals
          </h2>

          <p className="text-gray-500">
            Running promotions
          </p>
        </div>

        <Link
          to="/deals"
          className="flex items-center gap-2 text-sm font-semibold text-[rgb(0,166,62)] hover:underline"
        >
          View All

          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="space-y-4">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4"
          >
            <img
              src={deal.banner}
              alt={deal.title}
              className="h-16 w-16 rounded-xl object-cover"
            />

            <div className="flex-1">
              <h3 className="font-bold text-gray-900">
                {deal.title}
              </h3>

              <p className="text-sm text-gray-500">
                {deal.discountValue}
                {deal.discountType ===
                "Percentage"
                  ? "%"
                  : "$"}{" "}
                OFF
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {deal.status}
            </span>
          </div>
        ))}

        {deals.length === 0 && (
          <div className="py-10 text-center text-gray-400">
            No active deals.
          </div>
        )}
      </div>
    </div>
  );
}