// sidebarStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useIsMobile } from "./deviceStore";

export const compactSupportedSidebars = [
  SidebarMode.DEFAULT,
  SidebarMode.PROFILE,
  SidebarMode.MORE,
];

interface sidebarStoreState {
  currentSidebar: SidebarMode;
  sidebarData: unknown;
  isCompact: boolean;
}

interface sidebarStoreActions {
  setSidebar: (sidebar: SidebarMode, data?: unknown) => void;
  toggleCompact: () => void;

  clearSidebarStore: () => void;
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
        const currentSidebar = get().currentSidebar;
        const isSupported = compactSupportedSidebars.includes(currentSidebar);

        if (isSupported) {
          set({ isCompact: !get().isCompact });
        }
      },

      clearSidebarStore: () => {
        set({ ...initialState });
      }
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
export const useIsCompactSidebar = () => {
  const isCompact = useSidebarStore((state) => state.isCompact);
  const isMobile = useIsMobile();
  // On mobile, never use compact mode
  return isMobile ? false : isCompact;
};
export const getSetSidebar = () => useSidebarStore.getState().setSidebar;
