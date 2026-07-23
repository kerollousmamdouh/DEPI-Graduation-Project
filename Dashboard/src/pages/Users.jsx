// dashboard/src/pages/Users.jsx
import { useMemo, useState } from "react";
import {
  Mail,
  UserPlus,
  Ban,
  Pencil,
  Trash2,
  Trophy,
  Search,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useUsers } from "../hooks/useUsers";
import HasPermission from "../components/HasPermission";

const CustomCheckbox = ({ checked, onChange }) => (
  <label className="relative flex cursor-pointer items-center justify-center rounded-full">
    <input
      type="checkbox"
      className="peer sr-only"
      checked={checked}
      onChange={onChange}
    />
    <div className="h-5 w-5 rounded-full border-2 border-gray-300 bg-white transition-all peer-checked:border-[rgb(0,166,62)] peer-checked:bg-[rgb(0,166,62)] shadow-sm"></div>
    <svg
      className="absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </label>
);

const Users = () => {
  const {
    users,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser,
    toggleStatus,
    sendMessage,
  } = useUsers();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [topNFilter, setTopNFilter] = useState("");
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const emptyForm = {
    avatar: "",
    name: "",
    email: "",
    password: "",
    status: "Active",
  };

  const [formData, setFormData] = useState(emptyForm);

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Full Name is required.");
        return;
      }
      if (!formData.email.trim()) {
        toast.error("Email is required.");
        return;
      }
      if (!formData.password.trim() && !selectedUser) {
        toast.error("Password is required for new users.");
        return;
      }

      if (selectedUser) {
        await updateUser(selectedUser.id, formData);
      } else {
        await addUser(formData);
      }

      setSelectedUser(null);
      setFormData(emptyForm);
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteId);
      setDeleteId(null);
      setSelectedUsers(selectedUsers.filter(id => id !== deleteId));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast.error("Please write your message.");
      return;
    }
    try {
      await sendMessage(selectedUsers, broadcastMessage);
      setBroadcastMessage("");
      setSelectedUsers([]);
      setIsBroadcastOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const toggleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "Active").length;
  const blockedUsers = users.filter((user) => user.status === "Blocked").length;

  const filteredUsers = useMemo(() => {
    let data = [...users];

    if (statusFilter !== "all") {
      data = data.filter((user) => user.status === statusFilter);
    }

    if (search.trim()) {
      const value = search.toLowerCase();
      data = data.filter(
        (user) =>
          user.name.toLowerCase().includes(value) ||
          user.email.toLowerCase().includes(value) ||
          (user.phone && user.phone.includes(value))
      );
    }

    data.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));

    const topN = parseInt(topNFilter, 10);
    if (!isNaN(topN) && topN > 0) {
      data = data.slice(0, topN);
    }

    return data;
  }, [users, search, statusFilter, topNFilter]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <h2 className="text-xl font-bold text-gray-500 animate-pulse">
          Loading Users...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ================= Header ================= */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Users Management</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Manage your registered customers, block accounts, and track their spending.
          </p>
        </div>
        <div>
          <button
            onClick={() => {
              setSelectedUser(null);
              setFormData(emptyForm);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[rgb(0,166,62)] px-6 py-3 font-bold text-white shadow-sm transition hover:bg-[rgb(0,145,55)] hover:shadow-md"
          >
            <UserPlus size={18} />
            Add New User
          </button>
        </div>
      </div>

      {/* ================= Statistics ================= */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-gray-400">Total Users</p>
          <h2 className="mt-2 text-4xl font-black text-gray-900">{totalUsers}</h2>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-green-600">Active Users</p>
          <h2 className="mt-2 text-4xl font-black text-green-700">{activeUsers}</h2>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-red-600">Blocked Users</p>
          <h2 className="mt-2 text-4xl font-black text-red-700">{blockedUsers}</h2>
        </div>
      </div>

      {/* ================= Modern Filters & Search ================= */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-gray-200 bg-white ps-12 pe-4 py-3.5 text-sm font-semibold text-gray-900 outline-none transition-all focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-[rgb(0,166,62)]/10 shadow-sm"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative lg:w-48 w-full">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-700 outline-none transition-all focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-[rgb(0,166,62)]/10 shadow-sm cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Blocked">Blocked Only</option>
          </select>
          <ChevronDown className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>

        {/* Top N Best Users Input */}
        <div className="relative lg:w-56 w-full">
          <Trophy className="absolute start-4 top-1/2 -translate-y-1/2 text-yellow-500" size={18} />
          <input
            type="number"
            min="1"
            value={topNFilter}
            onChange={(e) => setTopNFilter(e.target.value)}
            placeholder="Top Users (e.g. 5)"
            className="w-full rounded-xl border border-gray-200 bg-white ps-12 pe-4 py-3.5 text-sm font-bold text-gray-900 outline-none transition-all focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 shadow-sm"
          />
        </div>
      </div>

      {/* ================= Bulk Action Banner (Send Message) ================= */}
      <div className={`transition-all duration-300 overflow-hidden ${selectedUsers.length > 0 ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0'}`}>
        <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 px-6 py-4 md:flex-row md:items-center md:justify-between shadow-sm">
          <p className="font-bold text-blue-800 text-sm">
            <span className="text-xl me-2">{selectedUsers.length}</span>
            Users selected for action
          </p>
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Mail size={18} />
            Send Promotional Message
          </button>
        </div>
      </div>

      {/* ================= Modern Users Table ================= */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 w-16">
                  <CustomCheckbox
                    checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-5 font-black text-gray-500 uppercase tracking-wider text-xs">Customer</th>
                <th className="px-6 py-5 font-black text-gray-500 uppercase tracking-wider text-xs text-center">Orders</th>
                <th className="px-6 py-5 font-black text-gray-500 uppercase tracking-wider text-xs text-center">Total Spent</th>
                <th className="px-6 py-5 font-black text-gray-500 uppercase tracking-wider text-xs text-center">Status</th>
                <th className="px-6 py-5 font-black text-gray-500 uppercase tracking-wider text-xs text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-bold">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const isTop3 = topNFilter && index < 3;
                  return (
                    <tr key={user.id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <CustomCheckbox
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              src={user.avatar || "https://i.pravatar.cc/150"}
                              alt={user.name}
                              className="h-12 w-12 rounded-full object-cover border border-gray-200 shadow-sm"
                            />
                            {isTop3 && (
                              <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                                <Trophy size={16} className={index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-amber-700"} />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-gray-900">{user.name}</h3>
                            <p className="text-xs font-medium text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-extrabold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                          {user.totalOrders || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-black text-[rgb(0,166,62)] text-base">
                          EGP {user.totalSpent?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <HasPermission resource="users" action="edit">
                            <button
                              title="Edit User"
                              onClick={() => {
                                setSelectedUser(user);
                                setFormData({
                                  avatar: user.avatar || "",
                                  name: user.name || "",
                                  email: user.email || "",
                                  password: user.password || "",
                                  status: user.status || "Active",
                                });
                                setIsModalOpen(true);
                              }}
                              className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                          </HasPermission>
                          <HasPermission resource="users" action="edit">
                            <button
                              title={user.status === "Active" ? "Block User" : "Unblock User"}
                              onClick={() => toggleStatus(user.id)}
                              className={`rounded-xl border p-2 transition-colors ${
                                user.status === "Active"
                                  ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                  : "border-green-200 text-green-600 hover:bg-green-50"
                              }`}
                            >
                              <Ban size={16} />
                            </button>
                          </HasPermission>
                          <HasPermission resource="users" action="delete">
                            <button
                              title="Delete User"
                              onClick={() => setDeleteId(user.id)}
                              className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </HasPermission>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= Add / Edit User Modal ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {selectedUser ? "Edit Customer" : "Add New Customer"}
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  Manage core login and profile credentials.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUser(null);
                  setFormData(emptyForm);
                }}
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-black text-gray-700 uppercase tracking-wide">
                  Full Name (Ar/En)
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-4 py-3 text-sm font-semibold outline-none focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-[rgb(0,166,62)]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black text-gray-700 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-4 py-3 text-sm font-semibold outline-none focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-[rgb(0,166,62)]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black text-gray-700 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={selectedUser ? "Leave empty to keep current" : "Required"}
                  className="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-4 py-3 text-sm font-semibold outline-none focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-[rgb(0,166,62)]/10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-black text-gray-700 uppercase tracking-wide">
                  Avatar Image URL
                </label>
                <input
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-4 py-3 text-sm font-semibold outline-none focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-[rgb(0,166,62)]/10"
                />
              </div>

              <div className="md:col-span-2 relative">
                <label className="mb-1.5 block text-xs font-black text-gray-700 uppercase tracking-wide">
                  Account Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white text-gray-900 px-4 py-3 text-sm font-semibold outline-none focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-[rgb(0,166,62)]/10 cursor-pointer"
                >
                  <option value="Active">Active (Can Login)</option>
                  <option value="Blocked">Blocked (Restricted)</option>
                </select>
                <ChevronDown className="absolute end-4 top-[38px] text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUser(null);
                  setFormData(emptyForm);
                }}
                className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-[rgb(0,166,62)] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[rgb(0,145,55)] transition"
              >
                {selectedUser ? "Update User" : "Save New User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Delete Modal ================= */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Delete User Account</h2>
            <p className="mt-2 text-sm font-medium text-gray-500 leading-relaxed">
              Are you sure you want to permanently delete this user? All their login credentials will be removed.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Broadcast Modal ================= */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900">Send Promotional Message</h2>
              <p className="mt-1.5 text-sm font-medium text-gray-500">
                This message will be added directly to the chat history of
                <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mx-1">
                  {selectedUsers.length}
                </span>
                selected users.
              </p>
            </div>
            <textarea
              rows={6}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Write your announcement, coupon, or offer here..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all focus:bg-white focus:border-[rgb(0,166,62)] focus:ring-4 focus:ring-[rgb(0,166,62)]/10"
            />
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  setBroadcastMessage("");
                  setIsBroadcastOpen(false);
                }}
                className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcast}
                className="flex items-center gap-2 rounded-xl bg-[rgb(0,166,62)] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[rgb(0,145,55)] transition"
              >
                <Mail size={16} />
                Send Messages Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
