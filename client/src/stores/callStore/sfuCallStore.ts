// stores/call/useSFUCallStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { LiveKitService } from "@/services/liveKitService";
import { SFUCallMember } from "@/types/store/callMember.type";
import { useCallStore } from "./callStore";
import { RemoteParticipant } from "livekit-client";
import { CallStatus } from "@/types/enums/CallStatus";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { getMyChatMemberId } from "../chatMemberStore";

export interface SFUState {
  liveKitService: LiveKitService | null;
  sfuMembers: SFUCallMember[];
}

export interface SFUActions {
  initializeSFUCall: (chatId: string, isVideo: boolean) => Promise<void>;
  acceptSFUCall: () => Promise<void>;
  rejectSFUCall: (isCancel?: boolean) => void;
  connectToSFURoom: (token: string, url: string) => Promise<void>;
  disconnectFromSFU: () => void;

  // SFU Member Management
  getSFUMember: (memberId: string) => SFUCallMember | undefined;
  addSFUMember: (member: Partial<SFUCallMember>) => void;
  updateSFUMember: (member: Partial<SFUCallMember>) => void;
  removeSFUMember: (memberId: string) => void;

  // SFU Event Handlers
  handleSFUParticipantConnected: (participant: RemoteParticipant) => void;
  handleSFUParticipantDisconnected: (participant: RemoteParticipant) => void;
  handleSFUTrackSubscribed: (
    track: MediaStreamTrack,
    participant: RemoteParticipant
  ) => void;

  // Media Controls
  toggleAudio: (isEnable?: boolean) => void;
  toggleVideo: (isEnable?: boolean) => Promise<void>;
  toggleScreenShare: (isEnable?: boolean) => Promise<void>;

  // Clear state
  clearSFUState: () => void;
}

export const useSFUCallStore = create<SFUState & SFUActions>()(
  devtools((set, get) => ({
    // ========== SFU STATE ==========
    liveKitService: null,
    sfuMembers: [],

    // ========== SFU ACTIONS ==========
    initializeSFUCall: async (chatId: string, isVideo: boolean) => {
      const liveKitService = new LiveKitService();
      set({ liveKitService });

      // Configure LiveKit service options
      const options = {
        audio: true,
        video: isVideo,
        onParticipantConnected: get().handleSFUParticipantConnected,
        onParticipantDisconnected: get().handleSFUParticipantDisconnected,
        onTrackSubscribed: (
          track: MediaStreamTrack,
          participant: RemoteParticipant,
          kind: "audio" | "video"
        ) => {
          get().handleSFUTrackSubscribed(track, participant);
        },
        onError: (error: Error) => {
          useCallStore.getState().setCallStatus(CallStatus.ERROR);
          console.error("LiveKit error:", error);
        },
      };

      // Store will be connected later with token
    },

    acceptSFUCall: async () => {
      const { liveKitService } = get();
      if (!liveKitService) return;

      // Typically you'd get token from your backend
      const token = await generateSFUToken(); // Implement this
      const url = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

      await get().connectToSFURoom(token, url);
    },

    rejectSFUCall: (isCancel = false) => {
      get().disconnectFromSFU();
    },

    connectToSFURoom: async (token: string, url: string) => {
      const { liveKitService } = get();
      if (!liveKitService) return;

      try {
        await liveKitService.connect(url, token, {
          audio: true,
          video: useCallStore.getState().isVideoCall,
          onParticipantConnected: get().handleSFUParticipantConnected,
          onParticipantDisconnected: get().handleSFUParticipantDisconnected,
          onTrackSubscribed: (track, participant, kind) => {
            get().handleSFUTrackSubscribed(track, participant);
          },
          onError: (error) => {
            useCallStore.getState().setCallStatus(CallStatus.ERROR);
            console.error("LiveKit connection error:", error);
          },
        });
      } catch (error) {
        console.error("Failed to connect to SFU room:", error);
        useCallStore.getState().setCallStatus(CallStatus.ERROR);
      }
    },

    disconnectFromSFU: () => {
      const { liveKitService } = get();
      if (liveKitService) {
        liveKitService.disconnect();
        set({ liveKitService: null, sfuMembers: [] });
      }
    },

    addSFUMember: (member) => {
      set((state) => ({ sfuMembers: [...state.sfuMembers, member] }));
    },

    removeSFUMember: (memberId: string) => {
      set((state) => ({
        sfuMembers: state.sfuMembers.filter((m) => m.memberId !== memberId),
      }));
    },

    updateSFUMember: (
      member: Partial<SFUCallMember> & { memberId: string }
    ) => {
      set((state) => {
        const includeIfDefined = <T>(value: T | undefined, key: string) =>
          value !== undefined ? { [key]: value } : {};

        const updatedMembers = state.sfuMembers.map((m) =>
          m.memberId === member.memberId
            ? {
                ...m,
                ...includeIfDefined(member.isMuted, "isMuted"),
                ...includeIfDefined(member.isVideoEnabled, "isVideoEnabled"),
                ...includeIfDefined(member.isScreenSharing, "isScreenSharing"),
                lastActivity: Date.now(),
              }
            : m
        );

        return { sfuMembers: updatedMembers };
      });
    },

    getSFUMember: (memberId: string) => {
      return get().sfuMembers.find((m) => m.memberId === memberId);
    },

    handleSFUParticipantConnected: (participant: RemoteParticipant) => {
      const member: SFUCallMember = {
        memberId: participant.identity,
        displayName: participant.name || participant.identity,
        isMuted: false,
        isVideoEnabled: true,
        participant: participant,
      };

      get().addSFUMember(member);
    },

    handleSFUParticipantDisconnected: (participant: RemoteParticipant) => {
      get().removeSFUMember(participant.identity);
    },

    handleSFUTrackSubscribed: (
      track: MediaStreamTrack,
      participant: RemoteParticipant
    ) => {
      const member = get().getSFUMember(participant.identity);
      if (member) {
        const updates: Partial<SFUCallMember> = {};

        if (track.kind === "audio") {
          updates.isMuted = false;
        } else if (track.kind === "video") {
          updates.isVideoEnabled = true;
        }

        get().updateSFUMember(updates);
      }
    },

    toggleAudio: async (isEnable?: boolean) => {
      const { liveKitService } = get();
      const { chatId, isMuted } = useCallStore.getState();
      const myMemberId = getMyChatMemberId(chatId!);

      if (!myMemberId) return;

      // Determine target state - clearer logic
      if (isEnable === undefined) {
        isEnable = !isMuted;
      }

      try {
        await liveKitService?.toggleAudio(isEnable);

        // Update local state (muted is the opposite of enabled)
        useCallStore.getState().setIsMuted(!isEnable);

        // Notify other participants via WebSocket
        callWebSocketService.updateCallMember({
          chatId: chatId!,
          memberId: myMemberId,
          isMuted: !isEnable,
        });
      } catch (error) {
        console.error("Failed to toggle audio:", error);

        // Revert state and notify on error
        useCallStore.getState().setIsMuted(isMuted);

        callWebSocketService.updateCallMember({
          chatId: chatId!,
          memberId: myMemberId,
          isMuted: isMuted,
        });
      }
    },

    toggleVideo: async (isEnable?: boolean) => {
      const { liveKitService } = get();
      const { isVideoEnabled, localVideoStream } = useCallStore.getState();

      if (isEnable === undefined) {
        isEnable = isVideoEnabled;
      }

      try {
        if (isEnable) {
          // Disabling video
          await liveKitService?.toggleVideo(false);
          if (localVideoStream) {
            localVideoStream.getTracks().forEach((track) => track.stop());
          }
          useCallStore.getState().setIsVideoEnable(false);
          useCallStore.getState().setLocalVideoStream(null);
        } else {
          // Enabling video
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
          });

          await liveKitService?.toggleVideo(true);
          useCallStore.getState().setIsVideoEnable(true);
          useCallStore
            .getState()
            .setLocalVideoStream(new MediaStream(videoStream.getVideoTracks()));
        }
      } catch (error) {
        console.error("Failed to toggle video:", error);
        // Revert state on error
        useCallStore.getState().setIsVideoEnable(isEnable);
      }
    },

    toggleScreenShare: async (isEnable?: boolean) => {
      const { liveKitService } = get();
      const { isScreenSharing, localScreenStream } = useCallStore.getState();

      if (isEnable === undefined) {
        isEnable = isScreenSharing;
      }

      try {
        if (isEnable) {
          // Stop screen share
          await liveKitService?.toggleScreenShare(false);
          if (localScreenStream) {
            localScreenStream.getTracks().forEach((track) => track.stop());
          }
          useCallStore.getState().setIsScreenSharing(false);
          useCallStore.getState().setLocalScreenStream(null);
        } else {
          // Start screen share
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });

          await liveKitService?.toggleScreenShare(true);
          useCallStore.getState().setIsScreenSharing(true);
          useCallStore.getState().setLocalScreenStream(screenStream);

          // Handle browser UI stop
          screenStream.getTracks().forEach((track) => {
            track.onended = () => get().toggleScreenShare();
          });
        }
      } catch (error) {
        console.error("Failed to toggle screen share:", error);
        useCallStore.getState().setIsScreenSharing(isEnable);
      }
    },

    clearSFUState: () => {
      const { liveKitService } = get();

      if (liveKitService) {
        try {
          liveKitService.disconnect(); // custom disconnect wrapper
        } catch (err) {
          console.error("Error disconnecting SFU:", err);
        }
      }

      set({
        liveKitService: null,
        sfuMembers: [],
      });
    },
  }))
);

// Helper function to generate SFU token (implement based on your backend)
async function generateSFUToken(): Promise<string> {
  // This should call your backend to generate a LiveKit token
  throw new Error("generateSFUToken not implemented");
}
