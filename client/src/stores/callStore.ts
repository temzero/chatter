// stores/callStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CallStatus, ModalType } from "@/types/enums/modalType";
import { useModalStore } from "@/stores/modalStore";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { toast } from "react-toastify";

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
  chatId: string | null;
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
  callError: "permission_denied" | "device_unavailable" | null;

  // Actions
  startCall: (
    chatId: string,
    isVideo: boolean,
    isGroup: boolean
  ) => Promise<void>;
  openCall: (
    chatId: string,
    isVideo: boolean,
    isGroup: boolean,
    callStatus: CallStatus
  ) => void;
  acceptCall: () => Promise<void>;
  rejectCall: (isCancel?: boolean) => void;
  endCall: (isCancel?: boolean, isRejected?: boolean) => void;
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
  closeCallModal: () => void;
}

export const useCallStore = create<CallState>()(
  devtools((set, get) => ({
    chatId: null,
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
    callError: null,

    // 📞 Start Call with media setup
    startCall: async (chatId, isVideo, isGroup) => {
      try {
        // 1. Request media permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideo,
        });

        // 2. Save stream to state
        set({
          localStream: stream,
          isVideoCall: isVideo,
          isGroupCall: isGroup,
          chatId,
          callStatus: CallStatus.OUTGOING,
        });

        // 3. Use openCall to open the modal and set basic call state
        // get().openCall(chatId, isVideo, isGroup, CallStatus.OUTGOING);
        get().openCall(chatId, isVideo, isGroup, CallStatus.CALLING);

        // 4. Initiate WebRTC connection
        callWebSocketService.initiateCall({
          chatId,
          isVideoCall: isVideo,
          isGroupCall: isGroup,
        });
      } catch (error) {
        useModalStore.getState().closeModal();
        console.error("Permission denied:", error);
        get().cleanupStreams();
        set({ callError: "permission_denied" });
        toast.error(
          "Permission denied! Please allow camera and microphone access."
        );
      }
    },

    openCall: (chatId, isVideo, isGroup, callStatus) => {
      set({
        chatId,
        isVideoCall: isVideo,
        isGroupCall: isGroup,
        callStatus,
      });
      useModalStore.getState().openModal(ModalType.CALL);
    },

    acceptCall: async () => {
      const { chatId, isVideoCall, setStatus, createPeerConnection } = get();

      if (!chatId) {
        console.error("No chatId found for accepting call");
        return;
      }

      try {
        // // 1. Request local media stream
        // const stream = await navigator.mediaDevices.getUserMedia({
        //   audio: true,
        //   video: isVideoCall,
        // });

        // set({ localStream: stream });

        // // 2. Create PeerConnection & attach local tracks
        // const pc = createPeerConnection();
        // stream.getTracks().forEach((track) => {
        //   pc.addTrack(track, stream);
        // });

        // 3. Notify server that we accepted the call
        callWebSocketService.acceptCall({ chatId });

        // 4. Update UI state
        setStatus(CallStatus.CALLING);
      } catch (error) {
        console.error("Error accepting call:", error);
        set({ callError: "permission_denied" });
        toast.error(
          "Could not access camera/microphone. Please check permissions."
        );
      }
    },

    rejectCall: (isCancel: false) => {
      const { chatId, endCall } = get();

      if (!chatId) {
        console.error("No chatId found for rejecting call");
        return;
      }

      try {
        // Tell server we rejected the call
        callWebSocketService.rejectCall({ chatId, isCallerCancel: isCancel });

        // Close modal and clean up
        endCall(isCancel, true); // true → close modal without marking as ended
      } catch (error) {
        console.error("Error rejecting call:", error);
        toast.error("Failed to reject call. Please try again.");
      }
    },

    // 🛑 End Call with cleanup
    endCall: (isCancel = false, isRejected = false) => {
      const { peerConnection, localStream, remoteStream, callStatus } = get();

      // Early return if already ended
      if (
        callStatus === CallStatus.ENDED ||
        callStatus === CallStatus.CANCELED ||
        callStatus === CallStatus.REJECTED
      ) {
        return;
      }

      try {
        // Helper to stop all tracks in a stream
        const stopAllTracks = (stream: MediaStream | null) => {
          stream?.getTracks().forEach((track) => {
            track.enabled = false;
            track.stop();
          });
        };

        stopAllTracks(localStream);
        stopAllTracks(remoteStream);

        if (peerConnection) {
          peerConnection.ontrack = null;
          peerConnection.onicecandidate = null;
          peerConnection.oniceconnectionstatechange = null;
          if (peerConnection.connectionState !== "closed") {
            peerConnection.close();
          }
        }

        set({
          callStatus: isCancel
            ? CallStatus.CANCELED
            : isRejected
            ? CallStatus.REJECTED
            : CallStatus.ENDED,
          callEndTime: new Date(),
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
      } catch (error) {
        console.error("Call termination error:", error);
        toast.error("Failed to properly end call");
        set({ callStatus: CallStatus.ENDED });
      }
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

      // Stop all tracks safely
      [localStream, remoteStream].forEach((stream) => {
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.stop();
            track.enabled = false;
          });
        }
      });

      set({
        localStream: null,
        remoteStream: null,
        callError: null, // Reset error on cleanup
      });
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
      const { isVideoCall, chatId, isGroupCall, localStream } = get();
      const newType = !isVideoCall;

      try {
        if (newType) {
          // Switching to video - need to request video permissions
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
          });

          // Replace existing stream
          get().cleanupStreams();
          set({
            localStream: stream,
            isVideoCall: newType,
            isLocalVideoDisabled: false,
          });

          // Add tracks to peer connection if exists
          const { peerConnection } = get();
          if (peerConnection) {
            stream.getTracks().forEach((track) => {
              peerConnection.addTrack(track, stream);
            });
          }
        } else {
          // Switching to audio
          set({ isVideoCall: newType });
          if (localStream) {
            localStream.getVideoTracks().forEach((track) => track.stop());
          }
        }

        if (chatId) {
          callWebSocketService.initiateCall({
            chatId: chatId,
            isVideoCall: newType,
            isGroupCall,
          });
        }
      } catch (error) {
        console.error("Error switching call type:", error);
        // Revert if there was an error
        set({ isVideoCall });
        toast.error("Could not access camera. Please check permissions.");
        throw error;
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

    closeCallModal: () => {
      // Close the modal first to provide immediate feedback
      useModalStore.getState().closeModal();

      // Additional cleanup if needed
      set({
        chatId: null,
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
        callError: null,
      });
    },
  }))
);
