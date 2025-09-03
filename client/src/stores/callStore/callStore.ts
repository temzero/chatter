// stores/call/useCallStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CallStatus } from "@/types/enums/CallStatus";
import { useSFUCallStore } from "./sfuCallStore";
import { useP2PCallStore } from "./p2pCallStore";
import {
  callMember,
  P2PCallMember,
  SFUCallMember,
} from "@/types/store/callMember.type";
import { useModalStore } from "../modalStore";
import { audioService } from "@/services/audio.service";
import { handleError } from "@/utils/handleError";

export interface CallState {
  // Call metadata
  chatId: string | null;
  callerMemberId?: string;
  callStatus: CallStatus | null;
  isVideoCall: boolean;
  isGroupCall: boolean;
  timeoutRef?: NodeJS.Timeout;
  startedAt?: Date;
  endedAt?: Date;

  // Local streams (for UI preview in both architectures)
  localVoiceStream: MediaStream | null;
  localVideoStream: MediaStream | null;
  localScreenStream: MediaStream | null;

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
    isVideo: boolean,
    isGroup: boolean
  ) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: (isCancel?: boolean) => void;
  endCall: (option?: {
    isCancel?: boolean;
    isRejected?: boolean;
    isTimeout?: boolean;
  }) => void;

  // Status control
  setCallStatus: (status: CallStatus) => void;

  // Media toggles (delegated to architecture-specific stores)
  toggleLocalVoice: () => void;
  toggleLocalVideo: () => Promise<void>;
  toggleLocalScreenShare: () => Promise<void>;
  
  // Local stream management
  setupLocalStream: () => Promise<void>;
  setLocalVoiceStream: (stream: MediaStream | null) => void;
  setLocalVideoStream: (stream: MediaStream | null) => void;
  setLocalScreenStream: (stream: MediaStream | null) => void;
  cleanupStreams: () => void;

  setIsMuted: (isMuted: boolean) => void;
  setIsVideoEnable: (isMuted: boolean) => void;
  setIsScreenSharing: (isMuted: boolean) => void;

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
    localVoiceStream: null,
    localVideoStream: null,
    localScreenStream: null,
    isMuted: false,
    isVideoEnabled: false,
    isScreenSharing: false,
    error: null,

    // ========== CORE ACTIONS ==========
    startCall: async (chatId: string, isVideo: boolean, isGroup: boolean) => {
      try {
        if (isGroup) {
          await useSFUCallStore.getState().initializeSFUCall(chatId, isVideo);
        } else {
          await useP2PCallStore.getState().initializeP2PCall(chatId, isVideo);
        }
        set({
          chatId,
          isVideoCall: isVideo,
          isGroupCall: isGroup,
          callStatus: CallStatus.OUTGOING,
          // startedAt and isVideoEnabled should be set in initializeP2PCall
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
      set({ callStatus: CallStatus.CONNECTED, startedAt: new Date() });
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
      const { isGroupCall } = get();
      if (isGroupCall) {
        useSFUCallStore.getState().disconnectFromSFU();
      } else {
        useP2PCallStore.getState().cleanupP2PConnections();
      }

      set({
        callStatus: options.isRejected
          ? CallStatus.REJECTED
          : options.isCancel
          ? CallStatus.CANCELED
          : CallStatus.ENDED,
        endedAt: new Date(),
      });

      console.log("call ended");
    },

    setCallStatus: (status: CallStatus) => {
      set({ callStatus: status });
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

    // In your callStore.ts
    setupLocalStream: async () => {
      try {
        // Stop any existing tracks first
        const { localVoiceStream, localVideoStream, localScreenStream } = get();
        localVoiceStream?.getTracks().forEach((track) => track.stop());
        localVideoStream?.getTracks().forEach((track) => track.stop());
        localScreenStream?.getTracks().forEach((track) => track.stop());

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: get().isVideoCall,
        });

        // Create separate streams for audio and video
        const audioStream = new MediaStream();
        const videoStream = new MediaStream();

        // Separate audio and video tracks
        stream.getAudioTracks().forEach((track) => audioStream.addTrack(track));
        stream.getVideoTracks().forEach((track) => videoStream.addTrack(track));

        set({
          localVoiceStream: audioStream,
          localVideoStream: get().isVideoCall ? videoStream : null,
          isVideoEnabled:
            get().isVideoCall && videoStream.getVideoTracks().length > 0,
        });
      } catch (error) {
        set({ error: "permission_denied" });
        handleError(
          error,
          "Audio/video device is busy. Please close other applications using your microphone/camera."
        );
      }
    },

    setLocalVoiceStream: (stream: MediaStream | null) => {
      set({ localVoiceStream: stream });
    },

    setLocalVideoStream: (stream: MediaStream | null) => {
      set({ localVideoStream: stream });
    },

    setLocalScreenStream: (stream: MediaStream | null) => {
      set({ localScreenStream: stream });
    },

    cleanupStreams: () => {
      const { localVoiceStream, localVideoStream, localScreenStream } = get();
      localVoiceStream?.getTracks().forEach((track) => track.stop());
      localVideoStream?.getTracks().forEach((track) => track.stop());
      localScreenStream?.getTracks().forEach((track) => track.stop());

      set({
        localVoiceStream: null,
        localVideoStream: null,
        localScreenStream: null,
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
      // Cleanup shared/local streams
      get().cleanupStreams();
      // Cleanup call types
      clearP2PState();
      clearSFUState();
      set({
        chatId: null,
        callStatus: null,
        isGroupCall: false,
        error: null,
      });
    },
  }))
);
