import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'auto';
type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  detectSystemTheme: () => ResolvedTheme;
  initialize: () => void;
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      theme: 'auto',
      resolvedTheme: 'light',

      // Detect system theme preference
      detectSystemTheme: () => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : 'light';
      },

      // Initialize theme
      initialize: () => {
        const { theme, detectSystemTheme } = get();
        const resolved = theme === 'auto' ? detectSystemTheme() : theme;
        
        document.documentElement.setAttribute('data-theme', resolved);
        set({ resolvedTheme: resolved });
      },

      // Set new theme (auto/light/dark)
      setTheme: (newTheme) => {
        const { detectSystemTheme } = get();
        const resolved = newTheme === 'auto' ? detectSystemTheme() : newTheme;
        
        document.documentElement.setAttribute('data-theme', resolved);
        set({ theme: newTheme, resolvedTheme: resolved });

        // Listen for system changes if in auto mode
        if (newTheme === 'auto') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handler = (e: MediaQueryListEvent) => {
            const resolvedTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', resolvedTheme);
            set({ resolvedTheme });
          };
          mediaQuery.addEventListener('change', handler);
        }
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        state?.initialize();
      },
    }
  )
);

// Selector hooks
export const useCurrentTheme = () => useThemeStore((state) => state.theme);
export const useResolvedTheme = () => useThemeStore((state) => state.resolvedTheme);
export const useThemeActions = () => useThemeStore((state) => ({
  setTheme: state.setTheme,
}));