import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../services/apiClient";
import { teamService } from "../services/teamService";
import PasswordConfirmModal from "../components/PasswordConfirmModal";
import {
  Mail,
  Phone,
  Briefcase,
  Camera,
  Save,
  UserCircle,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

function Field({ label, hint, icon, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-600">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        {hint && (
          <span className="text-xs font-normal text-gray-400">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border-b-2 border-gray-100 bg-transparent px-0 py-2.5 text-gray-900 outline-none transition-colors focus:border-[rgb(0,166,62)]";

export default function Settings() {
  const { lang, t } = useLanguage();
  const { user, setUser, isOwner } = useAuth();
  const fileInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUpdatedData, setPendingUpdatedData] = useState(null);
  const [pendingMergedUser, setPendingMergedUser] = useState(null);

  // ربط بيانات الـ state ببيانات الـ user اللي مسجل دخول
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    jobTitle: user?.jobTitle || "",
    bio: user?.bio || "",
    password: "",
    avatar: user?.avatar || "https://randomuser.me/api/portraits/men/75.jpg",
  });

  // تحديث الـ Form لو الـ user اتغير
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        jobTitle: user.jobTitle || "",
        bio: user.bio || "",
        password: "", // never prefilled — blank means "keep current password"
        avatar: user.avatar || "https://randomuser.me/api/portraits/men/75.jpg",
      });
    }
  }, [user]);

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((f) => ({ ...f, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const updatedData = {
      name: form.fullName,
      email: form.email,
      phone: form.phone,
      // Only send a password if the person actually typed a new one.
      ...(form.password ? { password: form.password } : {}),
    };
    const mergedUser = {
      ...user,
      ...form,
      fullName: form.fullName,
      password: undefined,
    };

    if (isOwner) {
      await persistProfile(updatedData, mergedUser);
    } else {
      // Non-owners can see and edit their own info here, but saving it
      // requires the owner's password as a confirmation step.
      setPendingUpdatedData(updatedData);
      setPendingMergedUser(mergedUser);
      setConfirmOpen(true);
    }
  };

  const persistProfile = async (updatedData, mergedUser) => {
    try {
      await apiClient.put("/auth/profile", updatedData);

      setUser(mergedUser);
      localStorage.setItem("currentUser", JSON.stringify(mergedUser));
      setForm((f) => ({ ...f, password: "" }));

      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  const handleConfirmOwnerPassword = async (password) => {
    const result = await teamService.verifyOwnerPassword(password);
    if (!result?.valid) {
      throw new Error("Incorrect password. Please try again.");
    }
    setConfirmOpen(false);
    await persistProfile(pendingUpdatedData, pendingMergedUser);
    setPendingUpdatedData(null);
    setPendingMergedUser(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 px-4">
      {/* Profile band */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] p-8 text-white">
        <div className="pointer-events-none absolute -left-20 -bottom-24 h-72 w-72 rounded-full bg-[rgb(0,166,62)]/20 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="group relative shrink-0">
            <div className="h-28 w-28 overflow-hidden rounded-3xl border-2 border-white/10 bg-white/5 ring-4 ring-white/10">
              <img
                src={form.avatar}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-[rgb(0,166,62)] text-white shadow-lg transition hover:bg-[rgb(0,145,55)] active:scale-95"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-white/50">
              {t("adminProfile")}
            </p>
            <h1 className="mt-1 text-3xl font-bold">{form.fullName || "—"}</h1>
            <p className="mt-1 text-white/60">
              {form.jobTitle || "No job title set"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Details */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8">
          <h3 className="mb-6 flex items-center gap-2 text-base font-bold text-gray-900">
            <UserCircle size={18} className="text-[rgb(0,166,62)]" /> Personal
            information
          </h3>

          <div className="grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2">
            <Field label="Full Name">
              <input
                value={form.fullName}
                onChange={update("fullName")}
                className={inputClass}
              />
            </Field>

            <Field
              label="Job Title"
              icon={<Briefcase size={14} className="text-gray-400" />}
            >
              <input
                value={form.jobTitle}
                onChange={update("jobTitle")}
                className={inputClass}
              />
            </Field>

            <Field
              label="Email"
              icon={<Mail size={14} className="text-gray-400" />}
            >
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                className={inputClass}
              />
            </Field>

            <Field
              label="Phone Number"
              icon={<Phone size={14} className="text-gray-400" />}
            >
              <input
                value={form.phone}
                onChange={update("phone")}
                className={inputClass}
              />
            </Field>

            <Field
              label="New Password"
              hint="Leave blank to keep current"
              icon={<KeyRound size={14} className="text-gray-400" />}
            >
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update("password")}
                  className={`${inputClass} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-0 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            <div className="md:col-span-2">
              <Field label="Bio">
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={update("bio")}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          </div>
        </div>

        {!isOwner && (
          <p className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-700">
            Saving changes to your profile requires the administrator's password
            to confirm.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-[rgb(0,166,62)] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[rgb(0,166,62)]/20 transition-all hover:-translate-y-0.5 hover:bg-[rgb(0,145,55)] active:translate-y-0 active:scale-[0.98]"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </form>

      <PasswordConfirmModal
        open={confirmOpen}
        title="Confirm profile changes"
        description="Enter the administrator's password to save these changes to your profile."
        onConfirm={handleConfirmOwnerPassword}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
