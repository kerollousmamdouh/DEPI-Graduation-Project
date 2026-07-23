import { AlertTriangle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function LowStockProducts({
  products = [],
}) {
  const { lang } = useLanguage();

  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          Low Stock Products
        </h2>

        <p className="text-gray-500">
          Products that need restocking
        </p>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-4 rounded-2xl border p-4"
          >
            <img
              src={product.image}
              alt={
                product.name?.[lang] ||
                product.name?.en ||
                "Product"
              }
              className="h-14 w-14 rounded-xl object-cover"
            />

            <div className="flex-1">
              <h3 className="font-semibold">
                {product.name?.[lang] ||
                  product.name?.en ||
                  "Unknown Product"}
              </h3>

              <p className="text-sm text-gray-500">
                SKU : {product.sku || `#${product.id}`}
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-red-600">
                <AlertTriangle size={16} />

                <span className="font-bold">
                  {product.stock}
                </span>
              </div>

              <p className="text-xs text-gray-500">
                Remaining
              </p>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="py-10 text-center text-gray-400">
            Everything is in stock 🎉
          </div>
        )}
      </div>
    </div>
  );
}