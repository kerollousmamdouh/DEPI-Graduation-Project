import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, User, Eye, EyeOff, BriefcaseBusiness, Mail, Phone, DollarSign, UserCircle, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { useTeam } from "../Hooks/useTeam";
import { useAuth } from "../context/AuthContext";
import { teamService } from "../services/teamService";
import PasswordConfirmModal from "../components/PasswordConfirmModal";

const AVAILABLE_PAGES = [
  { id: "dashboard", label: "Dashboard (لوحة التحكم)" },
  { id: "products", label: "Products (المنتجات)" },
  { id: "bestSellers", label: "BestSellers (افضل المنتجات)"},
  { id: "orders", label: "Orders (الطلبات)" },
  { id: "users", label: "Users (المستخدمين)" },
  { id: "team", label:"Team (الفريق)"},
  { id: "categories", label: "Categories (الأقسام)" },
  { id: "heroSlider", label: "HeroSlider (شاشة العرض)"},
  { id: "footer", label:"Footer Setting (بيانات الموقع)"},
  { id: "paymentMethods", label: "Payment Methods (طرق الدفع )"},
  { id: "deals", label: "Deals (الشركات)"},
  { id: "announcement", label:"Announcements (الاعلانات)"},
  { id: "complaints", label: "Complaints (الشكاوى)" },
  { id: "settings", label : "Settings(الاعدادات)"}
];

export default function AddTeamMember() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  const { members, addMember, updateMember } = useTeam();
  const { isOwner } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Confirmation-gate state: non-owners must supply the owner's password
  // before an add/edit actually goes through.
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", salary: "", address: "", password: "",
    status: "Active", permissions: [], jobTitle: "", avatar: "",
  });

  const targetAdmin = isEdit ? members.find((a) => String(a.id) === id) : null;
  // Nobody but the owner can view/edit the owner's own record from this form.
  const blockedFromOwnerRecord = isEdit && targetAdmin?.jobTitle === "Owner" && !isOwner;

  useEffect(() => {
    if (!isEdit || !members.length) return;
    const admin = members.find((a) => String(a.id) === id);
    if (admin) {
      setFormData({
        name: admin.fullName || "",
        email: admin.email || "",
        phone: admin.phone || "",
        salary: admin.salary || "",
        address: admin.address || "",
        password: "", // Passwords are hashed server-side and never sent back.
                       // Leaving this blank keeps the current password; typing
                       // here sets a brand-new one (a reset, not a reveal).
        status: admin.status || "Active",
        permissions: admin.permissions || [],
        jobTitle: admin.jobTitle || "",
        avatar: admin.avatar || "",
      });
    }
  }, [id, members, isEdit]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, avatar: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const togglePermission = (pageId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(pageId)
        ? prev.permissions.filter((p) => p !== pageId)
        : [...prev.permissions, pageId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (blockedFromOwnerRecord) return;
    
    // Validation
    if (!formData.name.trim()) return toast.error("Full Name is required");
    if (!formData.jobTitle.trim()) return toast.error("Job Title is required");
    
    // phone validation: 11 digits, starts with 0
    if (formData.phone.length !== 11 || !formData.phone.startsWith("0")) {
      return toast.error("Phone number must be 11 digits and start with 0");
    }

    const submitData = {
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone,
      salary: formData.salary,
      // Only send a password if one was typed — blank means "keep the current one".
      ...(formData.password ? { password: formData.password } : {}),
      is_active: formData.status === "Active",
      permissions: formData.permissions,
      jobTitle: formData.jobTitle,
      avatar: formData.avatar,
    };

    // The owner can save directly. Any other team member with access to this
    // page must confirm with the owner's password first.
    if (isOwner) {
      await persistMember(submitData);
    } else {
      setPendingSubmitData(submitData);
      setConfirmOpen(true);
    }
  };

  const persistMember = async (submitData) => {
    try {
      if (isEdit) {
        await updateMember({ id: Number(id), data: submitData });
        toast.success("Administrator updated successfully.");
      } else {
        await addMember(submitData);
        toast.success("Administrator added successfully.");
      }
      navigate("/team");
    } catch (err) {
      toast.error(err.message || "Failed to save member");
    }
  };

  const handleConfirmOwnerPassword = async (password) => {
    const result = await teamService.verifyOwnerPassword(password);
    if (!result?.valid) {
      throw new Error("Incorrect password. Please try again.");
    }
    setConfirmOpen(false);
    await persistMember(pendingSubmitData);
    setPendingSubmitData(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 px-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border rounded-full hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isEdit ? "Edit Administrator" : "Add Administrator"}</h1>
        </div>
      </div>

      <div className="relative">
      <form onSubmit={handleSubmit} className={`space-y-8 ${blockedFromOwnerRecord ? "blur-sm select-none pointer-events-none" : ""}`}>
        
        {/* Profile Image */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
             <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-gray-50 overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner">
                    {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover" /> : <User size={50} className="text-gray-300" />}
                </div>
                <button type="button" onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 p-3 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-lg"><Upload size={18} /></button>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-800">Profile Picture</h2>
                <p className="text-gray-500 text-sm">Upload a high-quality photo for the admin.</p>
             </div>
        </div>

        {/* General Information */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800"><UserCircle className="text-green-600" /> General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus:ring-2 focus:ring-green-500 transition-all outline-none" /></div>
            
            {/* Password Field — this is a RESET, not a reveal. Passwords are
                bcrypt-hashed server-side and can never be shown again to
                anyone, including the owner. Leave blank to keep it unchanged. */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                {isEdit ? (
                  <>Reset Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></>
                ) : "Password"}
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  autoComplete="new-password"
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  className="w-full bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus:ring-2 focus:ring-green-500 outline-none pr-12" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div><label className="block text-sm font-medium text-gray-600 mb-2">Email</label><div className="relative"><Mail className="absolute left-3 top-3.5 text-gray-400" size={18} /><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 rounded-2xl pl-10 pr-4 py-3 border border-gray-100 focus:ring-2 focus:ring-green-500 transition-all outline-none" /></div></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-2">Phone</label><div className="relative"><Phone className="absolute left-3 top-3.5 text-gray-400" size={18} /><input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-gray-50 rounded-2xl pl-10 pr-4 py-3 border border-gray-100 focus:ring-2 focus:ring-green-500 transition-all outline-none" /></div></div>
          </div>
        </div>

        {/* Salary & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800"><DollarSign className="text-green-600" /> Salary & Role</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Monthly Salary</label>
                  <input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="w-full bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-600 mb-2">Job Title</label>
                   <div className="relative">
                      <BriefcaseBusiness className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input type="text" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} className="w-full bg-gray-50 rounded-2xl pl-10 pr-4 py-3 border border-gray-100 focus:ring-2 focus:ring-green-500 transition-all outline-none" />
                   </div>
                </div>
            </div>

            {/* Status (Large Box) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Account Status</h3>
                <div className="border-2 border-dashed border-gray-200 bg-gray-50 p-6 rounded-2xl flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <input type="radio" name="status" value="Active" checked={formData.status === "Active"} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-5 h-5 accent-green-600" />
                        <span className="font-bold text-gray-700">Active Account</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <input type="radio" name="status" value="Disabled" checked={formData.status === "Disabled"} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-5 h-5 accent-green-600" />
                        <span className="font-bold text-gray-700">Disabled Account</span>
                    </label>
                </div>
            </div>
        </div>

        {/* Permissions */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-6"><ShieldCheck className="text-green-600" /> Page Permissions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_PAGES.map((page) => (
              <div key={page.id} onClick={() => togglePermission(page.id)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.permissions.includes(page.id) ? "border-green-500 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                <div className="flex items-center gap-3">
                   <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${formData.permissions.includes(page.id) ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                      {formData.permissions.includes(page.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                   </div>
                   <span className="font-semibold text-gray-700">{page.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => navigate("/team")} className="px-8 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all">Cancel</button>
          <button type="submit" className="px-10 py-4 rounded-2xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 transition-all transform hover:-translate-y-1">
            {isEdit ? "Update Changes" : "Create New Member"}
          </button>
        </div>

        {!isOwner && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 text-center">
            You'll be asked for the administrator's password to confirm this {isEdit ? "update" : "new member"}.
          </p>
        )}
      </form>

      {blockedFromOwnerRecord && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl bg-white/40">
          <div className="flex items-center gap-2 rounded-full bg-white border border-gray-200 shadow-sm px-4 py-2">
            <Lock size={14} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-600">Owner information is restricted</span>
          </div>
        </div>
      )}
      </div>

      <PasswordConfirmModal
        open={confirmOpen}
        title={isEdit ? "Confirm member update" : "Confirm new member"}
        description="Enter the administrator's password to confirm this change to the team."
        onConfirm={handleConfirmOwnerPassword}
        onClose={() => {
          setConfirmOpen(false);
          setPendingSubmitData(null);
        }}
      />
    </div>
  );
}