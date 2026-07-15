import { createContext } from 'react';

// تعريف الـ Context فقط
export const SiteContext = createContext();

// ملاحظة: الـ Provider يمكن أن يكون هنا أو في ملف App.jsx، 
// لكن يفضل أن يكون في ملف منفصل إذا كان حجمه كبيراً.