// stores/call/useCallStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { audioService } from "@/services/audio.service";
import { useModalStore, ModalType } from "../modalStore";
import { useMessageStore } from "../messageStore";
import { CallStatus, LocalCallStatus } from "@/types/enums/CallStatus";
import { callService } from "@/services/callService";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { LiveKitService } from "@/services/liveKitService";
import { getMyToken } from "./helpers/call.helper";
import { handleError } from "@/utils/handleError";
import { Room } from "livekit-client";

export interface CallState {
  liveKitService: LiveKitService | null;

  callId: string | null;
  chatId: string | null;
  initiatorMemberId?: string;
  localCallStatus: LocalCallStatus | null;
  isVideoCall: boolean;
  timeoutRef?: NodeJS.Timeout | null;
  startedAt?: Date;
  endedAt?: Date;

  error?:
    | "permission_denied"
    | "device_unavailable"
    | "connection_failed"
    | "sfu_init_failed"
    | null;
}

export interface CallActions {
  // lifecycle
  startCall: (chatId: string, opt?: { isVideoCall?: boolean }) => Promise<void>;
  acceptCall: (options: {
    isVoiceEnabled?: boolean;
    isVideoEnabled?: boolean;
  }) => Promise<void>;
  rejectCall: (isCancel?: boolean) => void;
  endCall: (opt?: {
    isCancel?: boolean;
    isRejected?: boolean;
    isTimeout?: boolean;
  }) => void;

  // toggles
  toggleLocalVoice: (enable?: boolean) => Promise<void>;
  toggleLocalVideo: (enable?: boolean) => Promise<void>;
  toggleLocalScreenShare: (enable?: boolean) => Promise<void>;

  // utils
  setLocalCallStatus: (s: LocalCallStatus) => void;
  getCallDuration: () => number;
  closeCallModal: () => void;

  // LiveKit
  connectToLiveKitRoom: (
    url: string,
    token: string,
    options: {
      audio?: boolean;
      video?: boolean;
    }
  ) => Promise<void>;
  disconnectFromLiveKit: () => void;
  getLiveKitRoom: () => Room | null;
  clearLiveKitState: () => void;
}

export const useCallStore = create<CallState & CallActions>()(
  devtools((set, get) => ({
    // ========== BASE STATE ==========
    liveKitService: null,
    callId: null,
    chatId: null,
    localCallStatus: null,
    isVideoCall: false,
    timeoutRef: null,
    startedAt: undefined,
    endedAt: undefined,
    error: null,

    // ========== LIFECYCLE ==========
    startCall: async (chatId, opt) => {
      const isVideoCall = opt?.isVideoCall ?? false;

      try {
        // update base state
        set({
          chatId,
          isVideoCall,
          localCallStatus: LocalCallStatus.OUTGOING,
          startedAt: new Date(),
        });

        useModalStore.getState().openModal(ModalType.CALL);

        const timeoutRef = setTimeout(() => {
          if (get().localCallStatus === LocalCallStatus.OUTGOING) {
            get().endCall({ isTimeout: true });
          }
        }, 60000);
        set({ timeoutRef });

        // init LiveKit
        const liveKitService = new LiveKitService();
        set({ liveKitService });

        const token = await getMyToken(chatId);
        if (!token) {
          console.warn("No token available for LiveKit");
          set({
            localCallStatus: LocalCallStatus.ERROR,
            error: "permission_denied",
          });
          return;
        }

        await get().connectToLiveKitRoom(
          import.meta.env.VITE_LIVEKIT_URL,
          token,
          { audio: true, video: isVideoCall }
        );

        callWebSocketService.initiateCall({
          chatId,
          isVideoCall,
        });
      } catch (err) {
        console.error("startCall error", err);
        set({
          error: "sfu_init_failed",
          localCallStatus: LocalCallStatus.ERROR,
        });
        audioService.stopAllSounds();
      }
    },

    acceptCall: async (options?: {
      isVoiceEnabled?: boolean;
      isVideoEnabled?: boolean;
    }) => {
      const { callId, chatId } = get();
      if (!callId || !chatId) return;

      try {
        set({ localCallStatus: LocalCallStatus.CONNECTING });

        const liveKitService = new LiveKitService();
        set({ liveKitService });

        const token = await getMyToken(chatId);
        if (!token) {
          console.warn("No token available for LiveKit");
          set({
            localCallStatus: LocalCallStatus.ERROR,
            error: "permission_denied",
          });
          return;
        }

        await get().connectToLiveKitRoom(
          import.meta.env.VITE_LIVEKIT_URL,
          token,
          {
            audio: options?.isVoiceEnabled ?? true,
            video: options?.isVideoEnabled ?? get().isVideoCall,
          }
        );

        callWebSocketService.acceptCall({
          chatId,
          callId,
          isCallerCancel: false,
        });
      } catch (err) {
        handleError(err, "Could not connect to SFU");
        set({ localCallStatus: LocalCallStatus.ERROR });
      }
    },

    rejectCall: (isCancel = false) => {
      const { chatId, callId } = get();
      if (!chatId || !callId) return;

      callWebSocketService.rejectCall({
        chatId,
        callId: callId,
        isCallerCancel: isCancel,
      });
      get().disconnectFromLiveKit();

      get().endCall({ isCancel });
    },

    endCall: async (opt = {}) => {
      const { chatId, callId, error } = get();

      let status: CallStatus;
      if (opt.isRejected || opt.isTimeout) status = CallStatus.MISSED;
      else if (error) status = CallStatus.FAILED;
      else status = CallStatus.COMPLETED;

      if (callId) {
        try {
          await callService.updateCall(callId, {
            status,
            endedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Failed to update call on server:", err);
        }
      }

      if (chatId && callId) {
        useMessageStore
          .getState()
          .updateMessageCallStatus(chatId, callId, status);
      }

      get().disconnectFromLiveKit();

      set({
        localCallStatus: opt.isRejected
          ? LocalCallStatus.REJECTED
          : opt.isCancel
          ? LocalCallStatus.CANCELED
          : LocalCallStatus.ENDED,
        endedAt: new Date(),
      });
    },

    // ========== MEDIA ==========
    toggleLocalVoice: async (enable?: boolean) => {
      const { liveKitService } = get();
      if (!liveKitService) return;

      const local = liveKitService.getLocalParticipant();
      const shouldEnable =
        enable !== undefined ? enable : !local.isMicrophoneEnabled;

      await liveKitService.setMicrophoneEnabled(shouldEnable);
    },

    toggleLocalVideo: async (enable?: boolean) => {
      const { liveKitService } = get();
      if (!liveKitService) return;

      const local = liveKitService.getLocalParticipant();
      const shouldEnable =
        enable !== undefined ? enable : !local.isCameraEnabled;

      await liveKitService.setCameraEnabled(shouldEnable);
    },

    toggleLocalScreenShare: async (enable?: boolean) => {
      const { liveKitService } = get();
      if (!liveKitService) return;

      const local = liveKitService.getLocalParticipant();
      const shouldEnable =
        enable !== undefined ? enable : !local.isScreenShareEnabled;

      await liveKitService.setScreenShareEnabled(shouldEnable);
    },

    // ========== UTILS ==========
    setLocalCallStatus: (s) => set({ localCallStatus: s }),

    getCallDuration: () => {
      const { startedAt, endedAt } = get();
      if (!startedAt) return 0;
      const end = endedAt ? endedAt.getTime() : Date.now();
      return Math.floor((end - startedAt.getTime()) / 1000);
    },

    closeCallModal: () => {
      useModalStore.getState().closeModal();
      get().clearLiveKitState();
      set({
        chatId: null,
        localCallStatus: null,
        error: null,
      });
    },

    // ========== LiveKit ==========
    connectToLiveKitRoom: async (
      url: string,
      token: string,
      options?: { audio?: boolean; video?: boolean }
    ) => {
      const { liveKitService } = get();
      if (!liveKitService) return;

      await liveKitService.connect(url, token, {
        audio: options?.audio ?? true,
        video: options?.video ?? get().isVideoCall,
        onError: (err) => {
          set({ localCallStatus: LocalCallStatus.ERROR });
          console.error("LiveKit error:", err);
        },
      });

      set({ localCallStatus: LocalCallStatus.CONNECTED });
    },

    disconnectFromLiveKit: () => {
      const { liveKitService, timeoutRef } = get();
      if (timeoutRef) clearTimeout(timeoutRef);
      if (liveKitService) {
        liveKitService.disconnect();
        set({ liveKitService: null });
      }
    },

    getLiveKitRoom: () => get().liveKitService?.getRoom() || null,

    clearLiveKitState: () => {
      const { liveKitService } = get();
      if (liveKitService) liveKitService.disconnect();
      set({ liveKitService: null });
    },
  }))
);
