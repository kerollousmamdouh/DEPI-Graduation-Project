// src/data/mockOrders.js

export const INITIAL_ORDERS = [
  {
    id: "1042",
    createdAt: "2026-07-02T14:30:00Z",
    status: "DELIVERED",
    paymentMethod: "cod",
    paymentDetails: null, // الكاش ملوش إيصال
    items: [
      { id: "p1", name: "زيت زيتون بكر ممتاز 1 لتر", price: 210, quantity: 2 },
      { id: "p2", name: "بهارات مشكلة 250جم", price: 30, quantity: 1 }
    ],
    customerDetails: {
      name: "أحمد محمود علي",
      phone: "01012345678",
      address: "القاهرة - مدينة نصر - شارع عباس العقاد",
      city: "القاهرة"
    },
    subtotal: 420,
    shippingFee: 30,
    discount: 0,
    totalPrice: 450
  },
  {
    id: "1043",
    createdAt: "2026-07-03T18:20:00Z",
    status: "PROCESSING", 
    paymentMethod: "visa",
    // تمت إضافة تفاصيل الدفع لاختبار عرض الإيصال في الداشبورد
    paymentDetails: {
      transactionId: "V-9876543210",
      receiptImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=300&auto=format&fit=crop" // صورة إيصال وهمية
    },
    items: [
      { id: "p3", name: "جبنة شيدر مستوردة 500جم", price: 145, quantity: 2 }
    ],
    customerDetails: {
      name: "سارة محمد أحمد",
      phone: "01123456789",
      address: "الجيزة - الدقي - شارع مصدق",
      city: "الجيزة"
    },
    subtotal: 290,
    shippingFee: 30,
    discount: 0,
    totalPrice: 320
  },
  {
    id: "1044",
    createdAt: "2026-07-03T10:15:00Z",
    status: "SHIPPED",
    paymentMethod: "cod",
    paymentDetails: null,
    items: [
      { id: "p4", name: "شيبس بطاطس عائلي", price: 20, quantity: 5 },
      { id: "p5", name: "مكسرات فاخرة 200جم", price: 80, quantity: 1 }
    ],
    customerDetails: {
      name: "عمر خالد حسن",
      phone: "01234567890",
      address: "الإسكندرية - سموحة - شارع فوزي معاذ",
      city: "الإسكندرية"
    },
    subtotal: 180,
    shippingFee: 20,
    discount: 10,
    totalPrice: 190
  },
  {
    id: "1045",
    createdAt: "2026-07-04T09:00:00Z",
    status: "PENDING",
    paymentMethod: "cod",
    paymentDetails: null,
    items: [
      { id: "p6", name: "تونة فاخرة قطع 185جم", price: 140, quantity: 4 }
    ],
    customerDetails: {
      name: "منى السيد عبد الرحمن",
      phone: "01555443322",
      address: "المنصورة - شارع المشاية السفلية",
      city: "المنصورة"
    },
    subtotal: 560,
    shippingFee: 40,
    discount: 20,
    totalPrice: 580
  },
  {
    id: "1046",
    createdAt: "2026-07-05T16:45:00Z",
    status: "CANCELED",
    paymentMethod: "wallet",
    // تمت إضافة تفاصيل الدفع للمحفظة الإلكترونية
    paymentDetails: {
      transactionId: "W-1122334455",
      receiptImage: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=300&auto=format&fit=crop"
    },
    items: [
      { id: "p8", name: "دجاج مجمد 1100جم", price: 105, quantity: 2 }
    ],
    customerDetails: {
      name: "إبراهيم إبراهيم",
      phone: "01099887766",
      address: "طنطا - شارع البحر",
      city: "طنطا"
    },
    subtotal: 210,
    shippingFee: 25,
    discount: 0,
    totalPrice: 235
  },
  {
    id: "1047",
    createdAt: "2026-07-06T11:10:00Z",
    status: "DELIVERED",
    paymentMethod: "cod",
    paymentDetails: null,
    items: [
      { id: "p9", name: "كمون مطحون فاخر 100جم", price: 65, quantity: 6 }
    ],
    customerDetails: {
      name: "محمود عبد العزيز",
      phone: "01055667788",
      address: "أسيوط - شارع النيل",
      city: "أسيوط"
    },
    subtotal: 390,
    shippingFee: 30,
    discount: 10,
    totalPrice: 410
  }
];