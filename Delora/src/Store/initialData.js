import logoHeader from "../assets/images/logo1.png";
import logoFooter from "../assets/images/logo3.png";

export const initialAdminData = {
  isMultiLanguage: true, // 👈 جعلناها false بناءً على طلبك

  paymentMethods: {
    cod: true,
    visa: true,
    instapay: true,
    vodafone: true,
    orange: true,
    etisalat: true,
    we: true,
  },
  paymentDetails: {
    vodafone: "010xxxxxxx",
    orange: "01274146351",
    etisalat: "011xxxxxxx",
    we: "015xxxxxxx",
    instapay: "kerollous_131@instapay",
  },

  logo1: logoHeader,
  logo2: logoFooter,

  about: "DELORA - وجهتك الأولى للتسوق الذكي.",
  aboutEn: "DELORA - Your premier destination for smart shopping.",

  phones: ["01012345678", "01187654321"],
  whatsappNumber: "201001105352",

  locations: [
    { name: "فرع مدينة نصر", nameEn: "Nasr City Branch", url: "https://maps.google.com/..." },
    { name: "فرع التجمع", nameEn: "Tagamoa Branch", url: "https://maps.google.com/..." },
    { name: "فرع آخر", nameEn: "Another Branch", url: "https://maps.google.com/..." },
  ],

  socialLinks: [
    { name: "Facebook", url: "https://fb.com", icon: "facebook" },
    { name: "Instagram", url: "https://inst.com", icon: "instagram" },
    { name: "WhatsApp", url: "https://wa.me/...", icon: "whatsapp" },
    { name: "telegram", url: "https://wa.me/...", icon: "telegram" },
    { name: "twitter", url: "https://wa.me/...", icon: "twitter" },
  ],

  workingHours: "9 ص - 12 ص",
  workingHoursEn: "9 AM - 12 AM",

  products: [
    { id: 1, categoryId: 3, name: { ar: "أرز الضحى 1كجم", en: "Al Doha Rice 1kg" }, price: 35, offerPrice: null, stock: 50, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80" },
    { id: 2, categoryId: 3, name: { ar: "مكرونة الملكة 400 جرام", en: "El Maleka Pasta 400g" }, price: 15, offerPrice: 12, stock: 120, offerExpiresAt: "2026-07-25T23:59:59.000Z", image: "https://images.unsplash.com/photo-1621961404018-8199d42f7b16?auto=format&fit=crop&w=400&q=80" },
    { id: 3, categoryId: 3, name: { ar: "زيت عباد الشمس كريستال 1 لتر", en: "Crystal Sunflower Oil 1L" }, price: 80, offerPrice: null, stock: 30, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80" },
    { id: 4, categoryId: 3, name: { ar: "صلصة طماطم فاين فودز 360 جرام", en: "Fine Foods Tomato Paste 360g" }, price: 25, offerPrice: 21, stock: 85, offerStock: 40, offerExpiresAt: null, image: "https://images.unsplash.com/photo-1607305387299-a3d9611cd46f?auto=format&fit=crop&w=400&q=80" },
    { id: 5, categoryId: 3, name: { ar: "سكر الأسرة 1كجم", en: "Al Osra Sugar 1kg" }, price: 40, offerPrice: null, stock: 45, image: "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=400&q=80" },
    { id: 6, categoryId: 3, name: { ar: "شيبسي عائلي طعم الملح", en: "Chipsy Family Pack Salt" }, price: 15, offerPrice: null, stock: 200, image: "https://images.unsplash.com/photo-1566478431375-7385bb02e07f?auto=format&fit=crop&w=400&q=80" },
    { id: 7, categoryId: 3, name: { ar: "تونة صن شاين قطعة واحدة", en: "Sunshine Tuna Solid" }, price: 55, offerPrice: 48, stock: 60, offerStock: 20, offerExpiresAt: "2026-07-15T18:00:00.000Z", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80" },
    { id: 8, categoryId: 3, name: { ar: "خل طبيعي هاينز 1 لتر", en: "Heinz Vinegar 1L" }, price: 22, offerPrice: null, stock: 75, image: "https://images.unsplash.com/photo-1622484211148-71649b449641?auto=format&fit=crop&w=400&q=80" },
    { id: 9, categoryId: 3, name: { ar: "كورن فليكس تيميز 500 جرام", en: "Temmy's Corn Flakes 500g" }, price: 90, offerPrice: 79, stock: 2500, offerStock: 10, offerExpiresAt: null, image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=400&q=80" },
    { id: 10, categoryId: 1, name: { ar: "جبنة رومي قديم (كيلو)", en: "Old Roumi Cheese (1kg)" }, price: 260, offerPrice: null, stock: 15, image: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&w=400&q=80" },
    { id: 11, categoryId: 1, name: { ar: "جبنة بيضاء فيتا دومتي 500 جرام", en: "Domty Domiati Cheese 500g" }, price: 45, offerPrice: 39, stock: 90, offerStock: 45, offerExpiresAt: "2026-07-30T23:59:59.000Z", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80" },
    { id: 12, categoryId: 1, name: { ar: "لبن جهينة كامل الدسم 1 لتر", en: "Juhayna Full Cream Milk 1L" }, price: 48, offerPrice: null, stock: 100, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80" },
    { id: 13, categoryId: 1, name: { ar: "زبادي المراعي طبيعي 105 جرام", en: "Almarai Natural Yogurt 105g" }, price: 9, offerPrice: 7.5, stock: 300, offerStock: 150, offerExpiresAt: null, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80" },
    { id: 14, categoryId: 1, name: { ar: "زبدة فيرن غير مملحة 1كجم", en: "Fern Unsalted Butter 1kg" }, price: 190, offerPrice: 175, stock: 20, offerStock: 8, offerExpiresAt: "2026-07-12T23:59:59.000Z", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80" },
    { id: 15, categoryId: 1, name: { ar: "جبنة كيرى 12 قطعة", en: "Kiri Cheese 12 Pcs" }, price: 75, offerPrice: null, stock: 40, image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=400&q=80" },
    { id: 16, categoryId: 1, name: { ar: "قشطة بوك 170 جرام", en: "Puck Thick Cream 170g" }, price: 45, offerPrice: 41, stock: 55, offerStock: 25, offerExpiresAt: null, image: "https://images.unsplash.com/photo-1528750994873-1122146aea9f?auto=format&fit=crop&w=400&q=80" },
    { id: 17, categoryId: 1, name: { ar: "جبنة موتزاريلا الأطباء 500 جرام", en: "El Atbaa Mozzarella 500g" }, price: 85, offerPrice: null, stock: 35, image: "https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&w=400&q=80" },
    { id: 18, categoryId: 2, name: { ar: "برجر بقري جامبو حلواني", en: "Halwani Jumbo Beef Burger" }, price: 160, offerPrice: 140, stock: 25, offerStock: 10, offerExpiresAt: null, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80" },
    { id: 19, categoryId: 2, name: { ar: "كفتة بقري سيخ أطياب", en: "Atyab Beef Kofta" }, price: 185, offerPrice: null, stock: 18, image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=400&q=80" },
    { id: 20, categoryId: 2, name: { ar: "ستريبس دجاج حار اطياب 1كجم", en: "Atyab Spicy Chicken Strips 1kg" }, price: 240, offerPrice: 215, stock: 12, offerStock: 5, offerExpiresAt: "2026-07-10T23:59:59.000Z", image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80" },
    { id: 21, categoryId: 2, name: { ar: "بانيه دجاج حلواني عادي", en: "Halwani Chicken Pané Regular" }, price: 150, offerPrice: null, stock: 30, image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca3e8?auto=format&fit=crop&w=400&q=80" },
    { id: 22, categoryId: 2, name: { ar: "هواري سجق بقري شرقي", en: "Hawari Oriental Beef Sausage" }, price: 135, offerPrice: 120, stock: 22, offerStock: 12, offerExpiresAt: null, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80" },
    { id: 23, categoryId: 2, name: { ar: "مكعبات لحم بقري برازيلي 1كجم", en: "Frozen Brazilian Beef Cubes 1kg" }, price: 290, offerPrice: null, stock: 10, image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=400&q=80" },
    { id: 24, categoryId: 2, name: { ar: "خضار مشكل بسمة مجمد 400 جرام", en: "Basma Frozen Mixed Vegetables 400g" }, price: 25, offerPrice: 19, stock: 65, offerStock: 30, offerExpiresAt: null, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80" },
    { id: 25, categoryId: 2, name: { ar: "ملوخية بسمة مجمدة 400 جرام", en: "Basma Frozen Molokhia 400g" }, price: 20, offerPrice: null, stock: 80, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80" },
    { id: 26, categoryId: 2, name: { ar: "بطاطس فارم فريتس بوم فريت 2.5كجم", en: "Farm Frites Pommes Frites 2.5kg" }, price: 170, offerPrice: 155, stock: 40, offerStock: 15, offerExpiresAt: "2026-07-20T23:59:59.000Z", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80" },
    { id: 27, categoryId: 4, name: { ar: "طماطم طازجة (كيلو)", en: "Fresh Tomatoes (1kg)" }, price: 15, offerPrice: 12, stock: 5, offerStock: 2, offerExpiresAt: null, image: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=400&q=80" },
    { id: 28, categoryId: 4, name: { ar: "بطاطس للتحمير (كيلو)", en: "Frying Potatoes (1kg)" }, price: 20, offerPrice: null, stock: 150, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80" },
    { id: 29, categoryId: 4, name: { ar: "موز بلدي (كيلو)", en: "Local Bananas (1kg)" }, price: 25, offerPrice: null, stock: 2, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80" },
    { id: 30, categoryId: 4, name: { ar: "تفاح أحمر إيطالي (كيلو)", en: "Italian Red Apples (1kg)" }, price: 85, offerPrice: 75, stock: 50, offerStock: 25, offerExpiresAt: "2026-07-18T23:59:59.000Z", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80" },
    { id: 31, categoryId: 4, name: { ar: "خيار بلدي طازج (كيلو)", en: "Fresh Cucumber (1kg)" }, price: 18, offerPrice: null, stock: 120, image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=400&q=80" },
    { id: 32, categoryId: 4, name: { ar: "بصل أحمر (كيلو)", en: "Red Onion (1kg)" }, price: 15, offerPrice: null, stock: 180, image: "https://images.unsplash.com/photo-1618512496248-a07fe83a8304?auto=format&fit=crop&w=400&q=80" },
    { id: 33, categoryId: 5, name: { ar: "كوكاكولا كانز 330 مل", en: "Coca-Cola Can 330ml" }, price: 12, offerPrice: null, stock: 300, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80" },
    { id: 34, categoryId: 5, name: { ar: "شاي لبتون خرز 250 جرام", en: "Lipton Loose Tea 250g" }, price: 75, offerPrice: 68, stock: 45, offerStock: 20, offerExpiresAt: "2026-07-28T23:59:59.000Z", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80" },
    { id: 35, categoryId: 5, name: { ar: "نسكافيه بلاك 3 في 1 (ظرف)", en: "Nescafe 3-in-1 Sachet" }, price: 7, offerPrice: 6, stock: 500, offerStock: 250, offerExpiresAt: null, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80" },
    { id: 36, categoryId: 5, name: { ar: "عصير جهينة بيور تفاح 1 لتر", en: "Juhayna Pure Apple Juice 1L" }, price: 60, offerPrice: null, stock: 35, image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80" },
    { id: 37, categoryId: 5, name: { ar: "مياه معدنية نستله 1.5 لتر", en: "Nestle Mineral Water 1.5L" }, price: 8, offerPrice: null, stock: 400, image: "https://images.unsplash.com/photo-1608885898957-a599fb18de36?auto=format&fit=crop&w=400&q=80" },
    { id: 38, categoryId: 6, name: { ar: "شامبو بانتين بديل الزيت 400 مل", en: "Pantene Shampoo 400ml" }, price: 120, offerPrice: 105, stock: 25, offerStock: 10, offerExpiresAt: "2026-07-16T23:59:59.000Z", image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80" },
    { id: 39, categoryId: 6, name: { ar: "شاور جل كاميليا برائحة اللافندر 1 لتر", en: "Camay Shower Gel Lavender 1L" }, price: 95, offerPrice: null, stock: 20, image: "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=400&q=80" },
    { id: 40, categoryId: 6, name: { ar: "معجون أسنان كولجيت انتعاش النعناع", en: "Colgate Mint Toothpaste" }, price: 45, offerPrice: 38, stock: 60, offerStock: 30, offerExpiresAt: null, image: "https://images.unsplash.com/photo-1559591656-a6de9d105280?auto=format&fit=crop&w=400&q=80" },
    { id: 41, categoryId: 6, name: { ar: "صابونة دوف لترطيب البشرة 135 جرام", en: "Dove Beauty Bar Soap 135g" }, price: 35, offerPrice: null, stock: 100, image: "https://images.unsplash.com/photo-1607006342456-ba275cd34e66?auto=format&fit=crop&w=400&q=80" },
    { id: 42, categoryId: 6, name: { ar: "كريم نيفيا مرطب للجسم 150 مل", en: "Nivea Creme Moisturizer 150ml" }, price: 80, offerPrice: 72, stock: 45, offerStock: 20, offerExpiresAt: "2026-07-22T23:59:59.000Z", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80" },
    { id: 43, categoryId: 6, name: { ar: "مزيل عرق ريكسونا ستيك حماية 48 ساعة", en: "Rexona Deodorant Stick" }, price: 110, offerPrice: null, stock: 30, image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80" },
    { id: 44, categoryId: 6, name: { ar: "بلسم لوريال الفيف للشعر التالف", en: "L'Oreal Elvive Conditioner" }, price: 140, offerPrice: 125, stock: 15, offerStock: 5, offerExpiresAt: null, image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80" },
    { id: 45, categoryId: 6, name: { ar: "شفرات حلاقة جيليت بلو 3 (3 قطع)", en: "Gillette Blue 3 Razors (3 Pcs)" }, price: 95, offerPrice: null, stock: 40, image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=400&q=80" },
    { id: 46, categoryId: 6, name: { ar: "غسول غارنييه بالليمون لتفتيح البشرة", en: "Garnier Lemon Face Wash" }, price: 115, offerPrice: 99, stock: 25, offerStock: 10, offerExpiresAt: "2026-07-20T23:59:59.000Z", image: "https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=400&q=80" },
    { id: 47, categoryId: 6, name: { ar: "مناديل مبللة جونسون للأطفال 56 منديل", en: "Johnson's Baby Wipes 56 Pcs" }, price: 65, offerPrice: null, stock: 70, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80" },
    { id: 48, categoryId: 6, name: { ar: "سيروم لوريال هيالورونيك أسيد للبشرة", en: "L'Oreal Hyaluronic Acid Serum" }, price: 320, offerPrice: 285, stock: 10, offerStock: 4, offerExpiresAt: null, image: "https://images.unsplash.com/photo-1620916565399-09f1b377ba42?auto=format&fit=crop&w=400&q=80" },
    { id: 49, categoryId: 6, name: { ar: "لوشن فازلين لترطيب الجسم موحد اللون", en: "Vaseline Healthy White Lotion" }, price: 160, offerPrice: null, stock: 20, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80" },
    { id: 50, categoryId: 6, name: { ar: "حفاضات فاين بيبي مقاس 4 عبوة جامبو", en: "Fine Baby Diapers Size 4 Jumbo" }, price: 280, offerPrice: 249, stock: 15, offerStock: 6, offerExpiresAt: "2026-07-15T23:59:59.000Z", image: "https://images.unsplash.com/photo-1543269664-76bc42017320?auto=format&fit=crop&w=400&q=80" },
    { id: 51, categoryId: 6, name: { ar: "حفاضات فاين بيبي مقاس 4 عبوة جامبو", en: "Fine Baby Diapers Size 4 Jumbo" }, price: 280, offerPrice: 249, stock: 15, offerStock: 6, offerExpiresAt: "2026-07-15T23:59:59.000Z", image: "https://images.unsplash.com/photo-1543269664-76bc42017320?auto=format&fit=crop&w=400&q=80" }, // 👈 أضفنا حقل الـ ar الناقص لحماية الموقع من الكراش
    { id: 52, categoryId: 6, name: { ar: "حفاضات بيبي مقاس 4 عبوة جامبو", en: "Baby Diapers Size 4 Jumbo" }, price: 280, offerPrice: 249, stock: 15, offerStock: 6, offerExpiresAt: "2026-07-15T23:59:59.000Z", image: "https://images.unsplash.com/photo-1543269664-76bc42017320?auto=format&fit=crop&w=400&q=80" }  // 👈 أضفنا حقل الـ ar الناقص لحماية الموقع من الكراش
  ],

  HeroSliderData: [
    { id: 1, title: { ar: "منتجات ألبان وأجبان طازجة يومياً", en: "Fresh Daily Dairy & Cheese" }, subtitle: { ar: "خصم يصل إلى 20%", en: "Up to 20% OFF" }, buttonText: { ar: "تسوق الآن", en: "Shop Now" }, image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=1200&auto=format&fit=crop", categoryId: 1 },
    { id: 2, title: { ar: "لحم ومجمدات فاخرة سريعة التحضير", en: "Premium Frozen Foods & Meat" }, subtitle: { ar: "جودة مضمونة", en: "Quality Guaranteed" }, buttonText: { ar: "اكتشف المزيد", en: "Discover More" }, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop", categoryId: 2 },
    { id: 3, title: { ar: "أجود أنواع العطارة والتوابل الشرقية", en: "Finest Oriental Spices" }, subtitle: { ar: "نكهة أصيلة", en: "Authentic Flavor" }, buttonText: { ar: "تصفح الآن", en: "Browse Now" }, image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop", categoryId: 3 },
    { id: 4, title: { ar: "مجموعة متنوعة من أفضل المعلبات الغذائية", en: "Variety of Best Canned Foods" }, subtitle: { ar: "توفير وسرعة", en: "Save & Fast" }, buttonText: { ar: "تسوق الآن", en: "Shop Now" }, image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?q=80&w=1200&auto=format&fit=crop", categoryId: 4 },
    { id: 5, title: { ar: "مقرمشات وسناكس تسلي وقتك", en: "Crunchy Snacks for Your Time" }, subtitle: { ar: "عروض مجمعة", en: "Bundle Offers" }, buttonText: { ar: "اشتري الآن", en: "Buy Now" }, image: "https://images.unsplash.com/photo-1534080391025-a7771e1a6462?q=80&w=1200&auto=format&fit=crop", categoryId: 5 },
    { id: 6, title: { ar: "أحدث مستحضرات التجميل والعناية الشخصية", en: "Latest Beauty & Personal Care" }, subtitle: { ar: "إطلالة مشرقة", en: "Bright Look" }, buttonText: { ar: "اكتشفي عروضنا", en: "Check Our Offers" }, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop", categoryId: 6 },
    { id: 7, title: { ar: "مشروبات غازية وعصائر طبيعية منعشة", en: "Refreshing Sodas & Natural Juices" }, subtitle: { ar: "انتعاش يدوم", en: "Lasting Refreshment" }, buttonText: { ar: "اروي عطشك", en: "Quench Your Thirst" }, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1200&auto=format&fit=crop", categoryId: 7 },
    { id: 8, title: { ar: "منظفات ومستلزمات منزلية لحماية عائلتك", en: "Home Cleaning & Essentials" }, subtitle: { ar: "نجاة وتوفير", en: "Clean & Save" }, buttonText: { ar: "تسوق للمنزل", en: "Shop Home" }, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop", categoryId: 8 }
  ],

  categories: [
    { id: 1, name: { ar: "الألبان والجبن", en: "Dairy & Cheese" }, image: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&w=400&q=80", type: "weight" },
    { id: 2, name: { ar: "المجمدات", en: "Frozen" }, image: "/images/frozen.svg", type: "quantity" },
    { id: 3, name: { ar: "العطارة", en: "Spices" }, image: "/images/spices.svg", type: "weight" },
    { id: 4, name: { ar: "المعلبات", en: "Canned Goods" }, image: "/images/canned.svg", type: "quantity" },
    { id: 5, name: { ar: "السناكس", en: "Snacks" }, image: "/images/snacks.svg", type: "quantity" },
    { id: 6, name: { ar: "مستحضرات التجميل", en: "Cosmetics" }, image: "/images/cosmetics.svg", type: "quantity" },
    { id: 7, name: { ar: "المشروبات", en: "Beverages" }, image: "/images/beverages.svg", type: "quantity" },
    { id: 8, name: { ar: "المنظفات", en: "Cleaning Supplies" }, image: "/images/cleaning.svg", type: "quantity" },
    { id: 9, name: { ar: "تنظيف إضافي", en: "Cleaning" }, image: "/images/cleaning.svg", type: "quantity" } // 👈 أضفنا حقل الـ ar الناقص
  ],
};