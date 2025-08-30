import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { LiveKitService } from "@/services/liveKitService";
import { SFUCallMember } from "@/types/store/callMember.type";
import { useCallStore } from "./callStore";
import {
  RemoteParticipant,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
} from "livekit-client";
import { CallStatus } from "@/types/enums/CallStatus";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { callService } from "@/services/callService";

import { getMyChatMember, getMyChatMemberId } from "../chatMemberStore";
export interface SFUState {
  liveKitService: LiveKitService | null;
  sfuMembers: SFUCallMember[];
}

export interface SFUActions {
  initializeSFUCall: (chatId: string, isVideoCall: boolean) => Promise<void>;
  acceptSFUCall: () => Promise<void>;
  rejectSFUCall: (isCancel?: boolean) => void;
  connectToSFURoom: (token: string, url: string) => Promise<void>;
  disconnectFromSFU: () => void;

  // SFU Member Management
  getSFUMember: (memberId: string) => SFUCallMember | undefined;
  addSFUMember: (member: Partial<SFUCallMember>) => void;
  updateSFUMember: (
    member: Partial<SFUCallMember> & { memberId: string }
  ) => void;
  removeSFUMember: (memberId: string) => void;

  // SFU Event Handlers
  handleSFUParticipantConnected: (participant: RemoteParticipant) => void;
  handleSFUParticipantDisconnected: (participant: RemoteParticipant) => void;
  handleSFUTrackSubscribed: (
    track: MediaStreamTrack,
    participant: RemoteParticipant
  ) => void;
  handleSFUTrackUnsubscribed: (
    track: MediaStreamTrack,
    participant: RemoteParticipant
  ) => void;

  // Media Controls
  toggleAudio: (isEnable?: boolean) => Promise<void>;
  toggleVideo: (isEnable?: boolean) => Promise<void>;
  toggleScreenShare: (isEnable?: boolean) => Promise<void>;

  // WebSocket Listeners
  setupWebSocketListeners: () => void;
  removeWebSocketListeners: () => void;

  // Clear state
  clearSFUState: () => void;
}

export const useSFUCallStore = create<SFUState & SFUActions>()(
  devtools((set, get) => ({
    // ========== SFU STATE ==========
    liveKitService: null,
    sfuMembers: [],

    // ========== SFU ACTIONS ==========
    initializeSFUCall: async (chatId: string, isVideoCall: boolean) => {
      const liveKitService = new LiveKitService();
      set({ liveKitService });

      try {
        // Set up WebSocket listeners
        get().setupWebSocketListeners();
        callWebSocketService.initiateCall({
          chatId,
          isVideoCall,
          isGroupCall: true,
        });

        // Generate token for LiveKit room
        const myChatMember = getMyChatMember(chatId);
        const participantName =
          myChatMember?.nickname ||
          [myChatMember?.firstName, myChatMember?.lastName]
            .filter(Boolean)
            .join(" ");

        const token = await callService.getToken(
          chatId,
          myChatMember?.id ?? "anonymous",
          participantName
        );
        const url = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

        await get().connectToSFURoom(token, url);
      } catch (error) {
        console.error("Failed to initialize SFU call:", error);
        useCallStore.getState().setCallStatus(CallStatus.ERROR);
      }
    },

    acceptSFUCall: async () => {
      const { liveKitService, setupWebSocketListeners } = get();
      const { chatId } = useCallStore.getState();
      // Generate token for LiveKit room

      if (!liveKitService || !chatId) return;
      const myChatMember = getMyChatMember(chatId);

      try {
        // Set up WebSocket listeners
        setupWebSocketListeners();
        const participantName =
          myChatMember?.nickname ||
          [myChatMember?.firstName, myChatMember?.lastName]
            .filter(Boolean)
            .join(" ");

        // Generate token for joining
        const token = await callService.getToken(
          chatId,
          myChatMember?.id || "anonymous",
          participantName
        );
        const url = process.env.NEXT_PUBLIC_LIVEKIT_URL!;
        await get().connectToSFURoom(token, url);

        // Notify others of acceptance
        callWebSocketService.acceptCall({ chatId });
        useCallStore.getState().setCallStatus(CallStatus.CONNECTED);
        useCallStore.getState().setIsVideoEnable(true);
      } catch (error) {
        console.error("Failed to accept SFU call:", error);
        useCallStore.getState().setCallStatus(CallStatus.ERROR);
      }
    },

    rejectSFUCall: (isCancel = false) => {
      const { chatId } = useCallStore.getState();
      const myMemberId = getMyChatMemberId(chatId!);

      if (chatId && myMemberId) {
        if (isCancel) {
          callWebSocketService.cancelCall({ chatId });
        } else {
          callWebSocketService.rejectCall({ chatId });
        }
      }
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
          onTrackSubscribed: (track, participant) => {
            get().handleSFUTrackSubscribed(track, participant);
          },
          onTrackUnsubscribed: (track, participant) => {
            get().handleSFUTrackUnsubscribed(track, participant);
          },
          onError: (error) => {
            useCallStore.getState().setCallStatus(CallStatus.ERROR);
            console.error("LiveKit connection error:", error);
          },
        });

        // Setup local stream after connecting
        await useCallStore.getState().setupLocalStream();
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
      get().removeWebSocketListeners();
    },

    // ========== SFU MEMBER MANAGEMENT ==========
    addSFUMember: (member: Partial<SFUCallMember>) => {
      const participant = member.participant as RemoteParticipant;
      if (!participant) return;

      set((state) => ({
        sfuMembers: [
          ...state.sfuMembers,
          {
            memberId: participant.identity,
            displayName: participant.name || participant.identity,
            isMuted: false,
            isVideoEnabled: false,
            isScreenSharing: false,
            participant,
            lastActivity: Date.now(),
          },
        ],
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
                ...includeIfDefined(member.voiceStream, "voiceStream"),

                ...includeIfDefined(member.videoStream, "videoStream"),
                ...includeIfDefined(member.screenStream, "screenStream"),
                lastActivity: Date.now(),
              }
            : m
        );

        return { sfuMembers: updatedMembers };
      });
    },

    removeSFUMember: (memberId: string) => {
      set((state) => ({
        sfuMembers: state.sfuMembers.filter((m) => m.memberId !== memberId),
      }));
    },

    getSFUMember: (memberId: string) => {
      return get().sfuMembers.find((m) => m.memberId === memberId);
    },

    // ========== SFU EVENT HANDLERS ==========
    handleSFUParticipantConnected: (participant: RemoteParticipant) => {
      const member: SFUCallMember = {
        memberId: participant.identity,
        displayName: participant.name || participant.identity,
        isMuted: false,
        isVideoEnabled: useCallStore.getState().isVideoCall,
        isScreenSharing: false,
        participant,
      };

      get().addSFUMember(member);
    },

    handleSFUParticipantDisconnected: (participant: RemoteParticipant) => {
      get().removeSFUMember(participant.identity);
    },

    handleSFUTrackSubscribed: (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      const member = get().getSFUMember(participant.identity);
      if (!member) return;

      const updates = {
        memberId: participant.identity,
      } as Partial<SFUCallMember> & { memberId: string };

      const mediaStream = new MediaStream([track.mediaStreamTrack]);

      if (track.kind === "audio") {
        updates.voiceStream = mediaStream;
        updates.isMuted = false;
      } else if (track.kind === "video") {
        if (publication.source === Track.Source.ScreenShare) {
          updates.screenStream = mediaStream;
          updates.isScreenSharing = true;
        } else {
          updates.videoStream = mediaStream;
          updates.isVideoEnabled = true;
        }
      }

      get().updateSFUMember(updates);

      callWebSocketService.updateCallMember({
        chatId: useCallStore.getState().chatId!,
        memberId: participant.identity,
        isMuted: updates.isMuted,
        isVideoEnabled: updates.isVideoEnabled,
        isScreenSharing: updates.isScreenSharing,
      });
    },

    handleSFUTrackUnsubscribed: (
      track: MediaStreamTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      const member = get().getSFUMember(participant.identity);
      if (!member) return;

      const updates = {
        memberId: participant.identity,
      } as Partial<SFUCallMember> & { memberId: string };

      if (track.kind === "audio") {
        updates.voiceStream = null;
        updates.isMuted = true;
      } else if (track.kind === "video") {
        if (publication.source === Track.Source.ScreenShare) {
          updates.screenStream = null;
          updates.isScreenSharing = false;
        } else {
          updates.videoStream = null;
          updates.isVideoEnabled = false;
        }
      }

      get().updateSFUMember(updates);

      // Notify WebSocket service
      callWebSocketService.updateCallMember({
        chatId: useCallStore.getState().chatId!,
        memberId: participant.identity,
        isMuted: updates.isMuted,
        isVideoEnabled: updates.isVideoEnabled,
        isScreenSharing: updates.isScreenSharing,
      });
    },

    // ========== MEDIA CONTROLS ==========
    toggleAudio: async (isEnable?: boolean) => {
      const { liveKitService } = get();
      const { chatId, isMuted } = useCallStore.getState();
      const myMemberId = getMyChatMemberId(chatId!);

      if (!liveKitService || !chatId || !myMemberId) return;

      const targetState = isEnable === undefined ? !isMuted : isEnable;

      try {
        await liveKitService.toggleAudio(targetState);
        useCallStore.getState().setIsMuted(!targetState);
        callWebSocketService.updateCallMember({
          chatId,
          memberId: myMemberId,
          isMuted: !targetState,
        });
      } catch (error) {
        console.error("Failed to toggle audio:", error);
        useCallStore.getState().setIsMuted(isMuted);
        callWebSocketService.updateCallMember({
          chatId,
          memberId: myMemberId,
          isMuted,
        });
      }
    },

    toggleVideo: async (isEnable?: boolean) => {
      const { liveKitService } = get();
      const { chatId, isVideoEnabled, localVideoStream } =
        useCallStore.getState();
      const myMemberId = getMyChatMemberId(chatId!);

      if (!liveKitService || !chatId || !myMemberId) return;

      const targetState = isEnable === undefined ? !isVideoEnabled : isEnable;

      try {
        if (!targetState) {
          // Disabling video
          await liveKitService.toggleVideo(false);
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
          await liveKitService.toggleVideo(true);
          useCallStore.getState().setIsVideoEnable(true);
          useCallStore
            .getState()
            .setLocalVideoStream(new MediaStream(videoStream.getVideoTracks()));
        }

        callWebSocketService.updateCallMember({
          chatId,
          memberId: myMemberId,
          isVideoEnabled: targetState,
        });
      } catch (error) {
        console.error("Failed to toggle video:", error);
        useCallStore.getState().setIsVideoEnable(isVideoEnabled);
        callWebSocketService.updateCallMember({
          chatId,
          memberId: myMemberId,
          isVideoEnabled,
        });
      }
    },

    toggleScreenShare: async (isEnable?: boolean) => {
      const { liveKitService } = get();
      const { chatId, isScreenSharing, localScreenStream } =
        useCallStore.getState();
      const myMemberId = getMyChatMemberId(chatId!);

      if (!liveKitService || !chatId || !myMemberId) return;

      const targetState = isEnable === undefined ? !isScreenSharing : isEnable;

      try {
        if (!targetState) {
          // Stop screen share
          await liveKitService.toggleScreenShare(false);
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
          await liveKitService.toggleScreenShare(true);
          useCallStore.getState().setIsScreenSharing(true);
          useCallStore.getState().setLocalScreenStream(screenStream);

          // Handle browser UI stop
          screenStream.getTracks().forEach((track) => {
            track.onended = () => get().toggleScreenShare(false);
          });
        }

        callWebSocketService.updateCallMember({
          chatId,
          memberId: myMemberId,
          isScreenSharing: targetState,
        });
      } catch (error) {
        console.error("Failed to toggle screen share:", error);
        useCallStore.getState().setIsScreenSharing(isScreenSharing);
        callWebSocketService.updateCallMember({
          chatId,
          memberId: myMemberId,
          isScreenSharing,
        });
      }
    },

    // ========== CLEAR STATE ==========
    clearSFUState: () => {
      const { liveKitService } = get();

      if (liveKitService) {
        try {
          liveKitService.disconnect();
        } catch (err) {
          console.error("Error disconnecting SFU:", err);
        }
      }

      set({
        liveKitService: null,
        sfuMembers: [],
      });
      get().removeWebSocketListeners();
    },
  }))
);
