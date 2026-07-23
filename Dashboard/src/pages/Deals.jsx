import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Tag,
  Calendar,
  Package,
  CheckCircle,
  Pencil,
  Trash2,
  Pause,
  Play,
} from "lucide-react";

import { useDeals } from "../Hooks/useDeals";
import { useCategories } from "../Hooks/useCategories";
import HasPermission from "../components/HasPermission";

export default function Deals() {
  const {
    stats,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    deals,
    toggleStatus,
    deleteDeal,
  } = useDeals();

  // Selected deal ID for the delete modal
  const [deleteId, setDeleteId] = useState(null);

  // Categories
  const { categories: mainCategories = [] } = useCategories();

  // Handler to perform deletion
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteDeal(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="mt-2 text-gray-500">
            Manage promotional offers and discounts.
          </p>
        </div>

        <HasPermission resource="deals" action="add">
          <Link
            to="/deals/add"
            className="flex items-center gap-2 rounded-xl bg-[rgb(0,166,62)] px-5 py-3 font-semibold text-white hover:bg-[rgb(0,145,55)]"
          >
            <Plus size={18} />
            Create Deal
          </Link>
        </HasPermission>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow">
          <Tag className="mb-4 text-green-600" size={30} />
          <h3 className="text-3xl font-bold text-gray-900">{stats.active}</h3>
          <p className="text-gray-500">Active Deals</p>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow">
          <Calendar className="mb-4 text-yellow-500" size={30} />
          <h3 className="text-3xl font-bold text-gray-900">{stats.scheduled}</h3>
          <p className="text-gray-500">Scheduled</p>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow">
          <CheckCircle className="mb-4 text-red-500" size={30} />
          <h3 className="text-3xl font-bold text-gray-900">{stats.expired}</h3>
          <p className="text-gray-500">Expired</p>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow">
          <Package className="mb-4 text-blue-500" size={30} />
          <h3 className="text-3xl font-bold text-gray-900">{stats.products}</h3>
          <p className="text-gray-500">Products</p>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow">
          <Tag className="mb-4 text-purple-500" size={30} />
          <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
          <p className="text-gray-500">Total Deals</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals..."
              className="w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 py-3 text-gray-900 outline-none focus:border-green-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500"
          >
            <option>All</option>
            <option>Active</option>
            <option>Scheduled</option>
            <option>Paused</option>
            <option>Expired</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500"
          >
            <option value="All">All</option>

            {mainCategories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deals Table */}
      <div className="overflow-hidden rounded-3xl bg-white border border-gray-100 shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-500">Banner</th>
                <th className="px-6 py-4 text-left text-gray-500">Deal</th>
                <th className="px-6 py-4 text-center text-gray-500">Discount</th>
                <th className="px-6 py-4 text-center text-gray-500">Products</th>
                <th className="px-6 py-4 text-center text-gray-500">Start</th>
                <th className="px-6 py-4 text-center text-gray-500">End</th>
                <th className="px-6 py-4 text-center text-gray-500">Status</th>
                <th className="px-6 py-4 text-center text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deals.map((deal) => (
                <tr key={deal.id} className="border-t border-gray-100 hover:bg-gray-50">
                  {/* Banner */}
                  <td className="px-6 py-5">
                    <img
                      src={deal.banner}
                      alt={deal.title}
                      className="h-16 w-24 rounded-xl object-cover"
                    />
                  </td>

                  {/* Deal */}
                  <td className="px-6 py-5">
                    <h3 className="font-semibold text-gray-900">{deal.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {deal.category}
                    </p>
                  </td>

                  {/* Discount */}
                  <td className="px-6 py-5 text-center font-semibold text-gray-900">
                    {deal.discountType === "Percentage"
                      ? `${deal.discountValue}%`
                      : `${deal.discountValue} EGP`}
                  </td>

                  {/* Products */}
                  <td className="px-6 py-5 text-center text-gray-900">{deal.products}</td>

                  {/* Start */}
                  <td className="px-6 py-5 text-center text-gray-900">{deal.startDate}</td>

                  {/* End */}
                  <td className="px-6 py-5 text-center text-gray-900">{deal.endDate}</td>

                  {/* Status */}
                  <td className="px-6 py-5 text-center">
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        deal.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : deal.status === "Paused"
                          ? "bg-yellow-100 text-yellow-700"
                          : deal.status === "Scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {deal.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <HasPermission resource="deals" action="edit">
                        <Link
                          to={`/deals/edit/${deal.id}`}
                          className="rounded-xl bg-blue-500 p-2 text-white transition hover:bg-blue-600"
                        >
                          <Pencil size={18} />
                        </Link>
                      </HasPermission>

                      <HasPermission resource="deals" action="edit">
                        <button
                          onClick={() => toggleStatus(deal.id)}
                          className={`rounded-xl p-2 text-white transition ${
                            deal.status === "Paused"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-yellow-500 hover:bg-yellow-600"
                          }`}
                        >
                          {deal.status === "Paused" ? (
                            <Play size={18} />
                          ) : (
                            <Pause size={18} />
                          )}
                        </button>
                      </HasPermission>

                      <HasPermission resource="deals" action="delete">
                        <button
                          onClick={() => setDeleteId(deal.id)}
                          className="rounded-xl bg-red-500 p-2 text-white transition hover:bg-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </HasPermission>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deals.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white p-14 text-center">
          <Tag size={60} className="mx-auto mb-5 text-gray-300" />
          <h3 className="text-2xl font-bold text-gray-900">No Deals Found</h3>
          <p className="mt-3 text-gray-500">
            Create your first promotional deal.
          </p>
          <HasPermission resource="deals" action="add">
            <Link
              to="/deals/add"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[rgb(0,166,62)] px-6 py-3 font-semibold text-white hover:bg-[rgb(0,145,55)]"
            >
              <Plus size={18} />
              Create Deal
            </Link>
          </HasPermission>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900">Delete Deal</h2>
            <p className="mt-3 text-gray-500">
              Are you sure you want to delete this deal? This action cannot be undone.
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
