import { ResolvedTheme, ThemeMode } from "@/shared/types/enums/theme.enum";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  themeMode: ThemeMode; // User's selection: AUTO, LIGHT, DARK
  resolvedTheme: ResolvedTheme; // Actually applied theme: LIGHT or DARK
}

interface ThemeActions {
  setThemeMode: (themeMode: ThemeMode) => void;
  detectSystemTheme: () => ResolvedTheme;
  initialize: () => void;
}

const initialState: ThemeState = {
  themeMode: ThemeMode.AUTO,
  resolvedTheme: ResolvedTheme.LIGHT,
};

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      detectSystemTheme: () => {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? ResolvedTheme.DARK
          : ResolvedTheme.LIGHT;
      },

      initialize: () => {
        const { themeMode, detectSystemTheme } = get();
        const resolved: ResolvedTheme =
          themeMode === ThemeMode.AUTO
            ? detectSystemTheme()
            : themeMode === ThemeMode.LIGHT
            ? ResolvedTheme.LIGHT
            : ResolvedTheme.DARK;

        document.documentElement.setAttribute("data-theme", resolved);
        set({ resolvedTheme: resolved });
      },

      setThemeMode: (newThemeMode) => {
        const { detectSystemTheme } = get();
        const resolved: ResolvedTheme =
          newThemeMode === ThemeMode.AUTO
            ? detectSystemTheme()
            : newThemeMode === ThemeMode.LIGHT
            ? ResolvedTheme.LIGHT
            : ResolvedTheme.DARK;

        document.documentElement.setAttribute("data-theme", resolved);
        set({ themeMode: newThemeMode, resolvedTheme: resolved });

        // Setup system theme listener for AUTO mode
        if (newThemeMode === ThemeMode.AUTO) {
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const handler = (e: MediaQueryListEvent) => {
            const resolvedTheme: ResolvedTheme = e.matches
              ? ResolvedTheme.DARK
              : ResolvedTheme.LIGHT;
            document.documentElement.setAttribute("data-theme", resolvedTheme);
            set({ resolvedTheme });
          };
          mediaQuery.addEventListener("change", handler);
        }
      },
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({
        themeMode: state.themeMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.initialize();
      },
    }
  )
);

// EXPORT HOOKS
export const useResolvedTheme = () =>
  useThemeStore((state) => state.resolvedTheme);
export const useThemeMode = () => useThemeStore((state) => state.themeMode);
export const getSetTheme = () => useThemeStore.getState().setThemeMode;
