import { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { SiteContext } from "../Store/SiteContext"; 

export default function ErrorPage() {
  const [showModal, setShowModal] = useState(false);
  const { adminData } = useContext(SiteContext);

  // 1️⃣ تجهيز مصفوفة الهواتف (تأمين في حال كانت فارغة أو غير موجودة)
  const phoneList = Array.isArray(adminData?.phones) ? adminData.phones : [];

  // 2️⃣ تجهيز مصفوفة الواتساب ديناميكياً (تتعامل مع رقم مفرد أو مصفوفة أرقام مستقبلاً)
  const whatsappList = Array.isArray(adminData?.whatsappNumber)
    ? adminData.whatsappNumber
    : adminData?.whatsappNumber
    ? [adminData.whatsappNumber]
    : [];

  return (
    <div className="flex flex-col items-center justify-center text-sm h-screen px-4" dir="ltr">
      <p className="font-medium text-lg text-[#00a650]">404 Error</p>

      <h2 className="md:text-6xl text-4xl font-semibold text-gray-800 text-center">
        Page Not Found
      </h2>

      <p className="text-base mt-4 text-gray-500 text-center">
        Sorry, we couldn’t find the page you’re looking for.
      </p>

      <div className="flex items-center gap-4 mt-6">
        <NavLink
          to="/home"
          className="bg-[#00a650] px-7 py-2.5 text-white rounded active:scale-95 transition-all font-bold"
        >
          Go back home
        </NavLink>

        <button
          onClick={() => setShowModal(true)}
          className="group flex items-center gap-2 px-7 py-2.5 active:scale-95 transition cursor-pointer font-bold text-gray-700"
        >
          Contact support
          <svg
            className="group-hover:translate-x-0.5 mt-1 transition-transform"
            width="15" height="11" viewBox="0 0 15 11" fill="none"
          >
            <path d="M1 5.5h13.092M8.949 1l5.143 4.5L8.949 10" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* المودال الشيك - يدعم التمرير (Scroll) تلقائياً لو الأرقام كترت */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div 
            className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300 max-h-[85vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-[#1e3a5f] mb-6">Contact Us</h3>
            
            <div className="flex flex-col gap-3 w-full">
              
              {/* 📞 عرض كل أرقام الإتصال المتاحة بالـ Map */}
              {phoneList.map((phone, index) => (
                <a 
                  key={`phone-${index}`}
                  href={`tel:${phone}`} 
                  className="bg-gray-100 py-3 px-4 rounded-2xl font-bold text-[#1e3a5f] hover:bg-[#00a650] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <span>Call: {phone}</span>
                </a>
              ))}

              {/* 💬 عرض كل أرقام الواتساب المتاحة بالـ Map */}
              {whatsappList.map((waNumber, index) => (
                <a 
                  key={`wa-${index}`}
                  href={`https://wa.me/${waNumber}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-green-50/50 border border-green-100 py-3 px-4 rounded-2xl font-bold text-[#00a650] hover:bg-[#00a650] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <span>WhatsApp {whatsappList.length > 1 ? `#${index + 1}` : ""}</span>
                </a>
              ))}

              {/* في حال عدم وجود أي أرقام كـ Fallback */}
              {phoneList.length === 0 && whatsappList.length === 0 && (
                <p className="text-gray-400 text-xs">No contact numbers available right now.</p>
              )}
            </div>

            <button onClick={() => setShowModal(false)} className="mt-6 text-gray-400 hover:text-red-500 font-bold cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}