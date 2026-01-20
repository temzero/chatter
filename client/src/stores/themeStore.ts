import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ThemeMode,
  ResolvedTheme,
} from "@/shared/types/enums/theme.enum";

interface ThemeState {
  themeMode: ThemeMode;              // User preference
  resolvedTheme: ResolvedTheme;      // Actually applied theme
}

interface ThemeActions {
  setThemeMode: (mode: ThemeMode) => void;
  initialize: () => void;
}

let mediaQuery: MediaQueryList | null = null;
let mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null;

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      themeMode: ThemeMode.AUTO,
      resolvedTheme: ResolvedTheme.LIGHT,

      setThemeMode: (mode) => {
        set({ themeMode: mode });
        get().initialize();
      },

      initialize: () => {
        if (typeof window === "undefined") return;

        const { themeMode } = get();

        // Cleanup previous listener
        if (mediaQuery && mediaQueryHandler) {
          mediaQuery.removeEventListener("change", mediaQueryHandler);
          mediaQueryHandler = null;
          mediaQuery = null;
        }

        const applyTheme = (theme: ResolvedTheme) => {
          document.documentElement.setAttribute("data-theme", theme);
          set({ resolvedTheme: theme });
        };

        const detectSystemTheme = (): ResolvedTheme =>
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? ResolvedTheme.DARK
            : ResolvedTheme.LIGHT;

        if (themeMode === ThemeMode.AUTO) {
          // Apply initial system theme
          applyTheme(detectSystemTheme());

          // Listen for system changes
          mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          mediaQueryHandler = (e) => {
            applyTheme(
              e.matches ? ResolvedTheme.DARK : ResolvedTheme.LIGHT
            );
          };

          mediaQuery.addEventListener("change", mediaQueryHandler);
        } else {
          applyTheme(
            themeMode === ThemeMode.DARK
              ? ResolvedTheme.DARK
              : ResolvedTheme.LIGHT
          );
        }
      },
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({
        themeMode: state.themeMode, // 🔥 only persist preference
      }),
      onRehydrateStorage: () => (state) => {
        state?.initialize();
      },
    }
  )
);

// EXPORT HOOKS
export const useThemeMode = () =>
  useThemeStore((state) => state.themeMode);

export const useResolvedTheme = () =>
  useThemeStore((state) => state.resolvedTheme);

export const getSetTheme = () => useThemeStore.getState().setThemeMode;