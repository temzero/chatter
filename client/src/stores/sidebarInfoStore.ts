// stores/sidebarInfoStore.ts
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import { useActiveChatId } from "./chatStore";

interface SidebarInfoStoreState {
  isSidebarInfoVisible: boolean;
  currentSidebarInfo: SidebarInfoMode;
}

interface SidebarInfoStoreActions {
  toggleSidebarInfo: () => void;
  setSidebarInfoVisible: (isVisible: boolean) => void;
  setSidebarInfo: (mode?: SidebarInfoMode) => void;
}

const initialState: SidebarInfoStoreState = {
  isSidebarInfoVisible: false,
  currentSidebarInfo: SidebarInfoMode.DEFAULT,
};

export const useSidebarInfoStore = create<
  SidebarInfoStoreState & SidebarInfoStoreActions
>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleSidebarInfo: () => {
        const currentVisibility = get().isSidebarInfoVisible;
        set({
          isSidebarInfoVisible: !currentVisibility,
          currentSidebarInfo: SidebarInfoMode.DEFAULT,
        });
      },

      setSidebarInfoVisible: (isVisible: boolean) =>
        set({ isSidebarInfoVisible: isVisible }),

      setSidebarInfo: (mode = SidebarInfoMode.DEFAULT) =>
        set({ currentSidebarInfo: mode }),
    }),
    {
      name: "sidebar-info-storage",
      partialize: (state) => ({
        isSidebarInfoVisible: state.isSidebarInfoVisible,
      }),
    }
  )
);

// EXPORT HOOKS

export const getSetSidebarInfo = () =>
  useSidebarInfoStore.getState().setSidebarInfo;
export const useSidebarInfoVisibility = () => {
  const isSidebarInfoVisible = useSidebarInfoStore(
    useShallow((state) => state.isSidebarInfoVisible)
  );
  const activeChatId = useActiveChatId();
  // Only visible if store flag is true AND there is an active chat
  return isSidebarInfoVisible && !!activeChatId;
};

export const useCurrentSidebarInfo = () =>
  useSidebarInfoStore(useShallow((state) => state.currentSidebarInfo));
