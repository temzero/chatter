// stores/call/useCallStore.ts
import { Room } from "livekit-client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useModalStore, ModalType } from "./modalStore";
import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { LiveKitService } from "@/services/liveKitService";
import { getMyCallToken } from "@/common/utils/call/getMyCallToken";
import { CallError, IncomingCallResponse } from "@shared/types/call";
import { callService } from "@/services/http/callService";
import { callWebSocketService } from "@/services/websocket/callWebsocketService";
import { handleError } from "@/common/utils/error/handleError";
import { getLocalCallStatus } from "@/common/utils/call/callHelpers";
import { getCurrentUserId } from "./authStore";

interface CallState {
  liveKitService: LiveKitService | null;

  callId: string | null;
  chatId: string | null;
  isCaller: boolean;
  initiatorUserId?: string;
  initiatorMemberId?: string;

  callStatus: CallStatus | null;
  localCallStatus: LocalCallStatus | null;
  isVideoCall: boolean;
  timeoutRef?: NodeJS.Timeout | null;
  startedAt?: Date;
  endedAt?: Date;

  error?: CallError | null;
}

interface CallActions {
  // lifecycle
  startCall: (
    chatId: string,
    options?: {
      isVoiceEnabled?: boolean;
      isVideoCall?: boolean;
      screenStream?: MediaStream | null;
    }
  ) => Promise<void>;
  setIncomingCall: (payload: IncomingCallResponse) => void;
  openBroadCastPreview: (chatId: string) => Promise<void>;
  joinCall: (options: {
    isVoiceEnabled?: boolean;
    isVideoEnabled?: boolean;
  }) => Promise<void>;
  declineCall: () => void;
  leaveCall: () => void;
  endCall: (options?: {
    isCancel?: boolean;
    isDeclined?: boolean;
    isTimeout?: boolean;
  }) => void;

  // toggles
  toggleLocalVoice: (enable?: boolean) => Promise<void>;
  toggleLocalVideo: (enable?: boolean) => Promise<boolean>;
  toggleLocalScreenShare: (enable?: boolean) => Promise<void>;

  // utils
  getActiveCall: (chatId: string) => Promise<IncomingCallResponse | null>;
  setLocalCallStatus: (s: LocalCallStatus) => void;
  getCallDuration: () => number | null;
  closeCallModal: () => void;

  // LiveKit
  connectToLiveKitRoom: (
    token: string,
    options: {
      audio?: boolean;
      video?: boolean;
      screen?: boolean;
    }
  ) => Promise<void>;
  disconnectFromLiveKit: () => void;
  getLiveKitRoom: () => Room | null;
  clearLiveKitState: () => void;

  clearCallData: () => void;
  clearCallStore: () => void;
}

const initialState: CallState = {
  liveKitService: null,

  callId: null,
  chatId: null,
  isCaller: false,

  callStatus: null,
  localCallStatus: null,
  isVideoCall: false,
  timeoutRef: null,
  startedAt: undefined,
  endedAt: undefined,
  error: null,
};

export const useCallStore = create<CallState & CallActions>()(
  devtools((set, get) => ({
    ...initialState,

    startCall: async (
      chatId: string,
      options?: {
        isVoiceEnabled?: boolean;
        isVideoCall?: boolean;
        screenStream?: MediaStream | null;
      }
    ) => {
      // Clear previous call data
      get().clearCallData();

      const {
        isVoiceEnabled = true,
        isVideoCall = false,
        screenStream = null,
      } = options ?? {};

      try {
        // Set initial state
        set({
          chatId,
          isVideoCall,
          localCallStatus: LocalCallStatus.OUTGOING,
        });

        useModalStore.getState().openModal(ModalType.CALL);

        // Timeout if call not answered
        const timeoutRef = setTimeout(() => {
          if (get().localCallStatus === LocalCallStatus.OUTGOING) {
            get().endCall({ isTimeout: true });
          }
        }, 45000);
        set({ timeoutRef });

        // Initialize LiveKit
        const liveKitService = new LiveKitService();
        set({ liveKitService });

        const token = await getMyCallToken(chatId);
        if (!token) {
          console.warn("[START CALL] No token available for LiveKit");
          set({
            localCallStatus: LocalCallStatus.ERROR,
            error: CallError.PERMISSION_DENIED,
          });
          return;
        }

        // Connect to LiveKit using preview settings
        await get().connectToLiveKitRoom(token, {
          audio: isVoiceEnabled,
          video: isVideoCall,
        });

        // Attach screen share if provided
        if (screenStream) {
          await liveKitService.toggleScreenShare(true, screenStream);
        }
      } catch (error) {
        console.error("[START CALL]", error);
        set({
          error: CallError.INITIATION_FAILED,
          localCallStatus: LocalCallStatus.ERROR,
        });
        handleError(error, "Failed to start call");
      }
    },

    setIncomingCall: (payload) => {
      const {
        callId,
        chatId,
        isVideoCall,
        initiatorUserId,
        initiatorMemberId,
        status,
        isBroadcast,
      } = payload;

      const currentUserId = getCurrentUserId();
      const isCaller = initiatorUserId === currentUserId;

      // Prevent duplicate incoming call if already handling one
      if (!isCaller && get().callId) {
        console.warn("Already have an incoming call, ignoring new one");
        return;
      }

      set({
        callId,
        chatId,
        isCaller,
        isVideoCall: isBroadcast ? false : isVideoCall,
        initiatorUserId,
        initiatorMemberId,
        ...(isBroadcast
          ? {}
          : {
              localCallStatus: isCaller
                ? LocalCallStatus.OUTGOING
                : LocalCallStatus.INCOMING,
            }),
        callStatus: isBroadcast ? CallStatus.IN_PROGRESS : status,
      });

      if (!isCaller && !isBroadcast) {
        useModalStore.getState().openModal(ModalType.CALL);
      }
    },

    openBroadCastPreview: async (chatId: string) => {
      get().clearCallData();
      // update base state
      set({
        chatId,
        localCallStatus: LocalCallStatus.CHECK_BROADCAST,
      });

      useModalStore.getState().openModal(ModalType.CALL);

      const timeoutRef = setTimeout(() => {
        if (get().localCallStatus === LocalCallStatus.OUTGOING) {
          get().endCall({ isTimeout: true });
        }
      }, 45000);
      set({ timeoutRef });
    },

    joinCall: async (options?: {
      isVoiceEnabled?: boolean;
      isVideoEnabled?: boolean;
    }) => {
      const { callId, chatId } = get();
      if (!callId || !chatId) return;

      const { isVoiceEnabled = true, isVideoEnabled = false } = options ?? {};

      set({
        localCallStatus: LocalCallStatus.CONNECTING,
      });

      try {
        const liveKitService = new LiveKitService();
        set({ liveKitService });

        const token = await getMyCallToken(chatId);
        if (!token) {
          console.error("[JOIN CALL]", "No token available for LiveKit");
          set({
            localCallStatus: LocalCallStatus.ERROR,
            callStatus: CallStatus.FAILED,
            error: CallError.PERMISSION_DENIED,
          });
          return;
        }

        await get().connectToLiveKitRoom(token, {
          audio: isVoiceEnabled ?? true,
          video: isVideoEnabled ?? get().isVideoCall,
        });

        set({
          localCallStatus: LocalCallStatus.CONNECTED,
          callStatus: CallStatus.IN_PROGRESS,
        });

        useModalStore.getState().openModal(ModalType.CALL, { callId, chatId });

        console.log("[JOIN CALL]", "Successfully connected to LiveKit");
      } catch (error) {
        set({
          localCallStatus: LocalCallStatus.ERROR,
          callStatus: CallStatus.FAILED,
          liveKitService: null,
        });
        handleError(error, "Could not connect to SFU");
      }
    },

    declineCall: () => {
      const { chatId, callId, endCall, closeCallModal } = get();
      if (!chatId || !callId) {
        console.error("Missing CallId or ChatId");
        return;
      }

      // Notify server
      try {
        callWebSocketService.declineCall({ chatId, callId });
      } catch (error) {
        console.error("Failed to send decline call:", error);
      }

      // Update local state
      endCall({ isDeclined: true });

      // Close modal but keep call data if call is still in progress
      closeCallModal();
    },

    leaveCall: () => {
      const { disconnectFromLiveKit, closeCallModal, liveKitService } = get();

      // const { localVideoStream, localAudioStream, localScreenStream } =
      //   useLocalTracks(); // call the hook directly to get the state
      // [localVideoStream, localAudioStream, localScreenStream].forEach(
      //   (stream) => stream?.getTracks().forEach((track) => track.stop())
      // );

      // Stop all local tracks (video, audio, screen)
      if (liveKitService) {
        const local = liveKitService.getLocalParticipant();
        if (local) {
          local.getTrackPublications().forEach((pub) => {
            pub.track?.stop();
            pub.track?.mediaStreamTrack?.stop();
          });
        }
      }

      disconnectFromLiveKit();
      closeCallModal();
    },

    endCall: async (
      options: {
        isDeclined?: boolean;
        isCancel?: boolean;
        isTimeout?: boolean;
      } = {}
    ) => {
      // Disconnect from LiveKit
      get().disconnectFromLiveKit();

      //Determine local call status
      let localCallStatus: LocalCallStatus;
      let endedAt: Date | undefined;

      if (options.isDeclined) {
        localCallStatus = LocalCallStatus.DECLINED;
      } else if (options.isCancel) {
        localCallStatus = LocalCallStatus.CANCELED;
      } else if (options.isTimeout) {
        localCallStatus = LocalCallStatus.TIMEOUT;
      } else {
        localCallStatus = LocalCallStatus.ENDED;
        endedAt = new Date();
      }
      // Update local state
      set({ localCallStatus, endedAt });

      // audioService.playSound(SoundType.CALL_END);
    },

    // ========== MEDIA ==========
    toggleLocalVoice: async (enable?: boolean) => {
      const { liveKitService } = get();
      if (!liveKitService) return;

      const local = liveKitService.getLocalParticipant();
      const shouldEnable =
        enable !== undefined ? enable : !local.isMicrophoneEnabled;

      await liveKitService.toggleMicrophone(shouldEnable);
    },

    toggleLocalVideo: async (enable?: boolean) => {
      const { liveKitService } = get();
      if (!liveKitService) return;

      const local = liveKitService.getLocalParticipant();
      const shouldEnable =
        enable !== undefined ? enable : !local.isCameraEnabled;

      await liveKitService.toggleCamera(shouldEnable);
      set({ isVideoCall: shouldEnable });
      return shouldEnable;
    },

    toggleLocalScreenShare: async (enable?: boolean) => {
      const { liveKitService } = get();
      if (!liveKitService) return;

      const local = liveKitService.getLocalParticipant();
      const shouldEnable =
        enable !== undefined ? enable : !local.isScreenShareEnabled;

      await liveKitService.toggleScreenShare(shouldEnable);
    },

    // ========== UTILS ==========
    getActiveCall: async (chatId: string) => {
      const {
        callId: currentCallId,
        chatId: currentChatId,
        callStatus,
      } = get();

      // Stop if current chat is already in a call
      if (
        currentCallId &&
        currentChatId === chatId &&
        callStatus === CallStatus.IN_PROGRESS
      ) {
        console.log(`Already in call for chat ${chatId}, skipping fetch`);
        return null;
      }

      try {
        const call = await callService.fetchActiveCall(chatId);

        if (call) {
          set({
            callId: call.callId,
            chatId: call.chatId,
            isVideoCall: call.isVideoCall,
            callStatus: call.status,
            localCallStatus: getLocalCallStatus(call.status),
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
      if (!startedAt || !endedAt) return null;
      return Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
    },

    closeCallModal: () => {
      useModalStore.getState().closeModal();
      get().clearLiveKitState();
      set({ localCallStatus: null });

      const { callStatus } = get();
      if (
        callStatus === CallStatus.COMPLETED ||
        callStatus === CallStatus.MISSED ||
        callStatus === CallStatus.FAILED
      ) {
        get().clearCallData();
      }
    },

    // ========== LiveKit ==========
    connectToLiveKitRoom: async (
      token: string,
      options?: { audio?: boolean; video?: boolean; screen?: boolean }
    ) => {
      const { liveKitService } = get();
      if (!liveKitService) return;

      const { audio = true, video = false, screen = false } = options ?? {};

      await liveKitService.connect(token, {
        audio,
        video,
        screen,
        onError: (error) => {
          set({ localCallStatus: LocalCallStatus.ERROR });
          console.error("[LIVEKIT]", error);
        },
      });
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

    clearCallStore: () => {
      const { liveKitService, timeoutRef } = get();
      if (timeoutRef) clearTimeout(timeoutRef);
      if (liveKitService) liveKitService.disconnect();

      set({ ...initialState });
    },
  }))
);
