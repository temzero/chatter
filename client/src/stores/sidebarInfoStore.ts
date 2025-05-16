// stores/sidebarInfoStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarInfoModes = 'default' | 'media' | 'saved' | 'edit';

interface SidebarInfoStore {
  isSidebarInfoVisible: boolean;
  currentSidebarInfo: SidebarInfoModes;
  toggleSidebarInfo: () => void;
  setSidebarInfo: (mode: SidebarInfoModes) => void;
  initializeKeyListeners: () => () => void;
}

export const useSidebarInfoStore = create<SidebarInfoStore>()(
  persist(
    (set, get) => ({
      isSidebarInfoVisible: false,
      currentSidebarInfo: 'default',

      toggleSidebarInfo: () => {
        const currentVisibility = get().isSidebarInfoVisible;
        set({ 
          isSidebarInfoVisible: !currentVisibility,
          currentSidebarInfo: 'default' // Reset mode when toggling
        });
      },

      setSidebarInfo: (mode) => set({ currentSidebarInfo: mode }),

      initializeKeyListeners: () => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'F1') {
            e.preventDefault();
            get().toggleSidebarInfo();
          }

          if (e.key === 'Escape') {
            e.preventDefault();
            set({ currentSidebarInfo: 'default' });
            e.stopPropagation();
          }
        };

        window.addEventListener('keydown', handleKeyDown);
        
        // Return cleanup function
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
      }
    }),
    {
      name: 'sidebar-info-storage',
      partialize: (state) => ({
        isSidebarInfoVisible: state.isSidebarInfoVisible
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const cleanup = state.initializeKeyListeners();
          // Store the cleanup function if needed for later
          return cleanup;
        }
      }
    }
  )
);

// Selector hooks
export const useSidebarInfoVisibility = () => 
  useSidebarInfoStore((state) => state.isSidebarInfoVisible);

export const useCurrentSidebarInfo = () => 
  useSidebarInfoStore((state) => state.currentSidebarInfo);

export const useSidebarInfoActions = () => 
  useSidebarInfoStore((state) => ({
    toggleSidebarInfo: state.toggleSidebarInfo,
    setSidebarInfo: state.setSidebarInfo
  }));