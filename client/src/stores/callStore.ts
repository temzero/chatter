// stores/call/useCallStore.ts
import { Room } from "livekit-client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { audioService } from "@/services/audio.service";
import { useModalStore, ModalType } from "./modalStore";
import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { LiveKitService } from "@/services/liveKitService";
import { getMyCallToken } from "@/common/utils/call/getMyCallToken";
import { CallError, IncomingCallResponse } from "@shared/types/call";
import { callService } from "@/services/callService";
import { callWebSocketService } from "@/services/websocket/call.websocket.service";
import { handleError } from "@/common/utils/handleError";
import { getLocalCallStatus } from "@/common/utils/call/callHelpers";

export interface CallState {
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

export interface CallActions {
  // lifecycle
  startCall: (
    chatId: string,
    videoCall?: boolean,
    opts?: {
      videoStream?: MediaStream | null;
      screenStream?: MediaStream | null;
    }
  ) => Promise<void>;
  openBroadCastPreview: (chatId: string) => Promise<void>;
  joinCall: (options: {
    isVoiceEnabled?: boolean;
    isVideoEnabled?: boolean;
  }) => Promise<void>;
  declineCall: () => void;
  leaveCall: () => void;
  endCall: (opt?: {
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
  clearCallData: () => void;
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

    startCall: async (
      chatId: string,
      videoCall?: boolean,
      opts?: {
        videoStream?: MediaStream;
        screenStream?: MediaStream;
      }
    ) => {
      get().clearCallData();
      const isVideoCall = !!videoCall;
      // const isScreenShare = !!screenShare;

      try {
        set({
          chatId,
          isVideoCall,
          localCallStatus: LocalCallStatus.OUTGOING,
        });

        useModalStore.getState().openModal(ModalType.CALL);

        const timeoutRef = setTimeout(() => {
          if (get().localCallStatus === LocalCallStatus.OUTGOING) {
            get().endCall({ isTimeout: true });
          }
        }, 45000);
        set({ timeoutRef });

        // init LiveKit
        const liveKitService = new LiveKitService();
        set({ liveKitService });

        const token = await getMyCallToken(chatId);
        if (!token) {
          console.warn("[startCall] No token available for LiveKit");
          set({
            localCallStatus: LocalCallStatus.ERROR,
            error: CallError.PERMISSION_DENIED,
          });
          return;
        }

        // connect with requested options
        await get().connectToLiveKitRoom(token, {
          audio: true,
          video: opts?.videoStream ? false : isVideoCall,
        });

        // 👇 if screenShare is enabled and user already picked a screen in preview
        if (opts?.videoStream) {
          await liveKitService.toggleCamera(true, opts.screenStream);
        }
        if (opts?.screenStream) {
          await liveKitService.toggleScreenShare(true, opts.screenStream);
        }
      } catch (err) {
        console.error("[startCall] error:", err);
        set({
          error: CallError.INITIATION_FAILED,
          localCallStatus: LocalCallStatus.ERROR,
        });
        audioService.stopAllSounds();
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

      set({
        localCallStatus: LocalCallStatus.CONNECTING,
      });

      try {
        const liveKitService = new LiveKitService();
        set({ liveKitService });

        const token = await getMyCallToken(chatId);
        if (!token) {
          console.warn("[joinCall] No token available for LiveKit");
          set({
            localCallStatus: LocalCallStatus.ERROR,
            callStatus: CallStatus.FAILED,
            error: CallError.PERMISSION_DENIED,
          });
          return;
        }

        await get().connectToLiveKitRoom(token, {
          audio: options?.isVoiceEnabled ?? true,
          video: options?.isVideoEnabled ?? get().isVideoCall,
        });

        set({
          localCallStatus: LocalCallStatus.CONNECTED,
          callStatus: CallStatus.IN_PROGRESS,
        });

        const { openModal } = useModalStore.getState();
        openModal(ModalType.CALL, { callId, chatId });

        console.log("[joinCall] Successfully connected to LiveKit");
      } catch (err) {
        console.error("[joinCall] LiveKit connection failed:", err);
        handleError(err, "Could not connect to SFU");

        // Rollback state on failure
        set({
          localCallStatus: LocalCallStatus.ERROR,
          callStatus: CallStatus.FAILED,
          liveKitService: null,
        });
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
      } catch (err) {
        console.error("Failed to send decline call:", err);
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
      opt: {
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

      if (opt.isDeclined) {
        localCallStatus = LocalCallStatus.DECLINED;
      } else if (opt.isCancel) {
        localCallStatus = LocalCallStatus.CANCELED;
      } else if (opt.isTimeout) {
        localCallStatus = LocalCallStatus.TIMEOUT;
      } else {
        localCallStatus = LocalCallStatus.ENDED;
        endedAt = new Date();
      }
      // Update local state
      set({ localCallStatus, endedAt });
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
        console.log(
          `[getActiveCall] Already in call for chat ${chatId}, skipping fetch`
        );
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

      await liveKitService.connect(token, {
        audio: options?.audio ?? true,
        video: options?.video ?? false,
        screen: options?.screen ?? false,
        onError: (err) => {
          set({ localCallStatus: LocalCallStatus.ERROR });
          console.error("LiveKit error:", err);
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
  }))
);
