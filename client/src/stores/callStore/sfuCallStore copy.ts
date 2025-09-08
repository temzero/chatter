import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { LiveKitService } from "@/services/liveKitService";
import { SFUCallMember } from "@/types/store/callMember.type";
import { useCallStore } from "./callStore";
import { CallStatus } from "@/types/enums/CallStatus";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { callService } from "@/services/callService";
import { getMyChatMember, getMyChatMemberId } from "../chatMemberStore";
import { toast } from "react-toastify";
import { ModalType, useModalStore } from "../modalStore";
import { handleError } from "@/utils/handleError";
import {
  RemoteParticipant,
  Track,
  RemoteTrackPublication,
  RemoteTrack,
} from "livekit-client";
import { stopMediaStreams } from "@/utils/webRtc/localStream.Utils";

export interface SFUState {
  liveKitService: LiveKitService | null;
  sfuMembers: SFUCallMember[];
}

export interface SFUActions {
  initializeSFUCall: (chatId: string, isVideoCall: boolean) => Promise<void>;
  acceptSFUCall: () => Promise<void>;
  rejectSFUCall: (isCancel?: boolean) => void;
  connectToSFURoom: (url: string, token: string) => Promise<void>;
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
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => void;
  handleSFUTrackUnsubscribed: (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => void;

  // Media Controls
  toggleAudio: (enable?: boolean) => Promise<void>;
  toggleVideo: (enable?: boolean) => Promise<void>;
  toggleScreenShare: (enable?: boolean) => Promise<void>;

  // Clear state
  stopMemberStreams: (member: SFUCallMember) => void;
  clearSFUState: () => void;
}

export const useSFUCallStore = create<SFUState & SFUActions>()(
  devtools((set, get) => ({
    // ========== SFU STATE ==========
    liveKitService: null,
    sfuMembers: [],

    // ========== SFU ACTIONS ==========
    initializeSFUCall: async (chatId: string, isVideoCall: boolean) => {
      toast.info(`initializeSFUCall, isVideoCall: ${isVideoCall}`);

      try {
        // 1. Update base store with necessary state (NO media streams yet)
        useCallStore.setState({
          isVideoEnabled: isVideoCall,
          startedAt: new Date(),
          chatId,
          isVideoCall: isVideoCall,
          callStatus: CallStatus.OUTGOING,
        });

        // 2. OPEN MODAL
        useModalStore.getState().openModal(ModalType.CALL);

        // 3. Set timeout
        const timeoutRef = setTimeout(() => {
          const { callStatus } = useCallStore.getState();
          if (callStatus === CallStatus.OUTGOING) {
            useCallStore
              .getState()
              .endCall({ isTimeout: true, isCancel: true });
          }
        }, 60000);

        useCallStore.setState({ timeoutRef });

        // 4. Initialize LiveKit service
        const liveKitService = new LiveKitService();
        set({ liveKitService });

        // 5. Generate token for LiveKit room
        const myChatMember = await getMyChatMember(chatId);
        const myChatMemberId = myChatMember?.id;
        if (!myChatMemberId) {
          console.error("myChatMemberId is missing");
          return;
        }
        const participantName =
          myChatMember?.nickname ||
          [myChatMember?.firstName, myChatMember?.lastName]
            .filter(Boolean)
            .join(" ");

        const token = await callService.getToken(
          chatId,
          myChatMemberId,
          participantName
        );
        if (!token) return;

        const url = import.meta.env.VITE_LIVEKIT_URL;

        // 6. Connect to LiveKit SFU (LiveKit will handle media)
        await get().connectToSFURoom(url, token);

        // 7. AFTER SUCCESSFUL CONNECTION: send the call signal
        callWebSocketService.initiateCall({
          chatId,
          isVideoCall: isVideoCall,
          isGroupCall: true,
        });
      } catch (error) {
        // Handle error locally
        useCallStore.getState().cleanupStreams();
        useCallStore.setState({
          error: "sfu_init_failed",
          callStatus: CallStatus.ERROR,
        });
        toast.error(
          "Permission denied! Please allow camera and microphone access."
        );
        throw error;
      }
    },

    acceptSFUCall: async () => {
      // const { chatId, isVideoCall } = useCallStore.getState();
      const { chatId } = useCallStore.getState();
      try {
        // Clean up any existing streams
        useCallStore.getState().cleanupStreams();

        // Update base store
        useCallStore.getState().setCallStatus(CallStatus.CONNECTING);

        // Initialize LiveKit service
        const liveKitService = new LiveKitService();
        set({ liveKitService });

        // Generate token for joining
        const myChatMember = await getMyChatMember(chatId!);
        const myChatMemberId = myChatMember?.id;
        if (!myChatMemberId) {
          console.error("myChatMemberId is missing");
          return;
        }
        const participantName =
          myChatMember?.nickname ||
          [myChatMember?.firstName, myChatMember?.lastName]
            .filter(Boolean)
            .join(" ");

        const token = await callService.getToken(
          chatId!,
          myChatMemberId,
          participantName
        );
        if (!token) return;

        const url = import.meta.env.VITE_LIVEKIT_URL;

        // Connect to SFU (LiveKit will handle media acquisition)
        await get().connectToSFURoom(url, token);

        // Send acceptance via WebSocket
        if (chatId) {
          callWebSocketService.acceptCall({
            chatId,
            isCallerCancel: false,
          });
        }

        toast.success("Call accepted - connecting to SFU...");
      } catch (error) {
        handleError(error, "Could not connect to SFU");
        if (chatId) {
          callWebSocketService.rejectCall({ chatId });
        }
        useCallStore.getState().setCallStatus(CallStatus.ERROR);
      }
    },

    rejectSFUCall: (isCancel = false) => {
      const { chatId } = useCallStore.getState();

      if (!chatId) {
        console.error("No chatId found for rejecting call");
        return;
      }

      try {
        // Tell server we rejected the call
        callWebSocketService.rejectCall({ chatId, isCallerCancel: isCancel });
        get().disconnectFromSFU();
      } catch (error) {
        console.error("Error rejecting call:", error);
        toast.error("Failed to reject call. Please try again.");
        useCallStore.getState().setCallStatus(CallStatus.ERROR);
      }
    },

    connectToSFURoom: async (url: string, token: string) => {
      const { liveKitService } = get();
      const { isVideoCall } = useCallStore.getState();

      if (!liveKitService) return;

      try {
        await liveKitService.connect(url, token, {
          audio: true, // Let LiveKit handle audio
          video: isVideoCall, // Let LiveKit handle video if needed
          onParticipantConnected: get().handleSFUParticipantConnected,
          onParticipantDisconnected: get().handleSFUParticipantDisconnected,
          onTrackSubscribed: (track, publication, participant) => {
            get().handleSFUTrackSubscribed(track, publication, participant);
          },
          onTrackUnsubscribed: (track, publication, participant) => {
            get().handleSFUTrackUnsubscribed(track, publication, participant);
          },
          onError: (error) => {
            useCallStore.getState().setCallStatus(CallStatus.ERROR);
            console.error("LiveKit connection error:", error);
          },
        });

        // Update store with actual state from LiveKit
        const localParticipant = liveKitService.getLocalParticipant();

        useCallStore.setState({
          isMuted: !localParticipant.isMicrophoneEnabled,
          isVideoEnabled: localParticipant.isCameraEnabled,
        });

        // Set call as connected
        useCallStore.getState().setCallStatus(CallStatus.CONNECTED);
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

    // ========== SFU MEMBER MANAGEMENT ==========
    addSFUMember: (member: Partial<SFUCallMember>) => {
      const participant = member.participant as RemoteParticipant;
      if (!participant) return;

      set((state) => {
        // Check if member already exists to avoid duplicates
        const existingMember = state.sfuMembers.find(
          (m) => m.memberId === participant.identity
        );
        if (existingMember) {
          return state;
        }

        console.log(`addSFUMember ${participant.identity}`);

        return {
          sfuMembers: [
            ...state.sfuMembers,
            {
              memberId: participant.identity,
              displayName: participant.name || participant.identity,
              isMuted: !participant.isMicrophoneEnabled,
              isVideoEnabled: participant.isCameraEnabled,
              isScreenSharing: participant.isScreenShareEnabled,
              participant,
              voiceStream: null,
              videoStream: null,
              screenStream: null,
              lastActivity: Date.now(),
            },
          ],
        };
      });
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
    handleSFUParticipantConnected: async (participant: RemoteParticipant) => {
      console.log("🔵 PARTICIPANT CONNECTED:", participant.identity);
      // Don't add yourself - you're already in the call as local participant
      const myMemberId = await getMyChatMemberId(
        useCallStore.getState().chatId!
      );

      if (participant.identity === myMemberId) {
        console.log("Local participant connected - skipping add");
        return;
      }

      console.log(`Remote participant connected: ${participant.identity}`);

      // Add the remote participant to your store
      get().addSFUMember({
        memberId: participant.identity,
        isMuted: !participant.isMicrophoneEnabled,
        isVideoEnabled: participant.isCameraEnabled,
        isScreenSharing: participant.isScreenShareEnabled,
        participant, // Store the LiveKit participant object
        voiceStream: null,
        videoStream: null,
        screenStream: null,
      });
    },

    handleSFUParticipantDisconnected: (participant) => {
      const member = get().getSFUMember(participant.identity);
      if (member) {
        get().stopMemberStreams(member); // stop all tracks
        get().removeSFUMember(participant.identity);
      }
      toast.info(`${participant.name || participant.identity} left the call`);
    },

    handleSFUTrackSubscribed: (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      console.log("🔴 TRACK SUBSCRIBED:", participant.identity, track.kind);
      const member = get().getSFUMember(participant.identity);
      if (!member) return;

      // Clean up existing streams first
      if (track.kind === Track.Kind.Audio && member.voiceStream) {
        member.voiceStream.getTracks().forEach((track) => track.stop());
      }

      const updates = {
        memberId: participant.identity,
      } as Partial<SFUCallMember> & { memberId: string };

      const mediaStream = new MediaStream([track.mediaStreamTrack]);

      if (track.kind === Track.Kind.Audio) {
        updates.voiceStream = mediaStream;
        updates.isMuted = false;
        // updates.isMuted = !participant.isMicrophoneEnabled;
      } else if (track.kind === Track.Kind.Video) {
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
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      const member = get().getSFUMember(participant.identity);
      if (!member) return;

      const updates = {
        memberId: participant.identity,
      } as Partial<SFUCallMember> & { memberId: string };

      if (track.kind === Track.Kind.Audio) {
        updates.voiceStream = null;
        updates.isMuted = true;
      } else if (track.kind === Track.Kind.Video) {
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
    toggleAudio: async (enable?: boolean) => {
      const { chatId, isMuted } = useCallStore.getState();
      const { liveKitService } = get();
      const myMemberId = await getMyChatMemberId(chatId!);

      if (!liveKitService || !chatId || !myMemberId) return;

      // Determine target state: if enable is provided, use it; otherwise toggle
      const shouldUnmute = enable !== undefined ? enable : isMuted;

      try {
        if (shouldUnmute) {
          // 🔊 UNMUTE
          await liveKitService.toggleAudio(true);
          useCallStore.setState({ isMuted: false });
          callWebSocketService.updateCallMember({
            chatId,
            memberId: myMemberId,
            isMuted: false,
          });
        } else {
          // 🔇 MUTE
          await liveKitService.toggleAudio(false);
          useCallStore.setState({ isMuted: true });
          callWebSocketService.updateCallMember({
            chatId,
            memberId: myMemberId,
            isMuted: true,
          });
        }
      } catch (error) {
        console.error("Error in toggleAudio:", error);
        // Restore previous state if something went wrong
        useCallStore.setState({ isMuted });
        callWebSocketService.updateCallMember({
          chatId,
          memberId: myMemberId,
          isMuted,
        });
      }
    },

    toggleVideo: async (enable?: boolean) => {
      const { chatId, isVideoEnabled } = useCallStore.getState();
      const { liveKitService } = get();
      const myMemberId = await getMyChatMemberId(chatId!);

      if (!liveKitService || !chatId || !myMemberId) return;

      // Determine target state: if enable is provided, use it; otherwise toggle
      const shouldTurnOn = enable !== undefined ? enable : !isVideoEnabled;

      try {
        if (shouldTurnOn) {
          // 🎥 TURN ON CAMERA
          await liveKitService.toggleVideo(true);
          useCallStore.setState({ isVideoEnabled: true });
          callWebSocketService.updateCallMember({
            chatId,
            memberId: myMemberId,
            isVideoEnabled: true,
          });
        } else {
          // 📷 TURN OFF CAMERA
          await liveKitService.toggleVideo(false);
          useCallStore.setState({ isVideoEnabled: false });
          callWebSocketService.updateCallMember({
            chatId,
            memberId: myMemberId,
            isVideoEnabled: false,
          });
        }
      } catch (error) {
        console.error("Error in toggleVideo (SFU):", error);
        // Restore previous state if something went wrong
        useCallStore.setState({ isVideoEnabled });
        callWebSocketService.updateCallMember({
          chatId,
          memberId: myMemberId,
          isVideoEnabled,
        });
      }
    },

    toggleScreenShare: async (enable?: boolean) => {
      const { liveKitService } = get();
      const { chatId, isScreenSharing } = useCallStore.getState();
      const myMemberId = await getMyChatMemberId(chatId!);

      if (!liveKitService || !chatId || !myMemberId) return;

      // Determine target state: if enable is provided, use it; otherwise toggle
      const shouldStart = enable !== undefined ? enable : !isScreenSharing;

      try {
        if (shouldStart) {
          // 🖥️ START SCREEN SHARE
          await liveKitService.toggleScreenShare(true);
          useCallStore.setState({ isScreenSharing: true });
          callWebSocketService.updateCallMember({
            chatId,
            memberId: myMemberId,
            isScreenSharing: true,
          });
        } else {
          // 🛑 STOP SCREEN SHARE
          await liveKitService.toggleScreenShare(false);
          useCallStore.setState({ isScreenSharing: false });
          callWebSocketService.updateCallMember({
            chatId,
            memberId: myMemberId,
            isScreenSharing: false,
          });
        }
      } catch (error) {
        console.error("Error toggling screen share:", error);
        // Restore previous state if error occurs
        useCallStore.setState({ isScreenSharing });
        callWebSocketService.updateCallMember({
          chatId,
          memberId: myMemberId,
          isScreenSharing,
        });
      }
    },

    // ========== CLEAR STATE ==========
    stopMemberStreams: (member: SFUCallMember) => {
      if (member.voiceStream) {
        member.voiceStream.getTracks().forEach((track) => track.stop());
        member.voiceStream = null; // Clear reference
      }

      if (member.videoStream) {
        member.videoStream.getTracks().forEach((track) => track.stop());
        member.videoStream = null;
      }

      if (member.screenStream) {
        member.screenStream.getTracks().forEach((track) => track.stop());
        member.screenStream = null;
      }
    },

    clearSFUState: () => {
      const { liveKitService, sfuMembers } = get();

      // Clean up all member streams
      sfuMembers.forEach((member) => {
        stopMediaStreams(
          member.voiceStream,
          member.videoStream,
          member.screenStream
        );
      });

      // Disconnect from SFU
      if (liveKitService) {
        try {
          liveKitService.disconnect();
        } catch (err) {
          console.error("Error disconnecting SFU:", err);
        }
      }

      // Reset store state
      set({
        liveKitService: null,
        sfuMembers: [],
      });
    },
  }))
);
