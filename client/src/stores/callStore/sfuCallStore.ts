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
import {
  getMicStream,
  stopMicStream,
  getVideoStream,
  stopVideoStream,
  getScreenStream,
  stopScreenStream,
  stopMediaStreams,
} from "@/utils/webRtc/localStream.Utils";

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
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;

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
      toast.info(`initializeSFUCall, isVideoCall: ${isVideoCall}`);

      try {
        // 1. Request media permissions FIRST: isVideoCall,
        const voiceStream = await getMicStream();
        const videoStream = isVideoCall ? await getVideoStream() : null;

        // 2. Update base store with ALL necessary state
        useCallStore.setState({
          localVoiceStream: voiceStream,
          localVideoStream: videoStream,
          isVideoEnabled: isVideoCall,
          startedAt: new Date(),
          chatId, // Reinforce these
          isVideoCall: isVideoCall,
          callStatus: CallStatus.OUTGOING,
        });

        // 3. OPEN MODAL ONLY AFTER SUCCESS
        useModalStore.getState().openModal(ModalType.CALL);

        // 4. Set timeout
        const timeoutRef = setTimeout(() => {
          const { callStatus } = useCallStore.getState();
          if (callStatus === CallStatus.OUTGOING) {
            useCallStore
              .getState()
              .endCall({ isTimeout: true, isCancel: true });
          }
        }, 60000);

        useCallStore.setState({ timeoutRef });

        // 5. Initialize LiveKit service
        const liveKitService = new LiveKitService();
        set({ liveKitService });

        // 6. Generate token for LiveKit room
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

        // 7. Connect to LiveKit SFU
        await get().connectToSFURoom(url, token);

        // 8. AFTER SUCCESSFUL CONNECTION: send the call signal
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
      const { chatId, isVideoCall, isVideoEnabled } = useCallStore.getState();
      const isOpenVideoTrack = isVideoCall && isVideoEnabled;

      try {
        // Clean up existing streams
        useCallStore.getState().cleanupStreams();

        // Get fresh media streams using utility functions only
        const voiceStream = await getMicStream().catch((error) => {
          if (error.name === "NotReadableError") {
            toast.warning("Microphone in use. Retrying with fallback...");
          }
          throw error;
        });

        let videoStream: MediaStream | null = null;
        if (isOpenVideoTrack) {
          videoStream = await getVideoStream().catch((error) => {
            if (error.name === "NotReadableError") {
              toast.warning("Camera in use. Retrying with fallback...");
            }
            throw error;
          });
        }

        // Update base store
        useCallStore.getState().setLocalVoiceStream(voiceStream);
        useCallStore.getState().setLocalVideoStream(videoStream);
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
        handleError(error, "Could not start media devices");
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
      if (!liveKitService) return;
      console.log("connectToSFURoom:", url, token);

      try {
        await liveKitService.connect(url, token, {
          audio: true,
          video: useCallStore.getState().isVideoCall,
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

        // Setup local stream after connecting
        await useCallStore.getState().setupLocalStream();
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
      toast.info(`addSFUMember ${member.memberId}`);
      console.log(`addSFUMember ${member.memberId}`);

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
            voiceStream: null,
            videoStream: null,
            screenStream: null,
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
      get().updateSFUMember({
        participant,
        memberId: participant.identity,
      });
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

      if (track.kind === Track.Kind.Audio) {
        updates.voiceStream = mediaStream;
        updates.isMuted = false;
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
    toggleAudio: async () => {
      const { chatId, isMuted, localVoiceStream } = useCallStore.getState();
      const { liveKitService } = get();
      const myMemberId = await getMyChatMemberId(chatId!);
      console.log("toggleAudio");
      if (!liveKitService || !chatId || !myMemberId) return;

      try {
        if (isMuted) {
          // 🔊 OPEN mic
          const voiceStream = await getMicStream();
          await liveKitService.toggleAudio(true);

          useCallStore.setState({
            isMuted: false,
            localVoiceStream: voiceStream,
          });

          callWebSocketService.updateCallMember({
            chatId,
            memberId: myMemberId,
            isMuted: false,
          });
        } else {
          // 🔇 CLOSE mic
          await liveKitService.toggleAudio(false);

          stopMicStream(localVoiceStream);

          useCallStore.setState({
            isMuted: true,
            localVoiceStream: null,
          });

          callWebSocketService.updateCallMember({
            chatId,
            memberId: myMemberId,
            isMuted: true,
          });
        }
      } catch (error) {
        console.error("Error in toggleAudio:", error);
        useCallStore.setState({ isMuted });
        callWebSocketService.updateCallMember({
          chatId,
          memberId: myMemberId,
          isMuted,
        });
      }
    },

    toggleVideo: async () => {
      const { chatId, isVideoEnabled, localVideoStream } =
        useCallStore.getState();
      const { liveKitService } = get();
      const myMemberId = await getMyChatMemberId(chatId!);

      if (!liveKitService || !chatId || !myMemberId) return;

      try {
        if (!isVideoEnabled) {
          // 🎥 TURN ON camera
          const videoStream = await getVideoStream();
          await liveKitService.toggleVideo(true);

          useCallStore.setState({
            isVideoEnabled: true,
            localVideoStream: videoStream,
          });

          callWebSocketService.updateCallMember({
            chatId,
            memberId: myMemberId,
            isVideoEnabled: true,
          });
        } else {
          // 📷 TURN OFF camera
          await liveKitService.toggleVideo(false);

          stopVideoStream(localVideoStream);

          useCallStore.setState({
            isVideoEnabled: false,
            localVideoStream: null,
          });

          callWebSocketService.updateCallMember({
            chatId,
            memberId: myMemberId,
            isVideoEnabled: false,
          });
        }
      } catch (error) {
        console.error("Error in toggleVideo (SFU):", error);
        useCallStore.setState({ isVideoEnabled, localVideoStream });
        callWebSocketService.updateCallMember({
          chatId,
          memberId: myMemberId,
          isVideoEnabled,
        });
      }
    },

    toggleScreenShare: async () => {
      const { liveKitService } = get();
      const { chatId, isScreenSharing, localScreenStream } =
        useCallStore.getState();
      const myMemberId = await getMyChatMemberId(chatId!);

      if (!liveKitService || !chatId || !myMemberId) return;

      try {
        if (!isScreenSharing) {
          // Start screen sharing
          const screenStream = await getScreenStream();

          await liveKitService.toggleScreenShare(true);

          useCallStore.setState({
            isScreenSharing: true,
            localScreenStream: screenStream,
          });

          // Handle browser UI stop (when user clicks "Stop Sharing")
          screenStream.getTracks().forEach((track) => {
            track.onended = () => get().toggleScreenShare();
          });

          callWebSocketService.updateCallMember({
            chatId,
            memberId: myMemberId,
            isScreenSharing: true,
          });
        } else {
          // Stop screen sharing
          await liveKitService.toggleScreenShare(false);

          stopScreenStream(localScreenStream);

          useCallStore.setState({
            isScreenSharing: false,
            localScreenStream: null,
          });

          callWebSocketService.updateCallMember({
            chatId,
            memberId: myMemberId,
            isScreenSharing: false,
          });
        }
      } catch (error) {
        console.error("Error toggling screen share:", error);
        useCallStore.setState({
          isScreenSharing,
          localScreenStream,
        });
        callWebSocketService.updateCallMember({
          chatId,
          memberId: myMemberId,
          isScreenSharing,
        });
      }
    },

    // ========== CLEAR STATE ==========
    clearSFUState: () => {
      const { liveKitService, sfuMembers } = get();
      const { localVoiceStream, localVideoStream, localScreenStream } =
        useCallStore.getState();

      // Clean up local streams using utility functions
      stopMediaStreams(localVoiceStream, localVideoStream, localScreenStream);

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
