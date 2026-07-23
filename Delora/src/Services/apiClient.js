import axios from "axios";

// 1. تحديد الـ Base URL من الـ env أو الافتراضي
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// 2. إنشاء Instance مخصص من Axios
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // لو الـ Request أخد أكتر من 10 ثواني يفصل عشان ما يعلقش الصفحة
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. الـ Request Interceptor: إضافة الـ Token تلقائياً قبل ما أي Request يخرج
apiClient.interceptors.request.use(
  (config) => {
    // 👈 قم بتعديل الاسم هنا ليطابق ما في LoginPage
    const token = localStorage.getItem("dealora_market_token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 4. الـ Response Interceptor: معالجة الأخطاء بشكل مركزي (Global Error Handling)
apiClient.interceptors.response.use(
  (response) => {
    // لو الـ Response تمام، هنرجع الـ data اللي جواه علطول عشان نسهل الشغل في الـ services
    return response.data;
  },
  (error) => {
    // هنا بنهندل المشاكل المشهورة زي الـ 401 (الـ Token انتهى أو مش صالح)
    if (error.response) {
      const status = error.response.status;
      const serverMessage = error.response.data?.message || error.response.data?.error;

      if (status === 401) {
        console.warn("Unauthorized! Redirecting to login...");
localStorage.removeItem("dealora_market_token");        // ممكن تعمل window.location.href = '/login' هنا لو عاوز يطرد المستخدم علطول
      }

      // بنرمي الـ Error النضيف اللي جاي من الـ Back عشان الـ Hook يلقطه
      return Promise.reject(new Error(serverMessage || `API Error ${status}`));
    } else if (error.request) {
      // الـ Request طلع بس مفيش رد من السيرفر (مشكلة شبكة مثلاً)
      return Promise.reject(new Error("لا يوجد استجابة من السيرفر، يرجى التحقق من اتصال الإنترنت"));
    } else {
      // خطأ تاني خالص في السيستم
      return Promise.reject(new Error(error.message));
    }
  }
);

// رابط المتجر الافتراضي
export const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || "/";