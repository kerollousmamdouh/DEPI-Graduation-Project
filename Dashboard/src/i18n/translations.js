
import en from "../translation/en";
import ar from "../translation/ar";
const translations = { en, ar };

export function translate(lang, key) {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

export default translations;
