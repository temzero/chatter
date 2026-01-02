// stores/settingsStore.ts
import { FontStyle } from "@/shared/types/enums/font-style.enum";
import { TextSize } from "@/shared/types/enums/text-size.enum";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DisplaySettings {
  textSize: TextSize;
  fontStyle: FontStyle;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  highContrast: boolean;
}

interface SettingsStore {
  displaySettings: DisplaySettings;
  updateDisplaySettings: (updates: Partial<DisplaySettings>) => void;
  setTextSize: (size: TextSize) => void;
  setFontStyle: (style: FontStyle) => void;
  toggleSetting: (setting: keyof Omit<DisplaySettings, "textSize">) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      displaySettings: {
        textSize: TextSize.M,
        fontStyle: FontStyle.SANS,
        reduceMotion: false,
        reduceTransparency: false,
        highContrast: false,
      },

      updateDisplaySettings: (updates) =>
        set((state) => ({
          displaySettings: { ...state.displaySettings, ...updates },
        })),

      setTextSize: (size) =>
        set((state) => ({
          displaySettings: { ...state.displaySettings, textSize: size },
        })),

      setFontStyle: (style) =>
        set((state) => ({
          displaySettings: { ...state.displaySettings, fontStyle: style },
        })),

      toggleSetting: (setting) =>
        set((state) => ({
          displaySettings: {
            ...state.displaySettings,
            [setting]: !state.displaySettings[setting],
          },
        })),
    }),
    {
      name: "chat-app-settings",
      // Optional: Only persist certain fields
      partialize: (state) => ({ displaySettings: state.displaySettings }),
    }
  )
);
