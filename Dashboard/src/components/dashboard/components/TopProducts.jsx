import { TrendingUp, TrendingDown } from "lucide-react";
import DashboardCard from "../shared/DashboardCard";
import DashboardSectionHeader from "../shared/DashboardSectionHeader";
import DashboardListItem from "../shared/DashboardListItem";
import { useLanguage } from "../../../context/LanguageContext";

export default function TopProducts({
  products = [],
}) {
  const { lang } = useLanguage();

  return (
    <DashboardCard>
      <DashboardSectionHeader
        title="Top Selling Products"
        subtitle="Best performing products"
      />

      <div className="space-y-4">
        {products.map((product, index) => {
          const productName =
            (lang === "ar" ? product.name_ar : product.name_en) ||
            product.name_en ||
            product.name_ar ||
            "Unknown Product";

          const change = Number(product.change ?? 0);
          const isUp = change >= 0;

          return (
            <DashboardListItem key={product.id}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-600">
                #{index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="truncate font-semibold text-gray-900">
                  {productName}
                </h3>

                <p className="text-sm text-gray-500">
                  {(product.units_sold ?? 0).toLocaleString()} sold
                  {product.total_revenue
                    ? ` · EGP ${product.total_revenue.toLocaleString()}`
                    : ""}
                </p>
              </div>

              <div
                className={`flex items-center gap-1 text-sm font-semibold ${
                  isUp ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(change)}%
              </div>
            </DashboardListItem>
          );
        })}

        {products.length === 0 && (
          <div className="py-10 text-center text-gray-400">
            No products found.
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
