// stores/sidebarInfoStore.ts
import { SidebarInfoMode } from "@/types/enums/sidebarInfoMode";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";

interface SidebarInfoStore {
  isSidebarInfoVisible: boolean;
  currentSidebarInfo: SidebarInfoMode;
  toggleSidebarInfo: () => void;
  setSidebarInfo: (mode?: SidebarInfoMode) => void;
  initializeKeyListeners: () => () => void;
}

export const useSidebarInfoStore = create<SidebarInfoStore>()(
  persist(
    (set, get) => ({
      isSidebarInfoVisible: false,
      currentSidebarInfo: SidebarInfoMode.DEFAULT,

      toggleSidebarInfo: () => {
        const currentVisibility = get().isSidebarInfoVisible;
        set({
          isSidebarInfoVisible: !currentVisibility,
          currentSidebarInfo: SidebarInfoMode.DEFAULT, // Reset mode when toggling
        });
      },

      setSidebarInfo: (mode = SidebarInfoMode.DEFAULT) =>
        set({ currentSidebarInfo: mode }),

      initializeKeyListeners: () => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "F1") {
            e.preventDefault();
            get().toggleSidebarInfo();
          }

          if (e.key === "Escape") {
            e.preventDefault();
            set({ currentSidebarInfo: SidebarInfoMode.DEFAULT });
            e.stopPropagation();
          }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Return cleanup function
        return () => {
          window.removeEventListener("keydown", handleKeyDown);
        };
      },
    }),
    {
      name: "sidebar-info-storage",
      partialize: (state) => ({
        isSidebarInfoVisible: state.isSidebarInfoVisible,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const cleanup = state.initializeKeyListeners();
          // Store the cleanup function if needed for later
          return cleanup;
        }
      },
    }
  )
);

// Selector hooks
export const useSidebarInfoVisibility = () =>
  useSidebarInfoStore(useShallow((state) => state.isSidebarInfoVisible));

export const useCurrentSidebarInfo = () =>
  useSidebarInfoStore(useShallow((state) => state.currentSidebarInfo));

export const useSidebarInfoActions = () =>
  useSidebarInfoStore((state) => ({
    toggleSidebarInfo: state.toggleSidebarInfo,
    setSidebarInfo: state.setSidebarInfo,
  }));
