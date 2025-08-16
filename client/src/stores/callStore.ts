// stores/callStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CallStatus, ModalType } from "@/types/enums/modalType";
import { useModalStore } from "@/stores/modalStore";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { toast } from "react-toastify";
import { handleError } from "@/utils/handleError";
interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
}

interface IncomingCallData {
  fromMemberId: string;
  callId: string;
}

interface CallState {
  /* --------------------------------------------------
   * 1️⃣ Basic Call Metadata
   * -------------------------------------------------- */
  chatId: string | null; // The chat this call belongs to
  isVideoCall: boolean; // Whether this is a video or audio call
  isGroupCall: boolean; // Whether this call has more than 2 participants
  callStatus: CallStatus | null; // Current call status (ringing, connected, etc.)
  callStartTime?: Date | null; // When the call started
  callEndTime?: Date | null; // When the call ended
  incomingCall: IncomingCallData | null; // Incoming call metadata (caller info, type, etc.)

  /* --------------------------------------------------
   * 2️⃣ WebRTC Signaling Data
   * -------------------------------------------------- */
  remoteOffer: RTCSessionDescriptionInit | null; // Remote peer's SDP offer
  remoteAnswer: RTCSessionDescriptionInit | null; // Remote peer's SDP answer
  iceCandidates: RTCIceCandidateInit[]; // Collected ICE candidates from remote peers

  /* --------------------------------------------------
   * 3️⃣ WebRTC Connection & Streams
   * -------------------------------------------------- */
  peerConnections: Record<string, RTCPeerConnection>; // One connection per participant
  remoteStreams: Record<string, MediaStream>; // Remote media per participant
  participantStreams: Record<string, MediaStream>; // Alias or separate tracking of streams by participant ID
  participants: CallParticipant[]; // List of all call participants
  localStream: MediaStream | null; // This user's microphone/camera stream
  activeSpeakers: string[]; // IDs of participants currently speaking

  /* --------------------------------------------------
   * 4️⃣ Local User State
   * -------------------------------------------------- */
  isMuted: boolean; // Whether the microphone is muted
  isLocalVideoDisabled: boolean; // Whether the camera is disabled
  callError: "permission_denied" | "device_unavailable" | null; // Error type if media devices fail

  sfuConnection: RTCPeerConnection | null;
  sfuStreams: {
    audio?: MediaStream;
    video?: MediaStream;
  };

  /* --------------------------------------------------
   * 5️⃣ Core Call Actions
   * -------------------------------------------------- */
  startCall: (
    chatId: string,
    isVideo: boolean,
    isGroup: boolean,
    currentUserId: string
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
  switchType: () => Promise<void>; // Switch between audio and video mid-call
  toggleMute: () => void;
  toggleVideo: () => Promise<void>;

  /* --------------------------------------------------
   * 6️⃣ Media & Connection Handling
   * -------------------------------------------------- */
  setupLocalStream: () => Promise<void>; // Get local mic/camera
  cleanupStreams: () => void; // Stop all streams and cleanup
  createPeerConnection: (memberId: string) => RTCPeerConnection; // Create new WebRTC connection
  handleRemoteStream: (participantId: string, event: RTCTrackEvent) => void; // Handle track added by remote peer

  /* --------------------------------------------------
   * 7️⃣ Socket Event Handlers (Signaling)
   * -------------------------------------------------- */
  sendOffer: (targetUserId: string) => Promise<void>;
  setIncomingCall: (data: IncomingCallData) => void;
  setCallStatus: (status: CallStatus) => void;
  setRemoteOffer: (offer: RTCSessionDescriptionInit) => void;
  setRemoteAnswer: (answer: RTCSessionDescriptionInit) => void;
  addIceCandidate: (candidate: RTCIceCandidateInit) => void;

  /* --------------------------------------------------
   * 8️⃣ Utility
   * -------------------------------------------------- */
  getCallDuration: () => number; // Returns call length in seconds
  closeCallModal: () => void; // Hide UI modal for call

  createSfuConnection: () => Promise<RTCSessionDescriptionInit>;
  disconnectFromSfu: () => void;
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
        get().openCall(chatId, isVideo, isGroup, CallStatus.OUTGOING);
        // get().openCall(chatId, isVideo, isGroup, CallStatus.CALLING);

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
      const { isVideoCall, localStream, chatId, incomingCall } = get();

      try {
        // 1. Clean up any existing stream first
        if (localStream) {
          localStream.getTracks().forEach((track) => track.stop());
        }

        // 2. Get fresh media stream
        const stream = await navigator.mediaDevices
          .getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
            video: isVideoCall
              ? {
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  facingMode: "user",
                }
              : false,
          })
          .catch(async (error) => {
            if (error.name === "NotReadableError") {
              toast.warning("Device in use. Trying alternative settings...");
              return await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: isVideoCall ? true : false,
              });
            }
            throw error;
          });

        // 3. Set stream in state
        set({
          localStream: stream,
          isLocalVideoDisabled: !isVideoCall,
          callStatus: CallStatus.CONNECTING,
        });

        // 4. Send acceptance via WebSocket
        if (incomingCall) {
          callWebSocketService.acceptCall({
            chatId: chatId!,
            // Include any other required payload fields
          });
        }

        toast.success("Call accepted - waiting for connection...");
      } catch (error) {
        handleError(error, "Could not start media devices");

        // Send rejection if media setup fails
        if (incomingCall) {
          callWebSocketService.rejectCall({
            chatId: chatId!,
          });
        }

        set({
          callError: "device_unavailable",
          callStatus: CallStatus.ENDED,
        });
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
      const {
        peerConnections,
        remoteStreams = {},
        localStream,
        callStatus,
      } = get();

      if (
        callStatus === CallStatus.ENDED ||
        callStatus === CallStatus.CANCELED ||
        callStatus === CallStatus.REJECTED
      ) {
        return;
      }

      // Helper function to stop all tracks in a stream
      const stopAllTracks = (stream: MediaStream | null) => {
        if (!stream) return;
        stream.getTracks().forEach((track) => {
          track.stop(); // This is crucial to release the hardware
          track.enabled = false;
        });
      };

      // Stop local stream tracks
      stopAllTracks(localStream);

      // Stop all remote streams
      Object.values(remoteStreams).forEach(stopAllTracks);

      // Close all peer connections
      if (peerConnections) {
        Object.values(peerConnections).forEach((pc) => {
          pc.ontrack = null;
          pc.onicecandidate = null;
          pc.oniceconnectionstatechange = null;
          if (pc.connectionState !== "closed") {
            pc.close();
          }
        });
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
        localStream: null, // Clear the local stream reference
        remoteStreams: {},
        peerConnections: {},
        isMuted: false,
        isLocalVideoDisabled: false,
      });
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
    // toggleVideo: async () => {
    //   const { localStream, isLocalVideoDisabled } = get();
    //   if (localStream) {
    //     localStream.getVideoTracks().forEach((track) => {
    //       track.enabled = isLocalVideoDisabled;
    //     });
    //     set({ isLocalVideoDisabled: !isLocalVideoDisabled });
    //   } else if (!isLocalVideoDisabled) {
    //     // If enabling video and no stream exists
    //     await get().setupLocalStream();
    //   }
    // },

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
      const { localStream, remoteStreams } = get();

      [localStream, ...Object.values(remoteStreams)].forEach((stream) => {
        stream?.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      });

      set({
        localStream: null,
        remoteStreams: {},
        callError: null,
      });
    },

    // 🤝 Create WebRTC peer connection
    createPeerConnection: (memberId: string) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          callWebSocketService.sendIceCandidate({
            chatId: get().chatId || "",
            candidate: event.candidate.toJSON(),
            senderMemberId: memberId,
            targetMemberId: ""
          });
        }
      };

      pc.ontrack = (event) => {
        get().handleRemoteStream(memberId, event);
      };

      // Attach local stream tracks to this new connection
      const { localStream } = get();
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      set((state) => ({
        peerConnections: {
          ...state.peerConnections,
          [memberId]: pc,
        },
      }));

      return pc;
    },

    // 📺 Handle incoming remote stream
    handleRemoteStream: (participantId: string, event: RTCTrackEvent) => {
      set((state) => {
        let stream = state.remoteStreams[participantId];
        if (!stream) {
          stream = new MediaStream();
        }
        stream.addTrack(event.track);
        return {
          remoteStreams: {
            ...state.remoteStreams,
            [participantId]: stream,
          },
        };
      });
    },

    // 🔄 Switch between video/voice
    switchType: async () => {
      const {
        isVideoCall,
        chatId,
        isGroupCall,
        localStream,
        peerConnections = {},
      } = get();
      const newType = !isVideoCall;

      try {
        if (newType) {
          // Keep existing audio tracks while adding video
          const currentAudioTracks = localStream?.getAudioTracks() || [];

          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
          });

          const newStream = new MediaStream([
            ...currentAudioTracks,
            ...videoStream.getVideoTracks(),
          ]);

          set({
            localStream: newStream,
            isVideoCall: newType,
            isLocalVideoDisabled: false,
          });

          // Safely handle peer connections
          if (peerConnections && typeof peerConnections === "object") {
            Object.values(peerConnections).forEach((pc) => {
              if (pc) {
                // Additional null check for individual connections
                pc.getSenders().forEach((sender) => {
                  if (sender.track?.kind === "video") {
                    pc.removeTrack(sender);
                  }
                });
                newStream.getTracks().forEach((track) => {
                  pc.addTrack(track, newStream);
                });
              }
            });
          }

          // Clean up old video stream only
          if (localStream) {
            localStream.getVideoTracks().forEach((track) => track.stop());
          }
        } else {
          // Switching to audio - just stop video tracks
          set({ isVideoCall: newType });
          if (localStream) {
            localStream.getVideoTracks().forEach((track) => track.stop());
          }
        }

        // Notify other participants
        if (chatId) {
          callWebSocketService.initiateCall({
            chatId,
            isVideoCall: newType,
            isGroupCall,
          });
        }
      } catch (error) {
        console.error("Error switching call type:", error);
        toast.error("Could not access camera. Please check permissions.");
        // Revert UI state if error occurs
        set({ isVideoCall });
        throw error;
      }
    },

    setStatus: (status) => set({ callStatus: status }),

    sendOffer: async (targetMemberId) => {
      const { chatId, localStream, peerConnections } = get();

      if (!chatId) {
        throw new Error("Cannot send offer - no active chat session");
      }

      try {
        // Create or reuse peer connection
        const pc =
          peerConnections[targetMemberId] ||
          get().createPeerConnection(targetMemberId);

        // Add local streams if they exist
        if (localStream) {
          localStream.getTracks().forEach((track) => {
            if (!pc.getSenders().some((s) => s.track === track)) {
              pc.addTrack(track, localStream);
            }
          });
        }

        // Create and send offer
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        await pc.setLocalDescription(offer);

        callWebSocketService.sendOffer({
          chatId,
          offer,
          targetMemberId,
        });

        set({ callStatus: CallStatus.CONNECTING });
      } catch (error) {
        console.error("Failed to create/send offer:", error);
        get().endCall();
        throw error;
      }
    },

    setIncomingCall: (data) => {
      set({ incomingCall: data, callStatus: CallStatus.INCOMING });
      useModalStore.getState().openModal(ModalType.CALL);
    },
    setCallStatus: (status) => set({ callStatus: status }),
    setRemoteOffer: (offer) => set({ remoteOffer: offer }),
    setRemoteAnswer: (answer) => set({ remoteAnswer: answer }),

    addIceCandidate: (
      participantId: string,
      candidate: RTCIceCandidateInit
    ) => {
      const { peerConnections } = get();
      const pc = peerConnections[participantId];
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      set((state) => ({
        iceCandidates: [...state.iceCandidates, candidate],
      }));
    },

    addParticipant: (participant: CallParticipant) => {
      set((state) => ({
        participants: [...state.participants, participant],
      }));
    },

    removeParticipant: (participantId: string) => {
      const { peerConnections, remoteStreams } = get();

      // Close their peer connection
      if (peerConnections[participantId]) {
        peerConnections[participantId].close();
        delete peerConnections[participantId];
      }

      // Remove their stream
      delete remoteStreams[participantId];

      set((state) => ({
        participants: state.participants.filter((p) => p.id !== participantId),
        peerConnections: { ...peerConnections },
        remoteStreams: { ...remoteStreams },
      }));
    },

    // Implementation in your store
    createSfuConnection: async () => {
      const { localStream, chatId } = get();

      if (!chatId) {
        throw new Error("No chatId available for SFU connection");
      }

      // 1. Create peer connection specifically for SFU
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Add your TURN servers here if needed
        ],
        bundlePolicy: "max-bundle", // Better for SFU
        rtcpMuxPolicy: "require", // Better for SFU
      });

      // 2. Add local stream tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      // 3. ICE candidate handling
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          callWebSocketService.sendSfuIceCandidate({
            chatId,
            candidate: event.candidate.toJSON(),
            senderMemberId: "current-user-id", // Replace with actual user ID
          });
        }
      };

      // 4. Handle incoming tracks from SFU
      pc.ontrack = (event) => {
        const kind = event.track.kind as "audio" | "video";
        set((state) => {
          const sfuStreams = { ...state.sfuStreams };
          if (!sfuStreams[kind]) {
            sfuStreams[kind] = new MediaStream();
          }
          sfuStreams[kind]!.addTrack(event.track);
          return { sfuStreams };
        });
      };

      // 5. Connection state monitoring
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          set({ callStatus: CallStatus.CALLING });
        } else if (pc.connectionState === "failed") {
          get().disconnectFromSfu();
        }
      };

      // 6. Create and return offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await pc.setLocalDescription(offer);

      // Store the SFU connection
      set((state) => ({
        sfuConnection: pc,
        peerConnections: {
          ...state.peerConnections,
          sfu: pc, // Special key for SFU connection
        },
      }));

      return offer;
    },

    disconnectFromSfu: () => {
      const { sfuConnection, sfuStreams } = get();

      if (sfuConnection) {
        sfuConnection.close();
      }

      // Clean up SFU streams
      Object.values(sfuStreams || {}).forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });

      set({
        sfuConnection: null,
        sfuStreams: {},
        // Remove from peerConnections if needed
      });
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
        remoteStreams: {},
        peerConnections: {},
        isMuted: false,
        isLocalVideoDisabled: false,
        callError: null,
      });
    },
  }))
);
