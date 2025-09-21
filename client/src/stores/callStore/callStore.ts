// stores/call/useCallStore.ts
import { Room } from "livekit-client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { audioService } from "@/services/audio.service";
import { useModalStore, ModalType } from "../modalStore";
import { useMessageStore } from "../messageStore";
import { CallStatus, LocalCallStatus } from "@/types/enums/CallStatus";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { LiveKitService } from "@/services/liveKitService";
import { getMyToken } from "./helpers/call.helper";
import { handleError } from "@/utils/handleError";
import {
  CallError,
  // CallErrorResponse,
  IncomingCallResponse,
} from "@/types/callPayload";
import { callService } from "@/services/callService";

export interface CallState {
  liveKitService: LiveKitService | null;

  callId: string | null;
  chatId: string | null;
  initiatorMemberId?: string;

  callStatus: CallStatus | null;
  localCallStatus: LocalCallStatus | null;
  isVideoCall: boolean;
  timeoutRef?: NodeJS.Timeout | null;
  startedAt?: Date;
  endedAt?: Date;

  error?: CallError | null;
}

export interface CallActions {
  // lifecycle
  startCall: (chatId: string, videoCall?: boolean) => Promise<void>;
  joinCall: (options: {
    isVoiceEnabled?: boolean;
    isVideoEnabled?: boolean;
  }) => Promise<void>;
  rejectCall: (isCancel?: boolean) => void;
  leaveCall: () => void;
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
  getActiveCall: (chatId: string) => Promise<IncomingCallResponse | null>;
  setLocalCallStatus: (s: LocalCallStatus) => void;
  getCallDuration: () => number;
  clearCallData: () => void;
  closeCallModal: () => void;

  // LiveKit
  connectToLiveKitRoom: (
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
    startCall: async (chatId: string, videoCall?: boolean) => {
      get().clearCallData();
      const isVideoCall = !!videoCall;
      try {
        // update base state
        set({
          chatId,
          isVideoCall,
          localCallStatus: LocalCallStatus.OUTGOING,
          startedAt: new Date(),
        });
        console.log("[startCall] Base state set -> OUTGOING");

        useModalStore.getState().openModal(ModalType.CALL);
        console.log("[startCall] Opened Call Modal");

        const timeoutRef = setTimeout(() => {
          if (get().localCallStatus === LocalCallStatus.OUTGOING) {
            console.warn("[startCall] Timeout reached (60s), ending call");
            get().endCall({ isTimeout: true });
          }
        }, 60000);
        set({ timeoutRef });
        console.log("[startCall] Timeout scheduled (60s)");

        // init LiveKit
        const liveKitService = new LiveKitService();
        set({ liveKitService });
        console.log("[startCall] LiveKitService initialized");

        const token = await getMyToken(chatId);
        if (!token) {
          console.warn("[startCall] No token available for LiveKit");
          set({
            localCallStatus: LocalCallStatus.ERROR,
            error: CallError.PERMISSION_DENIED,
          });
          return;
        }

        console.log("[startCall] Connecting to LiveKit room...");
        await get().connectToLiveKitRoom(token, {
          audio: true,
          video: isVideoCall,
        });
        console.log("[startCall] Successfully connected to LiveKit");
      } catch (err) {
        console.error("[startCall] error:", err);
        set({
          error: CallError.INITIATION_FAILED,
          localCallStatus: LocalCallStatus.ERROR,
        });
        audioService.stopAllSounds();
      }
    },

    joinCall: async (options?: {
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
            error: CallError.PERMISSION_DENIED,
          });
          return;
        }

        await get().connectToLiveKitRoom(token, {
          audio: options?.isVoiceEnabled ?? true,
          video: options?.isVideoEnabled ?? get().isVideoCall,
        });

        // callWebSocketService.joinCall({
        //   chatId,
        //   callId,
        //   isCallerCancel: false,
        // });
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
      get().endCall({ isCancel });
    },

    leaveCall: () => {
      get().disconnectFromLiveKit();
      get().endCall();
      get().closeCallModal();
    },

    endCall: async (opt = {}) => {
      const { chatId, callId } = get();

      // 🔹 Just disconnect from LiveKit
      get().disconnectFromLiveKit();
      // 🔹 Update local state only (UI purposes)
      set({
        localCallStatus: opt.isRejected
          ? LocalCallStatus.REJECTED
          : opt.isCancel
          ? LocalCallStatus.CANCELED
          : opt.isTimeout
          ? LocalCallStatus.ENDED // missed will be handled by server
          : LocalCallStatus.ENDED,
        endedAt: new Date(),
      });

      // 🔹 Let server handle DB + system message creation
      // If you want UI to reflect instantly, you could still optimistically update message store:
      if (chatId && callId) {
        useMessageStore
          .getState()
          .updateMessageCallStatus(chatId, callId, CallStatus.COMPLETED);
      }
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
    getActiveCall: async (chatId: string) => {
      try {
        const call = await callService.fetchActiveCall(chatId);
        if (call) {
          set({
            callId: call.callId,
            chatId: call.chatId,
            isVideoCall: call.isVideoCall,
            callStatus: call.status,
            localCallStatus:
              call.status === CallStatus.IN_PROGRESS
                ? LocalCallStatus.CONNECTED
                : LocalCallStatus.INCOMING,
            startedAt: call.startedAt ? new Date(call.startedAt) : undefined,
          });
        }
        return call;
      } catch (error) {
        console.error("Failed to fetch active call:", error);
        return null;
      }
    },

    setLocalCallStatus: (s) => set({ localCallStatus: s }),

    getCallDuration: () => {
      const { startedAt, endedAt } = get();
      if (!startedAt) return 0;
      const end = endedAt ? endedAt.getTime() : Date.now();
      return Math.floor((end - startedAt.getTime()) / 1000);
    },

    clearCallData: () => {
      set({
        callId: null,
        chatId: null,
        initiatorMemberId: undefined,
        isVideoCall: false,
        localCallStatus: null,
        startedAt: undefined,
        endedAt: undefined,
        error: null,
        timeoutRef: null,
      });
    },

    closeCallModal: () => {
      useModalStore.getState().closeModal();
      get().clearLiveKitState();
      get().clearCallData();
    },

    // ========== LiveKit ==========
    connectToLiveKitRoom: async (
      token: string,
      options?: { audio?: boolean; video?: boolean }
    ) => {
      const { liveKitService, isVideoCall } = get();
      if (!liveKitService) return;

      await liveKitService.connect(token, {
        audio: options?.audio ?? true,
        video: options?.video ?? isVideoCall,
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
