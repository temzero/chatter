import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum ThemeOption {
  Light = "light",
  Dark = "dark",
  Auto = "auto",
}

export enum Theme {
  Light = "light",
  Dark = "dark",
}

interface ThemeState {
  themeOption: ThemeOption;
  theme: Theme;
}

interface ThemeActions {
  setTheme: (themeOption: ThemeOption) => void;
  detectSystemTheme: () => Theme;
  initialize: () => void;
}

const initialState: ThemeState = {
  themeOption: ThemeOption.Auto,
  theme: Theme.Light,
};

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      detectSystemTheme: () => {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? Theme.Dark
          : Theme.Light;
      },

      initialize: () => {
        const { themeOption, detectSystemTheme } = get();
        const resolved: Theme =
          themeOption === ThemeOption.Auto
            ? detectSystemTheme()
            : themeOption === ThemeOption.Light
            ? Theme.Light
            : Theme.Dark;

        document.documentElement.setAttribute("data-theme", resolved);
        set({ theme: resolved });
      },

      setTheme: (newTheme) => {
        const { detectSystemTheme } = get();
        const resolved: Theme =
          newTheme === ThemeOption.Auto
            ? detectSystemTheme()
            : newTheme === ThemeOption.Light
            ? Theme.Light
            : Theme.Dark;

        document.documentElement.setAttribute("data-theme", resolved);
        set({ themeOption: newTheme, theme: resolved });

        if (newTheme === ThemeOption.Auto) {
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const handler = (e: MediaQueryListEvent) => {
            const theme: Theme = e.matches ? Theme.Dark : Theme.Light; // <- use enum
            document.documentElement.setAttribute("data-theme", theme);
            set({ theme });
          };
          mediaQuery.addEventListener("change", handler);
        }
      },
    }),
    {
      name: "themeOption-storage",
      partialize: (state) => ({
        themeOption: state.themeOption,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        state?.initialize();
      },
    }
  )
);

// EXPORT HOOKS

export const useTheme = () => useThemeStore((state) => state.theme);
export const useThemeOption = () => useThemeStore((state) => state.themeOption);
export const getSetTheme = () => useThemeStore.getState().setTheme;
