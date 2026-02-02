// stores/chatBarStore.ts
import { create } from "zustand";

interface ChatBarStore {
  // Voice recording states (the main requirement)
  isRecordMode: boolean;
  isRecording: boolean;

  // Input content state (optional, but useful)
  hasTextContent: boolean;

  // Actions
  setIsRecordMode: (value: boolean) => void;
  setIsRecording: (value: boolean) => void;
  setHasTextContent: (value: boolean) => void;
  resetVoiceState: () => void;
}

export const useChatBarStore = create<ChatBarStore>((set) => ({
  isRecordMode: false,
  isRecording: false,
  hasTextContent: false,

  setIsRecordMode: (value) => set({ isRecordMode: value }),
  setIsRecording: (value) => set({ isRecording: value }),
  setHasTextContent: (value) => set({ hasTextContent: value }),
  resetVoiceState: () =>
    set({
      isRecordMode: false,
      isRecording: false,
    }),
}));
