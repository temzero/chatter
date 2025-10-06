import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector"; // <- add this
import en from "./locales/en.json";
import vi from "./locales/vi.json";

i18n
  .use(LanguageDetector) // detect language
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    fallbackLng: "en",
    debug: true,
    detection: {
      order: ["localStorage", "navigator"], // check localStorage first
      caches: ["localStorage"], // save language to localStorage
      lookupLocalStorage: "i18nextLng", // localStorage key
    },
    interpolation: { escapeValue: false }, // React already escapes
  });

export default i18n;
