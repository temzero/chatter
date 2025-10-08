// stores/deviceStore.ts
import { create } from "zustand";

interface DeviceState {
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
  setIsMobile: (value) => set({ isMobile: value }),
}));
