import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../services/apiClient";
import { User, Mail, Phone, Briefcase, Camera, Save, UserCircle } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { t } = useLanguage();
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  // ربط بيانات الـ state ببيانات الـ user اللي مسجل دخول
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    jobTitle: user?.jobTitle || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "https://randomuser.me/api/portraits/men/75.jpg"
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
        avatar: user.avatar || "https://randomuser.me/api/portraits/men/75.jpg"
      });
    }
  }, [user]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        name: form.fullName,
        email: form.email,
        phone: form.phone,
      };
      
      await apiClient.put("/auth/profile", updatedData);
      
      const mergedUser = { ...user, ...form, fullName: form.fullName };
      setUser(mergedUser);
      localStorage.setItem("currentUser", JSON.stringify(mergedUser));
      
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 px-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("adminProfile")}</h1>
        <p className="text-gray-500">Manage your personal information and account settings</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 ring-4 ring-gray-50">
              <img src={form.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all"
            >
              <Camera size={18} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{form.fullName}</h2>
            <p className="text-gray-500 font-medium">{form.jobTitle}</p>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800"><UserCircle className="text-green-600" /> Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
              <input value={form.fullName} onChange={update("fullName")} className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100 focus:ring-2 focus:ring-green-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input value={form.jobTitle} onChange={update("jobTitle")} className="w-full bg-gray-50 rounded-2xl pl-10 pr-4 py-3.5 border border-gray-100 focus:ring-2 focus:ring-green-500 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="email" value={form.email} onChange={update("email")} className="w-full bg-gray-50 rounded-2xl pl-10 pr-4 py-3.5 border border-gray-100 focus:ring-2 focus:ring-green-500 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input value={form.phone} onChange={update("phone")} className="w-full bg-gray-50 rounded-2xl pl-10 pr-4 py-3.5 border border-gray-100 focus:ring-2 focus:ring-green-500 outline-none transition-all" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">Bio</label>
              <textarea rows={4} value={form.bio} onChange={update("bio")} className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100 focus:ring-2 focus:ring-green-500 outline-none transition-all" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-2xl px-10 py-4 shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1">
            <Save size={20} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}