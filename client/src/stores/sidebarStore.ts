// sidebarStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarType = 'default' | 'forgotPassword' | 'newChat' | 'search' | 'more' | 'profile' | 'profileEdit' | 'settings' | 'settingsAccount';

interface SidebarStore {
  currentSidebar: SidebarType;
  isCompact: boolean;
  setSidebar: (sidebar: SidebarType) => void;
  toggleCompact: () => void;
  initializeKeyListeners: () => void;
  cleanupKeyListener: () => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      currentSidebar: 'default',
      isCompact: false,

      setSidebar: (sidebar) => set({ currentSidebar: sidebar }),

      toggleCompact: () => {
        const newCompactState = !get().isCompact;
        set({ isCompact: newCompactState });
      },

      initializeKeyListeners: () => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape' && get().currentSidebar !== 'default') {
            e.preventDefault();
            set({ currentSidebar: 'default' });
            e.stopPropagation();
          }
        };

        window.addEventListener('keydown', handleKeyDown);
        
        // Return cleanup function that will be called when the store is destroyed
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
      },

      cleanupKeyListener: () => {
        // This would be called manually if needed before component unmount
        // The actual listener cleanup is handled by the initializeKeyListeners return function
      }
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({
        isCompact: state.isCompact
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initializeKeyListeners();
        }
      }
    }
  )
);

// Selector hooks
export const useCurrentSidebar = () => useSidebarStore((state) => state.currentSidebar);
export const useIsCompactSidebar = () => useSidebarStore((state) => state.isCompact);
export const useSidebarActions = () => useSidebarStore((state) => ({
  setSidebar: state.setSidebar,
  toggleCompact: state.toggleCompact
}));