import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ children }) {
  // تم تعديل المفتاح ليتوافق مع الـ LocalStorage الموحد لديلورا ماركت
  const storedUser = localStorage.getItem("dealora_market_current_user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // 🔒 شرط الحماية: لو مش مسجل أو الـ role مش admin، ارجع فوراً لصفحة اللوجين
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  // لو أدمن فعلاً، عدي بالسلامة وافتح الصفحة
  return children;
}