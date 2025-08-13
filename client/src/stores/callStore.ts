// stores/callStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CallStatus, ModalType } from "@/types/enums/modalType";
import { useModalStore } from "@/stores/modalStore";
import { ChatResponse } from "@/types/responses/chat.response";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
}

interface IncomingCallData {
  fromUserId: string;
  callId: string;
}

interface CallState {
  chat: ChatResponse | null;
  isVideoCall: boolean;
  isGroupCall: boolean;
  callStatus: CallStatus | null;
  callStartTime?: Date | null; // Add this
  callEndTime?: Date | null; // Add this
  participants: CallParticipant[];
  incomingCall: IncomingCallData | null;
  remoteOffer: RTCSessionDescriptionInit | null;
  remoteAnswer: RTCSessionDescriptionInit | null;
  iceCandidates: RTCIceCandidateInit[];
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  isMuted: boolean;
  isLocalVideoDisabled: boolean;

  // Actions
  startCall: (
    chat: ChatResponse,
    isVideo: boolean,
    isGroup: boolean
  ) => Promise<void>;
  openCall: (
    chat: ChatResponse,
    isVideo: boolean,
    isGroup: boolean,
    callStatus: CallStatus
  ) => void;
  endCall: (callId?: string) => void;
  setStatus: (status: CallStatus) => void;
  switchType: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => Promise<void>;
  setupLocalStream: () => Promise<void>;
  cleanupStreams: () => void;
  createPeerConnection: () => RTCPeerConnection;
  handleRemoteStream: (event: RTCTrackEvent) => void;

  // Socket events
  setIncomingCall: (data: IncomingCallData) => void;
  setCallStatus: (status: CallStatus) => void;
  setRemoteOffer: (offer: RTCSessionDescriptionInit) => void;
  setRemoteAnswer: (answer: RTCSessionDescriptionInit) => void;
  addIceCandidate: (candidate: RTCIceCandidateInit) => void;
  getCallDuration: () => number;
}

export const useCallStore = create<CallState>()(
  devtools((set, get) => ({
    chat: null,
    isVideoCall: false,
    isGroupCall: false,
    callStatus: null,
    callStartTime: null,
    callEndTime: null,
    participants: [],
    incomingCall: null,
    remoteOffer: null,
    remoteAnswer: null,
    iceCandidates: [],
    localStream: null,
    remoteStream: null,
    peerConnection: null,
    isMuted: false,
    isLocalVideoDisabled: false,

    // 📞 Start Call with media setup
    startCall: async (chat, isVideo, isGroup) => {
      try {
        await get().setupLocalStream();
        get().openCall(chat, isVideo, isGroup, CallStatus.CALLING);

        callWebSocketService.initiateCall({
          chatId: chat.id,
          isVideoCall: isVideo,
          isGroupCall: isGroup,
        });
      } catch (error) {
        console.error("Failed to start call:", error);
        get().cleanupStreams();
      }
    },

    openCall: (chat, isVideo, isGroup, callStatus) => {
      set({
        chat,
        isVideoCall: isVideo,
        isGroupCall: isGroup,
        callStatus,
      });
      useModalStore.getState().openModal(ModalType.CALL);
    },

    // 🛑 End Call with cleanup
    endCall: () => {
      const { peerConnection, localStream, remoteStream } = get();

      if (peerConnection) {
        peerConnection.close();
      }

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }

      set({
        callStatus: CallStatus.ENDED,
        participants: [],
        incomingCall: null,
        remoteOffer: null,
        remoteAnswer: null,
        iceCandidates: [],
        localStream: null,
        remoteStream: null,
        peerConnection: null,
        isMuted: false,
        isLocalVideoDisabled: false,
      });

      useModalStore.getState().closeModal();
    },

    getCallDuration: (): number => {
      const state = get();
      if (!state.callStartTime) return 0;

      const endTime = state.callEndTime || new Date();
      return Math.floor(
        (endTime.getTime() - state.callStartTime.getTime()) / 1000
      );
    },

    // 🎤 Toggle audio mute
    toggleMute: () => {
      const { localStream, isMuted } = get();
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = isMuted;
        });
      }
      set({ isMuted: !isMuted });
    },

    // 📹 Toggle video
    toggleVideo: async () => {
      const { localStream, isLocalVideoDisabled } = get();
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          track.enabled = isLocalVideoDisabled;
        });
        set({ isLocalVideoDisabled: !isLocalVideoDisabled });
      } else if (!isLocalVideoDisabled) {
        // If enabling video and no stream exists
        await get().setupLocalStream();
      }
    },

    // 🎥 Setup local media stream
    setupLocalStream: async () => {
      const { isVideoCall } = get();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideoCall
            ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user",
              }
            : false,
        });

        set({
          localStream: stream,
          isLocalVideoDisabled: !isVideoCall,
        });
      } catch (error) {
        console.error("Error accessing media devices:", error);
        throw error;
      }
    },

    // � Cleanup media streams
    cleanupStreams: () => {
      const { localStream, remoteStream } = get();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }
      set({ localStream: null, remoteStream: null });
    },

    // 🤝 Create WebRTC peer connection
    createPeerConnection: () => {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Add your TURN servers here if needed
        ],
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          callWebSocketService.sendIceCandidate(event.candidate.toJSON());
        }
      };

      pc.ontrack = (event) => {
        get().handleRemoteStream(event);
      };

      // Add local stream to connection
      const { localStream } = get();
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      set({ peerConnection: pc });
      return pc;
    },

    // 📺 Handle incoming remote stream
    handleRemoteStream: (event) => {
      const { remoteStream } = get();
      if (!remoteStream) {
        const newStream = new MediaStream();
        set({ remoteStream: newStream });
        newStream.addTrack(event.track);
      } else {
        remoteStream.addTrack(event.track);
      }
    },

    // 🔄 Switch between video/voice
    switchType: async () => {
      const { isVideoCall, chat, isGroupCall, localStream } = get();
      const newType = !isVideoCall;

      try {
        if (newType && !localStream) {
          await get().setupLocalStream();
        } else if (localStream) {
          const videoTracks = localStream.getVideoTracks();
          videoTracks.forEach((track) => {
            track.enabled = newType;
          });
        }

        set({ isVideoCall: newType });

        if (chat?.id) {
          callWebSocketService.initiateCall({
            chatId: chat.id,
            isVideoCall: newType,
            isGroupCall,
          });
        }
      } catch (error) {
        console.error("Error switching call type:", error);
      }
    },

    setStatus: (status) => set({ callStatus: status }),
    setIncomingCall: (data) => {
      set({ incomingCall: data, callStatus: CallStatus.INCOMING });
      useModalStore.getState().openModal(ModalType.CALL);
    },
    setCallStatus: (status) => set({ callStatus: status }),
    setRemoteOffer: (offer) => set({ remoteOffer: offer }),
    setRemoteAnswer: (answer) => set({ remoteAnswer: answer }),
    addIceCandidate: (candidate) => {
      const { peerConnection } = get();
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
      set((state) => ({
        iceCandidates: [...state.iceCandidates, candidate],
      }));
    },
  }))
);
