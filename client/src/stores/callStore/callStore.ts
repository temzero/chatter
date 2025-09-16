// stores/call/useCallStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
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
import { CallStatus, LocalCallStatus } from "@/types/enums/CallStatus";
import { callService } from "@/services/callService";

export interface CallState {
  id: string | null;
  chatId: string | null;
  // Call metadata
  initiatorMemberId?: string;
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
  setLocalCallStatus: (status: LocalCallStatus | null) => void;

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
    id: null,
    chatId: null,
    localCallStatus: null,
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

        const { id } = get();
        if (id) {
          callService.markCallAsFailed(id);
        }
      }
    },

    acceptCall: async () => {
      const { isGroupCall } = get();

      try {
        if (isGroupCall) {
          await useSFUCallStore.getState().acceptSFUCall();
        } else {
          await useP2PCallStore.getState().acceptP2PCall();
        }

        const startedAt = new Date();

        set({
          localCallStatus: LocalCallStatus.CONNECTED,
          startedAt,
        });
      } catch (err) {
        console.error("Failed to accept call:", err);
        set({ error: "device_unavailable" });
        get().endCall({ isCancel: false });
      }
    },

    rejectCall: (isCancel = false) => {
      const { isGroupCall, chatId, id } = get();

      if (isGroupCall) {
        useSFUCallStore.getState().rejectSFUCall(isCancel);
      } else {
        useP2PCallStore.getState().rejectP2PCall(isCancel);
      }

      if (chatId && id) {
        if (isCancel) {
          // Caller cancels → delete the system call message
          useMessageStore.getState().deleteMessage(chatId, id);
        } else {
          useMessageStore
            .getState()
            .updateMessageCallStatus(chatId, id, CallStatus.DECLINED);
          callService.markCallAsDeclined(id); // ✅ update backend
        }
      }

      get().endCall({ isCancel });
    },

    endCall: async (
      options = {
        isCancel: false,
        isRejected: false,
        isTimeout: false,
      }
    ) => {
      const { isGroupCall, chatId, id, error } = get();

      // 1. Determine the final status based on the reason
      let finalStatus: CallStatus;
      if (options.isRejected) finalStatus = CallStatus.DECLINED;
      else if (options.isTimeout) finalStatus = CallStatus.MISSED;
      else if (error) finalStatus = CallStatus.FAILED;
      else finalStatus = CallStatus.COMPLETED;

      const endedAt = new Date().toISOString();

      // 2. Update backend via API
      if (id) {
        try {
          await callService.updateCall(id, {
            status: finalStatus,
            endedAt,
          });
        } catch (err) {
          console.error("Failed to update call on server:", err);
          // continue anyway to keep UI responsive
        }
      }

      // 3. Update local UI immediately
      if (chatId && id) {
        useMessageStore
          .getState()
          .updateMessageCallStatus(chatId, id, finalStatus);
      }

      // 4. Clean up connections
      if (isGroupCall) {
        useSFUCallStore.getState().disconnectFromSFU();
      } else {
        useP2PCallStore.getState().cleanupP2PConnections();
      }

      // 5. Update local call state
      const localStatus = options.isRejected
        ? LocalCallStatus.REJECTED
        : options.isCancel
        ? LocalCallStatus.CANCELED
        : LocalCallStatus.ENDED;

      set({
        localCallStatus: localStatus,
        endedAt: new Date(),
      });

      console.log("call ended with status:", finalStatus);
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
