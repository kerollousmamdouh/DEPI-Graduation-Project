import { useMemo, useState, useRef } from "react";
import {
  ChevronUp,
  ChevronDown,
  Star,
  Upload,
  X,
} from "lucide-react";

import { usePaymentMethods } from "../hooks/usePaymentMethods";
import { toast } from "sonner";
const PaymentMethods = () => {
  // ==========================================
  // Hook
  // ==========================================

  const {
    paymentMethods,
    loading,
    error,

    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,

    toggleStatus,
    changePriority,
    setDefault,
  } = usePaymentMethods();

  // ==========================================
  // UI State
  // ==========================================

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [selectedMethod, setSelectedMethod] =
    useState(null);

  const [deleteId, setDeleteId] =
    useState(null);

  // ==========================================
  // Form
  // ==========================================

  const emptyForm = {
    name: "",

    description: "",

    logo: "",

    brandColor: "#00A63E",

    status: "Active",

    type: "offline",

    isDefault: false,

    receiverName: "",

    receiverNumber: "",

    requireScreenshot: false,

    requireTransactionId: false,

    qrCode: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  const logoInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, logo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // Statistics
  // ==========================================

  const totalMethods =
    paymentMethods.length;

  const activeMethods =
    paymentMethods.filter(
      (item) =>
        item.status === "Active"
    ).length;

  const hiddenMethods =
    paymentMethods.filter(
      (item) =>
        item.status === "Hidden"
    ).length;

  const defaultMethod =
    paymentMethods.find(
      (item) => item.isDefault
    );

  // ==========================================
  // Filter
  // ==========================================

  const filteredMethods =
    useMemo(() => {
      let data = [...paymentMethods];

      if (statusFilter !== "all") {
        data = data.filter(
          (item) =>
            item.status === statusFilter
        );
      }

      if (search.trim()) {
        data = data.filter(
          (item) =>
            item.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        );
      }

      return data.sort(
        (a, b) =>
          a.priority - b.priority
      );
    }, [
      paymentMethods,
      search,
      statusFilter,
    ]);

    // ==========================================
  // Save
  // ==========================================

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Method name is required.");
        return;
      }

      if (!formData.logo.trim()) {
        toast.error("Logo is required.");
        return;
      }

      if (selectedMethod) {
        await updatePaymentMethod(
          selectedMethod.id,
          formData
        );
      } else {
        await addPaymentMethod({
          ...formData,
          priority:
            paymentMethods.length + 1,
        });
      }

      toast.success(
        selectedMethod
          ? "Payment method updated successfully."
          : "Payment method added successfully."
      );

      setIsModalOpen(false);
      setSelectedMethod(null);
      setFormData(emptyForm);
    } 
    catch (err) {
      toast.error(err.message);
    }
  };

  // ==========================================
  // Delete
  // ==========================================

  const handleDelete = async () => {
    try {
      await deletePaymentMethod(deleteId);

      toast.success("Payment method deleted.");

      setDeleteId(null);
    } catch (err) {
      toast.error(err.message);
    }
  };  

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">

        <h2 className="text-xl font-bold">
          Loading Payment Methods...
        </h2>

      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-100 p-6 text-red-600">

        {error}

      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ================= Header ================= */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-extrabold">

            Payment Methods

          </h1>

          <p className="mt-2 text-gray-500">

            Manage all checkout payment methods.

          </p>

        </div>

        <button
          onClick={() => {
            setSelectedMethod(null);
            setFormData(emptyForm);
            setIsModalOpen(true);
          }}
          className="rounded-xl bg-[rgb(0,166,62)] px-6 py-3 font-semibold text-white hover:bg-[rgb(0,145,55)]"
        >
          + Add Method
        </button>

      </div>

      {/* ================= Statistics ================= */}

      <div className="grid gap-5 md:grid-cols-4">

        <div className="rounded-2xl bg-white p-6 shadow">

          <p className="text-gray-500">
            Total
          </p>

          <h2 className="mt-2 text-3xl font-bold">

            {totalMethods}

          </h2>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow">

          <p className="text-gray-500">
            Active
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">

            {activeMethods}

          </h2>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow">

          <p className="text-gray-500">
            Hidden
          </p>

          <h2 className="mt-2 text-3xl font-bold text-red-500">

            {hiddenMethods}

          </h2>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow">

          <p className="text-gray-500">
            Default
          </p>

          <h2 className="mt-2 font-bold">

            {defaultMethod?.name || "-"}

          </h2>

        </div>

      </div>

      {/* ================= Search ================= */}

      <div className="flex flex-col gap-4 lg:flex-row">

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search payment method..."
          className="flex-1 rounded-xl border px-4 py-3"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="rounded-xl border px-4 py-3"
        >

          <option value="all">
            All
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Hidden">
            Hidden
          </option>

        </select>

      </div>

      {/* Part 2 */}
      {/* ================= Payment Methods ================= */}

<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

  {filteredMethods.map((method) => (

    <div
      key={method.id}
      className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >

      {/* Brand Color */}

      <div className="p-6 space-y-5">

        {/* ================= Header ================= */}

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-4">

            <img
              src={method.logo}
              alt={method.name}
              className="h-14 w-14 rounded-2xl object-contain border p-2 bg-white"
            />

            <div>

              <h3 className="text-lg font-bold">

                {method.name}

              </h3>

              <p className="text-sm text-gray-500">

                {method.description}

              </p>

            </div>

          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
              method.status === "Active"
                ? "bg-[rgb(0,166,62)]"
                : "bg-red-500"
            }`}
          >
            {method.status}
          </span>

        </div>


          {/* ================= Details ================= */}

          <div className="space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-sm text-gray-500">
                Type
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold capitalize">
                {method.type}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-sm text-gray-500">
                Brand Color
              </span>

              <div className="flex items-center gap-2">

                <div
                  className="h-5 w-5 rounded-full border"
                  style={{
                    backgroundColor:
                      method.brandColor,
                  }}
                />

                <span className="text-sm font-medium uppercase">
                  {method.brandColor}
                </span>

              </div>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-sm text-gray-500">
                Default
              </span>

              {method.isDefault ? (
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                  ⭐ Yes
                </span>
              ) : (
                <span className="text-sm text-gray-400">
                  No
                </span>
              )}

            </div>

          </div>

        {/* ================= Default ================= */}

        <button
          onClick={() =>
            setDefault(method.id)
          }
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition ${
            method.isDefault
              ? "bg-yellow-400 text-black"
              : "border border-gray-300 hover:bg-yellow-50"
          }`}
        >

          <Star
            size={18}
            fill={
              method.isDefault
                ? "currentColor"
                : "none"
            }
          />

          {method.isDefault
            ? "Default Method"
            : "Make Default"}

        </button>

        {/* ================= Priority ================= */}

        <div className="flex items-center justify-between">

          <span className="text-sm font-medium text-gray-500">
            Priority
          </span>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                changePriority(
                  method.id,
                  method.priority - 1
                )
              }
              disabled={method.priority === 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 transition hover:border-[rgb(0,166,62)] hover:bg-green-50 disabled:opacity-40"
            >
              <ChevronUp size={16} />
            </button>

            <span className="w-8 text-center font-bold">
              #{method.priority}
            </span>

            <button
              onClick={() =>
                changePriority(
                  method.id,
                  method.priority + 1
                )
              }
              disabled={
                method.priority ===
                paymentMethods.length
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 transition hover:border-[rgb(0,166,62)] hover:bg-green-50 disabled:opacity-40"
            >
              <ChevronDown size={16} />
            </button>

          </div>

        </div>

        {/* ================= Actions ================= */}

        <div className="flex gap-2">

          <button
            onClick={() =>
              toggleStatus(
                method.id,
                method.status === "Active"
                  ? "Hidden"
                  : "Active"
              )
            }
            className="flex-1 rounded-xl bg-[rgb(0,166,62)] py-2 font-semibold text-white hover:bg-[rgb(0,145,55)]"
          >
            {method.status === "Active"
              ? "Hide"
              : "Activate"}
          </button>

          <button
            onClick={() => {

              setSelectedMethod(method);

              setFormData({...method,});

              setIsModalOpen(true);

            }}
            className="rounded-xl bg-blue-500 px-4 text-white hover:bg-blue-600"
          >
            Edit
          </button>

          <button
            onClick={() =>
              setDeleteId(method.id)
            }
            className="rounded-xl bg-red-500 px-4 text-white hover:bg-red-600"
          >
            Delete
          </button>

        </div>

      </div>

    </div>

  ))}

</div>

{/* Part 3 */}
{/* ================= Add / Edit Modal ================= */}

{isModalOpen && (

  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">

      {/* ================= Header ================= */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold">

            {selectedMethod
              ? "Edit Payment Method"
              : "Add Payment Method"}

          </h2>

          <p className="mt-1 text-sm text-gray-500">

            Configure how customers pay during checkout.

          </p>

        </div>

        <button
          onClick={()=>{
            setIsModalOpen(false);
            setSelectedMethod(null);
            setFormData({...emptyForm,});
          }}
          className="rounded-xl p-2 hover:bg-gray-100"
        >
          ✕
        </button>

      </div>

      {/* ================= Form ================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        <div>

          <label className="mb-2 block font-semibold">
            Method Name
          </label>

          <input
            value={formData.name}
            onChange={(e)=>
              setFormData({
                ...formData,
                name:e.target.value,
              })
            }
            className="w-full rounded-xl border px-4 py-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">
            Logo
          </label>

          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />

          {formData.logo ? (
            <div className="relative w-full rounded-xl border border-gray-200 p-3">
              <img
                src={formData.logo}
                alt="Logo preview"
                className="h-20 w-auto object-contain mx-auto rounded-lg"
              />
              <button
                onClick={() => {
                  setFormData({ ...formData, logo: "" });
                  if (logoInputRef.current) logoInputRef.current.value = "";
                }}
                className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 text-gray-400 transition hover:border-green-500 hover:text-green-600"
            >
              <Upload size={24} />
              <span className="text-sm font-semibold">Upload Logo Image</span>
              <span className="text-xs">PNG, JPG up to 2MB</span>
            </button>
          )}

        </div>

        <div className="lg:col-span-2">

          <label className="mb-2 block font-semibold">
            Description
          </label>

          <textarea
            rows={3}
            value={formData.description}
            onChange={(e)=>
              setFormData({
                ...formData,
                description:e.target.value,
              })
            }
            className="w-full rounded-xl border px-4 py-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">
            Brand Color
          </label>

          <input
            type="color"
            value={formData.brandColor}
            onChange={(e)=>
              setFormData({
                ...formData,
                brandColor:e.target.value,
              })
            }
            className="h-12 w-full rounded-xl border"
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">
            Payment Type
          </label>

          <select
            value={formData.type}
            onChange={(e)=>
              setFormData({
                ...formData,
                type:e.target.value,
              })
            }
            className="w-full rounded-xl border px-4 py-3"
          >

            <option value="online">
              Online (Card / Gateway)
            </option>

            <option value="offline">
              Offline (Cash / Mobile Wallet)
            </option>

          </select>

        </div>

        <div>

          <label className="mb-2 block font-semibold">
            Recipient Name
          </label>

          <input
            value={formData.receiverName}
            onChange={(e)=>
              setFormData({
                ...formData,
                receiverName:e.target.value,
              })
            }
            className="w-full rounded-xl border px-4 py-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">
            Recipient Identifier         
          </label>

          <input
            value={formData.receiverNumber}
            onChange={(e)=>
              setFormData({
                ...formData,
                receiverNumber:e.target.value,
              })
            }
            className="w-full rounded-xl border px-4 py-3"
          />

        </div>

        <div className="lg:col-span-2">

          <label className="mb-2 block font-semibold">
            QR Code URL
          </label>

          <input
            value={formData.qrCode}
            onChange={(e)=>
              setFormData({
                ...formData,
                qrCode:e.target.value,
              })
            }
            className="w-full rounded-xl border px-4 py-3"
          />

        </div>

      </div>

      {/* ================= Options ================= */}

      <div className="mt-8 grid gap-4 md:grid-cols-3">

        <label className="flex items-center gap-3 rounded-xl border p-4">

          <input
            type="checkbox"
            checked={formData.requireScreenshot}
            onChange={(e)=>
              setFormData({
                ...formData,
                requireScreenshot:e.target.checked,
              })
            }
          />

          Require Screenshot

        </label>

        <label className="flex items-center gap-3 rounded-xl border p-4">

          <input
            type="checkbox"
            checked={formData.requireTransactionId}
            onChange={(e)=>
              setFormData({
                ...formData,
                requireTransactionId:e.target.checked,
              })
            }
          />

          Require Transaction ID

        </label>

        <label className="flex items-center gap-3 rounded-xl border p-4">

          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e)=>
              setFormData({
                ...formData,
                isDefault:e.target.checked,
              })
            }
          />

          Default Method

        </label>

      </div>

      {/* ================= Footer ================= */}

      <div className="mt-8 flex justify-end gap-3">

        <button
          onClick={()=>{
            setIsModalOpen(false);
            setSelectedMethod(null);
            setFormData(emptyForm);
          }}
          className="rounded-xl border px-6 py-3 font-semibold"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="rounded-xl bg-[rgb(0,166,62)] px-6 py-3 font-semibold text-white hover:bg-[rgb(0,145,55)]"
        >
          {selectedMethod
            ? "Update Method"
            : "Save Method"}
        </button>

      </div>

    </div>

  </div>

)}

{/* ================= Delete Modal ================= */}

{deleteId && (

  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

    <div className="w-full max-w-md rounded-3xl bg-white p-8">

      <h2 className="text-2xl font-bold">

        Delete Payment Method

      </h2>

      <p className="mt-3 text-gray-500">

        Are you sure you want to delete this payment method?

      </p>

      <div className="mt-8 flex justify-end gap-3">

        <button
          onClick={()=>setDeleteId(null)}
          className="rounded-xl border px-6 py-3"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
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
};

export default PaymentMethods;