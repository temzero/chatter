import { create } from "zustand";
import i18n from "i18next";

interface LanguageState {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "en",
  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
  },
}));
