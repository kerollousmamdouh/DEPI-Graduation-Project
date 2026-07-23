import { Star } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function TopProducts({
  products = [],
}) {
  const { lang } = useLanguage();

  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          Top Selling Products
        </h2>

        <p className="text-gray-500">
          Best performing products
        </p>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="flex items-center gap-4 rounded-2xl border p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-600">
              #{index + 1}
            </div>

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
                {product.sales || 0} Sales
              </p>
            </div>

            <div className="flex items-center gap-1 text-yellow-500">
              <Star
                size={18}
                fill="currentColor"
              />

              <span className="font-semibold">
                {product.rating || 5.0}
              </span>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="py-10 text-center text-gray-400">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}