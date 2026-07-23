import { AlertTriangle } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

import DashboardCard from "../shared/DashboardCard";
import DashboardSectionHeader from "../shared/DashboardSectionHeader";
import DashboardListItem from "../shared/DashboardListItem";

export default function LowStockProducts({
  products = [],
}) {
  const { lang } = useLanguage();

  if (!products.length) {
    return (
      <DashboardCard>
        <DashboardSectionHeader
          title="Low Stock Products"
          subtitle="Products that need restocking"
        />

        <div className="flex h-40 items-center justify-center text-gray-400">
          Everything is in stock 🎉
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <DashboardSectionHeader
        title="Low Stock Products"
        subtitle="Products that need restocking"
      />

      <div className="space-y-3">
        {products.map((product) => {
          const productName =
            product.name?.[lang] ??
            product.name?.en ??
            "Unknown Product";

          return (
            <DashboardListItem key={product.id}>
              <img
                src={product.image}
                alt={productName}
                className="h-14 w-14 rounded-xl object-cover"
              />

              <div className="flex-1 min-w-0">
                <h3 className="truncate font-semibold text-gray-900">
                  {productName}
                </h3>

                <p className="text-sm text-gray-500">
                  SKU: {product.sku || `#${product.id}`}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-red-600">
                  <AlertTriangle size={14} />

                  <span className="text-sm font-semibold">
                    {product.stock}
                  </span>
                </div>

                <span className="text-xs text-gray-500">
                  Remaining
                </span>
              </div>
            </DashboardListItem>
          );
        })}
      </div>
    </DashboardCard>
  );
}