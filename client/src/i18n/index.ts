import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import all language JSON files
import en from "./locales/en.json";
import vi from "./locales/vi.json";
import es from "./locales/es.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import th from "./locales/th.json";
import hi from "./locales/hi.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
      es: { translation: es },
      zh: { translation: zh },
      ja: { translation: ja },
      ko: { translation: ko },
      th: { translation: th },
      hi: { translation: hi },
    },
    fallbackLng: "en",
    debug: true,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
