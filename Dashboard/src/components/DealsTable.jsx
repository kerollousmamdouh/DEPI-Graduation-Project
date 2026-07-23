import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

// بيانات تجريبية لجدول الصفقات — استبدلها ببيانات حقيقية
const deals = [
  {
    id: 1,
    name: "Organic Bananas (1kg)",
    location: "6096 Marjolaine Landing",
    dateTime: "12.09.2026 - 12.53 PM",
    piece: 423,
    amount: "$1,057",
    status: "Delivered",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=64&h=64&fit=crop",
  },
  {
    id: 2,
    name: "Fresh Milk (1L)",
    location: "1234 Ocean Drive",
    dateTime: "11.09.2026 - 09.10 AM",
    piece: 210,
    amount: "$378",
    status: "Pending",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=64&h=64&fit=crop",
  },
  {
    id: 3,
    name: "Sourdough Bread Loaf",
    location: "77 Maple Street",
    dateTime: "10.09.2026 - 04.45 PM",
    piece: 87,
    amount: "$278",
    status: "Cancelled",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=64&h=64&fit=crop",
  },
];

const statusStyles = {
  Delivered: "bg-emerald-100 text-emerald-600",
  Pending: "bg-amber-100 text-amber-600",
  Cancelled: "bg-rose-100 text-rose-600",
};

export default function DealsTable() {
  const [month, setMonth] = useState("October");
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t("dealsDetails")}</h2>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-200 bg-white rounded-lg text-sm text-gray-500 px-3 py-1.5 outline-none"
        >
          {["October", "November", "December"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              <th className="py-3 px-4 rounded-l-lg rtl:rounded-l-none rtl:rounded-r-lg font-medium">
                {t("productName")}
              </th>
              <th className="py-3 px-4 font-medium">{t("location")}</th>
              <th className="py-3 px-4 font-medium">{t("dateTime")}</th>
              <th className="py-3 px-4 font-medium">{t("piece")}</th>
              <th className="py-3 px-4 font-medium">{t("amount")}</th>
              <th className="py-3 px-4 rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg font-medium">
                {t("status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr
                key={d.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
              >
                <td className="py-4 px-4 flex items-center gap-3 text-gray-800 font-medium">
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-8 h-8 rounded-full object-cover bg-gray-200"
                  />
                  {d.name}
                </td>
                <td className="py-4 px-4 text-gray-600">{d.location}</td>
                <td className="py-4 px-4 text-gray-600">{d.dateTime}</td>
                <td className="py-4 px-4 text-gray-600">{d.piece}</td>
                <td className="py-4 px-4 text-gray-600">{d.amount}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold ${statusStyles[d.status]}`}
                  >
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
