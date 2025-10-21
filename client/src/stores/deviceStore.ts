// stores/deviceStore.ts
import { create } from "zustand";

interface DeviceState {
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  isMobile: typeof window !== "undefined" ? window.innerWidth < 800 : false,
  setIsMobile: (value) => set({ isMobile: value }),
}));

// EXPORT HOOKS

export const useIsMobile = () => useDeviceStore(state => state.isMobile)
export const getSetMobile = () => useDeviceStore.getState().setIsMobile