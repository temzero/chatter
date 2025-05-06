// uiStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
type Theme = 'light' | 'dark' | 'auto';
type ResolvedTheme = 'light' | 'dark';

interface ModalState {
  currentMediaId: string | null;
}

interface ModalActions {
  openModal: (mediaId: string) => void;
  closeModal: () => void;
}

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  detectSystemTheme: () => ResolvedTheme;
  initialize: () => void;
}

interface UIStore extends ModalState, ModalActions, ThemeState, ThemeActions {}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Modal state
      currentMediaId: null,
      
      // Modal actions
      openModal: (mediaId: string) => set({ currentMediaId: mediaId }),
      closeModal: () => set({ currentMediaId: null }),

      // Theme state
      theme: 'auto',
      resolvedTheme: 'light',

      // Theme actions
      detectSystemTheme: () => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : 'light';
      },

      initialize: () => {
        const { theme, detectSystemTheme } = get();
        const resolved = theme === 'auto' ? detectSystemTheme() : theme;
        
        document.documentElement.setAttribute('data-theme', resolved);
        set({ resolvedTheme: resolved });
      },

      setTheme: (newTheme) => {
        const { detectSystemTheme } = get();
        const resolved = newTheme === 'auto' ? detectSystemTheme() : newTheme;
        
        document.documentElement.setAttribute('data-theme', resolved);
        set({ theme: newTheme, resolvedTheme: resolved });

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
      name: 'ui-storage',
      partialize: (state) => ({ 
        theme: state.theme,
        resolvedTheme: state.resolvedTheme 
      }),
      onRehydrateStorage: () => (state) => {
        state?.initialize();
      },
    }
  )
);

// Selector hooks for themes
export const useCurrentTheme = () => useUIStore((state) => state.theme);
export const useResolvedTheme = () => useUIStore((state) => state.resolvedTheme);
export const useThemeActions = () => useUIStore((state) => ({
  setTheme: state.setTheme,
}));

// Selector hooks for modal
export const useCurrentMediaId = () => useUIStore((state) => state.currentMediaId);
export const useModalActions = () => useUIStore((state) => ({
  openModal: state.openModal,
  closeModal: state.closeModal,
}));