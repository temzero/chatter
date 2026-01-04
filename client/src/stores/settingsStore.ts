// stores/settingsStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TextSize } from "@/shared/types/enums/text-size.enum";
import { FontStyle } from "@/shared/types/enums/font-style.enum";
import {
  MessageReadInfoOptions,
  MessageStyleOptions,
  MessageTailOptions,
} from "@/shared/types/enums/message-setting.enum";

export interface DisplaySettings {
  textSize: TextSize;
  fontStyle: FontStyle;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  highContrast: boolean;
}

export interface MessageSettings {
  hideTypingIndicator: boolean;
  readInfo: MessageReadInfoOptions;
  messageStyle: MessageStyleOptions;
  messageTail: MessageTailOptions;
}

interface SettingsStore {
  displaySettings: DisplaySettings;
  messageSettings: MessageSettings;

  // Display actions
  updateDisplaySettings: (updates: Partial<DisplaySettings>) => void;
  setTextSize: (size: TextSize) => void;
  setFontStyle: (style: FontStyle) => void;
  toggleDisplay: (
    key: keyof Omit<DisplaySettings, "textSize" | "fontStyle">
  ) => void;

  // Message actions
  toggleTypingIndicator: () => void;
  setReadDisplay: (value: MessageReadInfoOptions) => void;
  setMessageStyle: (style: MessageStyleOptions) => void;
  setMessageTail: (style: MessageTailOptions) => void;
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

      messageSettings: {
        hideTypingIndicator: false,
        readInfo: MessageReadInfoOptions.OTHER,
        messageStyle: MessageStyleOptions.CURVED,
        messageTail: MessageTailOptions.CURVED,
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

      toggleDisplay: (key) =>
        set((state) => ({
          displaySettings: {
            ...state.displaySettings,
            [key]: !state.displaySettings[key],
          },
        })),

      toggleTypingIndicator: () =>
        set((state) => ({
          messageSettings: {
            ...state.messageSettings,
            hideTypingIndicator: !state.messageSettings.hideTypingIndicator,
          },
        })),

      setReadDisplay: (value) =>
        set((state) => ({
          messageSettings: { ...state.messageSettings, readInfo: value },
        })),

      setMessageStyle: (style) =>
        set((state) => ({
          messageSettings: { ...state.messageSettings, messageStyle: style },
        })),
      setMessageTail: (style) =>
        set((state) => ({
          messageSettings: { ...state.messageSettings, messageTail: style },
        })),
    }),
    {
      name: "chatter-settings",
      partialize: (state) => ({
        displaySettings: state.displaySettings,
        messageSettings: state.messageSettings,
      }),
    }
  )
);

export const useReadInfo = (): MessageReadInfoOptions => {
  return useSettingsStore((state) => state.messageSettings.readInfo);
};
export const useIsHideTypingIndicator = (): boolean => {
  return useSettingsStore((state) => state.messageSettings.hideTypingIndicator);
};
