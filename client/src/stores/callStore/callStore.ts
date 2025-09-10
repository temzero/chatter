// stores/call/useCallStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { LocalCallStatus } from "@/types/enums/LocalCallStatus";
import { useSFUCallStore } from "./sfuCallStore";
import { useP2PCallStore } from "./p2pCallStore";
import { useModalStore } from "../modalStore";
import { audioService } from "@/services/audio.service";
import type {
  callMember,
  P2PCallMember,
  SFUCallMember,
} from "@/types/store/callMember.type";
import { useMessageStore } from "../messageStore";
import { CallStatus } from "@/types/enums/CallStatus";

export interface CallState {
  callId: string | null;
  chatId: string | null;
  // Call metadata
  callerMemberId?: string;
  localCallStatus: LocalCallStatus | null;
  isVideoCall: boolean;
  isGroupCall: boolean;
  timeoutRef?: NodeJS.Timeout | null;
  startedAt?: Date;
  endedAt?: Date;

  // Local device states
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;

  // Error handling
  error?:
    | "permission_denied"
    | "device_unavailable"
    | "connection_failed"
    | "p2p_init_failed"
    | "sfu_init_failed"
    | null;
}

export interface CallActions {
  // Core lifecycle
  startCall: (
    chatId: string,
    option?: {
      isVideoCall?: boolean;
      isGroupCall?: boolean;
    }
  ) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: (isCancel?: boolean) => void;
  endCall: (option?: {
    isCancel?: boolean;
    isRejected?: boolean;
    isTimeout?: boolean;
  }) => void;

  // Status control
  setCallStatus: (status: LocalCallStatus | null) => void;

  // Media toggles (delegated to architecture-specific stores)
  toggleLocalVoice: () => void;
  toggleLocalVideo: () => Promise<void>;
  toggleLocalScreenShare: () => Promise<void>;

  // Local stream management (delegated to P2P store for P2P calls)
  setupLocalStream: () => Promise<void>;
  cleanupStreams: () => void;

  setIsMuted: (isMuted: boolean) => void;
  setIsVideoEnable: (isVideoEnabled: boolean) => void;
  setIsScreenSharing: (isScreenSharing: boolean) => void;

  // Utilities
  addCallMember: (member: Partial<callMember>) => void;
  updateCallMember: (member: Partial<callMember>) => void;
  removeCallMember: (memberId: string) => void;
  getCallDuration: () => number;
  closeCallModal: () => void;
}

export const useCallStore = create<CallState & CallActions>()(
  devtools((set, get) => ({
    // ========== CORE STATE ==========
    chatId: null,
    callStatus: null,
    isVideoCall: false,
    isGroupCall: false,
    isMuted: false,
    isVideoEnabled: false,
    isScreenSharing: false,
    error: null,

    // ========== CORE ACTIONS ==========
    startCall: async (
      chatId: string,
      option?: {
        isVideoCall?: boolean;
        isGroupCall?: boolean;
      }
    ) => {
      const isVideoCall = option?.isVideoCall ?? false;
      const isGroupCall = option?.isGroupCall ?? false;
      get().cleanupStreams();
      try {
        if (isGroupCall) {
          await useSFUCallStore
            .getState()
            .initializeSFUCall(chatId, isVideoCall);
        } else {
          await useP2PCallStore
            .getState()
            .initializeP2PCall(chatId, isVideoCall);
        }
        set({
          chatId,
          isVideoCall: isVideoCall,
          isGroupCall: isGroupCall,
          localCallStatus: LocalCallStatus.OUTGOING,
        });
      } catch (error) {
        console.error("Failed to start call:", error);
        set({ error: "connection_failed" });
        audioService.stopAllSounds();
      }
    },

    acceptCall: async () => {
      const { isGroupCall } = get();
      if (isGroupCall) {
        await useSFUCallStore.getState().acceptSFUCall();
      } else {
        await useP2PCallStore.getState().acceptP2PCall();
      }
      set({
        localCallStatus: LocalCallStatus.CONNECTED,
        startedAt: new Date(),
      });
    },

    rejectCall: (isCancel = false) => {
      const { isGroupCall } = get();
      if (isGroupCall) {
        useSFUCallStore.getState().rejectSFUCall(isCancel);
      } else {
        useP2PCallStore.getState().rejectP2PCall(isCancel);
      }
      get().endCall({ isCancel });
    },

    endCall: (options = {}) => {
      const { isGroupCall, chatId, callId } = get();

      // Disconnect streams
      if (isGroupCall) {
        useSFUCallStore.getState().disconnectFromSFU();
      } else {
        useP2PCallStore.getState().cleanupP2PConnections();
      }

      const localStatus = options.isRejected
        ? LocalCallStatus.REJECTED
        : options.isCancel
        ? LocalCallStatus.CANCELED
        : LocalCallStatus.ENDED;

      // Update local call state
      set({
        localCallStatus: localStatus,
        endedAt: new Date(),
      });

      // ✅ Update the message store so the call bubble shows "Ended"
      if (chatId && callId) {
        useMessageStore.getState().updateCallMessage(chatId, callId, {
          status: CallStatus.COMPLETED,
          endedAt: new Date().toISOString(),
        });
      }

      console.log("call ended");
    },

    setCallStatus: (status: LocalCallStatus | null) => {
      set({ localCallStatus: status });
    },

    toggleLocalVoice: () => {
      const { isGroupCall } = get();
      if (isGroupCall) {
        useSFUCallStore.getState().toggleAudio();
      } else {
        useP2PCallStore.getState().toggleAudio();
      }
    },

    toggleLocalVideo: async () => {
      const { isGroupCall } = get();
      if (isGroupCall) {
        await useSFUCallStore.getState().toggleVideo();
      } else {
        await useP2PCallStore.getState().toggleVideo();
      }
    },

    toggleLocalScreenShare: async () => {
      const { isGroupCall } = get();
      if (isGroupCall) {
        await useSFUCallStore.getState().toggleScreenShare();
      } else {
        await useP2PCallStore.getState().toggleScreenShare();
      }
    },

    setupLocalStream: async () => {
      const { isGroupCall } = get();
      if (isGroupCall) {
        // SFU calls handle media internally through LiveKit
        return;
      } else {
        // P2P calls use the P2P store for stream management
        await useP2PCallStore.getState().setupLocalStream();
      }
    },

    cleanupStreams: () => {
      const { isGroupCall } = get();
      if (isGroupCall) {
        // SFU cleanup is handled by LiveKit
        return;
      } else {
        // P2P cleanup
        useP2PCallStore.getState().cleanupStreams();
      }

      set({
        isMuted: false,
        isVideoEnabled: false,
        isScreenSharing: false,
      });
    },

    setIsMuted: (isMuted: boolean) => set({ isMuted }),
    setIsVideoEnable: (isVideoEnabled: boolean) => set({ isVideoEnabled }),
    setIsScreenSharing: (isScreenSharing: boolean) => set({ isScreenSharing }),

    addCallMember: (member) => {
      const { isGroupCall } = get();
      if (isGroupCall) {
        useSFUCallStore.getState().addSFUMember(member as SFUCallMember);
      } else {
        useP2PCallStore.getState().addP2PMember(member as P2PCallMember);
      }
    },

    updateCallMember: (member) => {
      const { isGroupCall } = get();
      if (isGroupCall) {
        useSFUCallStore.getState().updateSFUMember(member as SFUCallMember);
      } else {
        useP2PCallStore.getState().updateP2PMember(member as P2PCallMember);
      }
    },

    removeCallMember: (memberId: string) => {
      const { isGroupCall } = get();
      if (isGroupCall) {
        useSFUCallStore.getState().removeSFUMember(memberId);
      } else {
        useP2PCallStore.getState().removeP2PMember(memberId);
      }
    },

    getCallDuration: () => {
      const { startedAt, endedAt } = get();
      if (!startedAt) return 0;
      const endTime = endedAt || new Date();
      return Math.floor((endTime.getTime() - startedAt.getTime()) / 1000);
    },

    closeCallModal: () => {
      const { clearP2PState } = useP2PCallStore.getState();
      const { clearSFUState } = useSFUCallStore.getState();

      useModalStore.getState().closeModal();
      // Cleanup streams
      get().cleanupStreams();
      // Cleanup call types
      clearP2PState();
      clearSFUState();
      set({
        chatId: null,
        localCallStatus: null,
        isGroupCall: false,
        error: null,
      });
    },
  }))
);
