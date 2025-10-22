// sidebarStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SidebarMode } from "@/common/enums/sidebarMode";

interface sidebarStoreState {
  currentSidebar: SidebarMode;
  sidebarData: unknown;
  isCompact: boolean;
}

interface sidebarStoreActions {
  setSidebar: (sidebar: SidebarMode, data?: unknown) => void;
  toggleCompact: () => void;
}

const initialState: sidebarStoreState = {
  currentSidebar: SidebarMode.DEFAULT,
  sidebarData: null,
  isCompact: false,
};

export const useSidebarStore = create<
  sidebarStoreState & sidebarStoreActions
>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSidebar: (sidebar, data = null) =>
        set({
          currentSidebar: sidebar,
          sidebarData: data,
        }),

      toggleCompact: () => {
        const newCompactState = !get().isCompact;
        set({ isCompact: newCompactState });
      },
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({
        isCompact: state.isCompact,
      }),
      // onRehydrateStorage: () => (state) => {
      //   if (state) {
      //     state.initializeKeyListeners();
      //   }
      // },
    }
  )
);

// EXPORT HOOKS

export const useCurrentSidebar = () =>
  useSidebarStore((state) => state.currentSidebar);
export const useIsCompactSidebar = () =>
  useSidebarStore((state) => state.isCompact);
export const getSetSidebar = () => useSidebarStore.getState().setSidebar;
