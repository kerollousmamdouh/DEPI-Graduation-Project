export const paymentMethodsData = [
  {
    id: 1,

    name: "Cash",

    description: "Pay when receiving your order.",

    logo:
      "https://cdn-icons-png.flaticon.com/512/2489/2489756.png",

    status: "Active",

    priority: 1,

    type: "offline",

    brandColor: "#00A63E",

    isDefault: true,

    receiverName: "",

    receiverNumber: "",

    requireScreenshot: false,

    requireTransactionId: false,

    qrCode: "",

    createdAt: "2025-07-11",
  },

  {
    id: 2,

    name: "Visa",

    description: "Pay securely using your Visa card.",

    logo:
      "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",

    status: "Active",

    priority: 2,

    type: "online",

    brandColor: "#1A1F71",

    isDefault: false,

    receiverName: "",

    receiverNumber: "",

    requireScreenshot: false,

    requireTransactionId: false,

    qrCode: "",

    createdAt: "2025-07-11",
  },

  {
    id: 3,

    name: "InstaPay",

    description: "Instant bank transfer.",

    logo:
      "https://play-lh.googleusercontent.com/BkM7f9mC0DoR5GQmH6vN1q1L7S0mL8V6fM4iK3gF5S6nLw",

    status: "Active",

    priority: 3,

    type: "online",

    brandColor: "#6F2DBD",

    isDefault: false,

    receiverName: "Dealora",

    receiverNumber: "01012345678",

    requireScreenshot: true,

    requireTransactionId: true,

    qrCode: "",

    createdAt: "2025-07-11",
  },

  {
    id: 4,

    name: "Vodafone Cash",

    description: "Transfer using Vodafone Cash.",

    logo:
      "https://upload.wikimedia.org/wikipedia/commons/7/72/Vodafone_2017_logo.svg",

    status: "Active",

    priority: 4,

    type: "online",

    brandColor: "#E60000",

    isDefault: false,

    receiverName: "Dealora",

    receiverNumber: "01012345678",

    requireScreenshot: true,

    requireTransactionId: true,

    qrCode: "",

    createdAt: "2025-07-11",
  },

  {
    id: 5,

    name: "Orange Cash",

    description: "Transfer using Orange Cash.",

    logo:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg",

    status: "Active",

    priority: 5,

    type: "online",

    brandColor: "#FF7900",

    isDefault: false,

    receiverName: "Dealora",

    receiverNumber: "01012345678",

    requireScreenshot: true,

    requireTransactionId: true,

    qrCode: "",

    createdAt: "2025-07-11",
  },

  {
    id: 6,

    name: "Etisalat Cash",

    description: "Transfer using Etisalat Cash.",

    logo:
      "https://upload.wikimedia.org/wikipedia/commons/3/3f/Etisalat-logo.svg",

    status: "Hidden",

    priority: 6,

    type: "online",

    brandColor: "#00A651",

    isDefault: false,

    receiverName: "Dealora",

    receiverNumber: "01012345678",

    requireScreenshot: true,

    requireTransactionId: true,

    qrCode: "",

    createdAt: "2025-07-11",
  },

  {
    id: 7,

    name: "WE Pay",

    description: "Transfer using WE Pay.",

    logo:
      "https://upload.wikimedia.org/wikipedia/commons/6/6f/WE_Logo.svg",

    status: "Active",

    priority: 7,

    type: "online",

    brandColor: "#6E2E91",

    isDefault: false,

    receiverName: "Dealora",

    receiverNumber: "01012345678",

    requireScreenshot: true,

    requireTransactionId: true,

    qrCode: "",

    createdAt: "2025-07-11",
  },
];