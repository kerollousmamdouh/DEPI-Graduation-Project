import React from "react";
import { useLanguage } from "../../context/LanguageContext";

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * StockTable
 * Props:
 * - items: array من عناصر المخزون { id, image, name, category, price, piece, colors }
 * - onEdit(id), onDelete(id)
 */
export default function StockTable({ items, onEdit = () => {}, onDelete = () => {} }) {
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
        No products match your search.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-colors duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right">
          <thead>
            <tr className="text-gray-700 border-b border-gray-100">
              <th className="py-4 px-6 font-semibold">{t("image")}</th>
              <th className="py-4 px-6 font-semibold">{t("productName")}</th>
              <th className="py-4 px-6 font-semibold">{t("category")}</th>
              <th className="py-4 px-6 font-semibold">{t("price")}</th>
              <th className="py-4 px-6 font-semibold">{t("piece")}</th>
              <th className="py-4 px-6 font-semibold">{t("availableColor")}</th>
              <th className="py-4 px-6 font-semibold">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
              >
                <td className="py-3 px-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                  />
                </td>
                <td className="py-3 px-6 font-semibold text-gray-800">
                  {item.name}
                </td>
                <td className="py-3 px-6 text-gray-600">{item.category}</td>
                <td className="py-3 px-6 text-gray-600">{item.price}</td>
                <td className="py-3 px-6 text-gray-600">{item.piece}</td>
                <td className="py-3 px-6">
                  <div className="flex items-center gap-1.5">
                    {item.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </td>
                <td className="py-3 px-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(item.id)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      aria-label="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="w-8 h-8 rounded-lg border border-rose-200 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                      aria-label="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
