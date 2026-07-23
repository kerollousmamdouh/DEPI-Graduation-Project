import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function LatestOrders({
  orders = [],
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Latest Orders
          </h2>

          <p className="text-gray-500">
            Recently placed orders
          </p>
        </div>

        <Link
          to="/orders"
          className="flex items-center gap-2 text-sm font-semibold text-[rgb(0,166,62)] hover:underline"
        >
          View All

          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-3 py-3 text-left">
                Order
              </th>

              <th className="px-3 py-3 text-left">
                Customer
              </th>

              <th className="px-3 py-3 text-center">
                Total
              </th>

              <th className="px-3 py-3 text-center">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b last:border-none hover:bg-gray-50"
              >
                <td className="px-3 py-4 font-semibold">
                  #{order.id}
                </td>

                <td className="px-3 py-4">
                  {order.customerName}
                </td>

                <td className="px-3 py-4 text-center font-semibold">
                  ${order.total}
                </td>

                <td className="px-3 py-4 text-center">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="py-10 text-center text-gray-400">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}