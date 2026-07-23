// src/data/mockDatabaseSeeder.js

export const MOCK_TICKETS_SEED = [
  {
    id: "COMP-1001",
    orderId: "ORDER-101",
    clientName: "أحمد محمود",
    clientEmail: "ahmed.mahmoud@example.com",
    avatar: "https://i.pravatar.cc/150?img=11",
    status: "PENDING",
    date: "2026-07-16",
    messages: [
      {
        sender: "user",
        text: "السلام عليكم، أنا لسه عامل الأوردر ده وحابب أتأكد هل متاح تعديل العنوان قبل الشحن؟",
        time: "10:15 AM",
      },
    ],
  },
  {
    id: "COMP-1002",
    orderId: "ORDER-102",
    clientName: "سارة علي",
    clientEmail: "sara.ali@example.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    status: "REPLIED",
    date: "2026-07-15",
    messages: [
      {
        sender: "user",
        text: "لو سمحت محتاجة أعرف ميعاد الاستلام المتوقع للطلب.",
        time: "02:30 PM",
      },
      {
        sender: "admin",
        text: "أهلاً بكِ أستاذة سارة، الطلب جاري تجهيزه وسيتم التسليم خلال 48 ساعة.",
        time: "03:00 PM",
      },
    ],
  },
  {
    id: "COMP-1003",
    orderId: "ORDER-103",
    clientName: "Mohamed Hassan",
    clientEmail: "m.hassan@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    status: "PENDING",
    date: "2026-07-16",
    messages: [
      {
        sender: "user",
        text: "I want to add another item to my order if it's still pending processing.",
        time: "11:45 AM",
      },
    ],
  },
  {
    id: "COMP-1004",
    orderId: "ORDER-104",
    clientName: "مريم إبراهيم",
    clientEmail: "meryem.ibrahim@example.com",
    avatar: "https://i.pravatar.cc/150?img=9",
    status: "CLOSED",
    date: "2026-07-10",
    messages: [
      {
        sender: "user",
        text: "استلمت الطلب وبشكركم جداً على السرعة والجودة!",
        time: "01:20 PM",
      },
      {
        sender: "admin",
        text: "العفو أستاذة مريم، يسعدنا دائماً خدمتكم!",
        time: "01:40 PM",
      },
    ],
  },
];

/**
 * دالة زرع البيانات الوهمية في الـ LocalStorage
 */
export const seedMockDatabase = () => {
  const STORAGE_KEY = "dealora_market_tickets";
  
  // يتم زرع البيانات فقط إذا لم تكن موجودة سابقاً
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TICKETS_SEED));
    console.log("✅ Mock Database Seeded Successfully!");
  }
};