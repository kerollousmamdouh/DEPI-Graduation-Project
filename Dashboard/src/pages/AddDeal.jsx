import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ImagePlus } from "lucide-react";

import { useDeals } from "../Hooks/useDeals";
import { useCategories } from "../Hooks/useCategories";

export default function AddDeal() {
  const navigate = useNavigate();

  const { addDeal } = useDeals();
  const { categories = [] } = useCategories();

  const [form, setForm] = useState({
    title: "",
    banner: "",
    category: "",
    discountType: "Percentage",
    discountValue: "",
    products: "",
    startDate: "",
    endDate: "",
    status: "Active",
    description: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    addDeal({
      ...form,
      discountValue: Number(form.discountValue),
      products: Number(form.products),
      createdAt: new Date().toISOString().split("T")[0],
    });

    navigate("/deals");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Create Deal
          </h1>

          <p className="mt-2 text-gray-500">
            Create a new promotional offer.
          </p>
        </div>

        <Link
          to="/deals"
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        <div className="rounded-3xl bg-white p-8 shadow">
          <div className="grid gap-6 md:grid-cols-2">

            {/* Title */}

            <div>
              <label className="mb-2 block font-medium">
                Deal Title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            {/* Category */}

            <div>
              <label className="mb-2 block font-medium">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              >
                <option value="" className="">
                  Select Category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.name}
                    className=""
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Banner */}

            <div className="md:col-span-2">
              <label className="mb-2 block font-medium">
                Banner Image
              </label>

              <div className="flex gap-3">
                <input
                  name="banner"
                  value={form.banner}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
                />

              </div>
            </div>

            {/* Description */}

            <div className="md:col-span-2">
              <label className="mb-2 block font-medium">
                Description
              </label>

              <textarea
                rows={4}
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            {/* Discount Type */}

            <div>
              <label className="mb-2 block font-medium">
                Discount Type
              </label>

              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              >
                <option value="Percentage" className="">
                  Percentage
                </option>

                <option value="Fixed" className="">
                  Fixed
                </option>
              </select>
            </div>

            {/* Discount */}

            <div>
              <label className="mb-2 block font-medium">
                Discount Value
              </label>

              <input
                type="number"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            {/* Products */}

            <div>
              <label className="mb-2 block font-medium">
                Products Count
              </label>

              <input
                type="number"
                name="products"
                value={form.products}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            {/* Status */}

            <div>
              <label className="mb-2 block font-medium">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              >
                <option value="Active" className="">
                  Active
                </option>

                <option value="Scheduled" className="">
                  Scheduled
                </option>

                <option value="Paused" className="">
                  Paused
                </option>
              </select>
            </div>

            {/* Start */}

            <div>
              <label className="mb-2 block font-medium">
                Start Date
              </label>

              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            {/* End */}

            <div>
              <label className="mb-2 block font-medium">
                End Date
              </label>

              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">

          <Link
            to="/deals"
            className="rounded-xl border border-gray-200 px-6 py-3 hover:bg-gray-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-[rgb(0,166,62)] px-6 py-3 font-semibold text-white hover:bg-[rgb(0,145,55)]"
          >
            <Save size={18} />
            Save Deal
          </button>

        </div>
      </form>
    </div>
  );
}
