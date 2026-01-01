// stores/settingsStore.ts
import { TextSize } from '@/shared/types/enums/text-size.enum';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DisplaySettings {
  textSize: TextSize;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  highContrast: boolean;
}

interface SettingsStore {
  displaySettings: DisplaySettings;
  updateDisplaySettings: (updates: Partial<DisplaySettings>) => void;
  setTextSize: (size: TextSize) => void;
  toggleSetting: (setting: keyof Omit<DisplaySettings, 'textSize'>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      displaySettings: {
        textSize: TextSize.M,
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
        
      toggleSetting: (setting) =>
        set((state) => ({
          displaySettings: {
            ...state.displaySettings,
            [setting]: !state.displaySettings[setting],
          },
        })),
    }),
    {
      name: 'chat-app-settings',
      // Optional: Only persist certain fields
      partialize: (state) => ({ displaySettings: state.displaySettings }),
    }
  )
);