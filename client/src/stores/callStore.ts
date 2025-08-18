// stores/callStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CallStatus, ModalType } from "@/types/enums/modalType";
import { useModalStore } from "@/stores/modalStore";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { toast } from "react-toastify";
import { handleError } from "@/utils/handleError";
import { getMyChatMemberId } from "./chatMemberStore";
interface CallParticipant {
  id: string;
  name?: string;
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
  createSfuConnection: () => Promise<RTCSessionDescriptionInit>;
  disconnectFromSfu: () => void;

  /* --------------------------------------------------
   * 7️⃣ Socket Event Handlers (Signaling)
   * -------------------------------------------------- */
  sendOffer: (targetUserId: string) => Promise<void>;
  setIncomingCall: (data: IncomingCallData) => void;

  addIceCandidate: (candidate: RTCIceCandidateInit) => void;

  /* --------------------------------------------------
   * 8️⃣ Utility
   * -------------------------------------------------- */
  setCallStatus: (status: CallStatus) => void; // Set call status
  getCallDuration: () => number; // Returns call length in seconds
  closeCallModal: () => void; // Hide UI modal for call
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
    iceCandidates: [],
    peerConnections: {},
    remoteStreams: {},
    participantStreams: {},
    localStream: null,
    activeSpeakers: [],
    isMuted: false,
    isLocalVideoDisabled: false,
    callError: null,
    sfuConnection: null,
    sfuStreams: {},

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
        set({ callError: "permission_denied", callStatus: CallStatus.ERROR });
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
          callStatus: CallStatus.CONNECTING,
        });

        // 4. Send acceptance via WebSocket
        if (incomingCall) {
          callWebSocketService.acceptCall({
            chatId: chatId!,
            isCallerCancel: false,
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
          callStatus: CallStatus.ERROR,
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
        set({
          callError: "device_unavailable",
          callStatus: CallStatus.ERROR,
        });
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
        iceCandidates: [],
        localStream: null, // Clear the local stream reference
        remoteStreams: {},
        peerConnections: {},
        isMuted: false,
      });
    },

    setCallStatus: (status: CallStatus) => {
      set({ callStatus: status });
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
      const { chatId, localStream } = get();

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Add TURN servers here if needed
        ],
      });

      // ICE Candidate Handling
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          callWebSocketService.sendIceCandidate({
            chatId: chatId || "",
            candidate: event.candidate.toJSON(),
          });
        }
      };

      // Track Handling
      pc.ontrack = (event) => {
        get().handleRemoteStream(memberId, event);
      };

      // Connection Monitoring
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "failed") {
          console.error("ICE failed - attempting restart");
          pc.restartIce();
        }
      };

      // Add local media
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          if (!pc.getSenders().some((s) => s.track === track)) {
            pc.addTrack(track, localStream);
          }
        });
      }

      // Store connection
      set((state) => ({
        peerConnections: { ...state.peerConnections, [memberId]: pc },
      }));

      return pc;
    },

    // 📺 Handle incoming remote stream
    handleRemoteStream: (participantId: string, event: RTCTrackEvent) => {
      set((state) => {
        // 1. Validate incoming track
        if (!event.track) {
          console.error("Received track event without track!", event);
          return state;
        }

        // 2. Get or create stream
        let stream = state.remoteStreams[participantId];
        if (!stream) {
          stream = new MediaStream();
          console.log(`Created new stream for ${participantId}`);
        }

        // 3. Check for duplicate tracks
        const existingTrack = stream
          .getTracks()
          .find((t) => t.id === event.track.id);
        if (existingTrack) {
          console.warn(
            `Duplicate ${event.track.kind} track from ${participantId}`
          );
          return state;
        }

        // 4. Add track with lifecycle handlers
        stream.addTrack(event.track);
        console.log(
          `Added ${event.track.kind} track to ${participantId}'s stream`
        );

        // 5. Track state monitoring
        event.track.onmute = () => {
          console.log(`Track ${event.track.id} muted`);
          // Update UI if needed
        };

        event.track.onunmute = () => {
          console.log(`Track ${event.track.id} active`);
          // Update UI if needed
        };

        event.track.onended = () => {
          console.log(`Track ${event.track.id} ended`);
          set((s) => {
            const newStream = new MediaStream(
              s.remoteStreams[participantId]
                ?.getTracks()
                .filter((t) => t.id !== event.track.id) || []
            );
            return {
              remoteStreams: {
                ...s.remoteStreams,
                [participantId]: newStream,
              },
            };
          });
        };

        // 6. Return updated state
        return {
          ...state,
          remoteStreams: {
            ...state.remoteStreams,
            [participantId]: stream,
          },
          // Update participants list if new
          participants: state.participants.some((p) => p.id === participantId)
            ? state.participants
            : [...state.participants, { id: participantId }],
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
        // 1. Stop all existing video tracks if switching to audio
        if (!newType && localStream) {
          localStream.getVideoTracks().forEach((track) => track.stop());
        }

        // 2. For video calls, get new media stream
        if (newType) {
          const currentAudioTracks = localStream?.getAudioTracks() || [];

          // Get new video stream
          const videoStream = await navigator.mediaDevices
            .getUserMedia({
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user",
              },
            })
            .catch((error) => {
              console.error("Camera access error:", error);
              throw new Error("Could not access camera");
            });

          // Create new combined stream
          const newStream = new MediaStream([
            ...currentAudioTracks,
            ...videoStream.getVideoTracks(),
          ]);

          // 3. Update all peer connections
          Object.values(peerConnections).forEach((pc) => {
            if (!pc) return;

            // Remove all existing tracks
            pc.getSenders().forEach((sender) => {
              if (sender.track) {
                pc.removeTrack(sender);
              }
            });

            // Add new tracks
            newStream.getTracks().forEach((track) => {
              pc.addTrack(track, newStream);
            });
          });

          // 4. Update state
          set({
            localStream: newStream,
            isVideoCall: newType,
          });
        } else {
          // Audio-only mode - just update state
          set({ isVideoCall: newType });
        }

        // Notify other participants
        if (chatId) {
          callWebSocketService.updateCallType({
            chatId,
            isVideoCall: newType,
            isGroupCall,
          });
        }
      } catch (error) {
        console.error("Error switching call type:", error);
        // Revert to previous state if error occurs
        set({ isVideoCall });
        throw error;
      }
    },

    setStatus: (status) => set({ callStatus: status }),

    sendOffer: async (toMemberId) => {
      // 1. Verify member ID exists
      const myMemberId = getMyChatMemberId(get().chatId!);
      if (!myMemberId)
        throw new Error("Cannot send offer - no member ID found");

      // 2. Get current state
      const { chatId, localStream, peerConnections } = get();
      console.log("Creating call offer..."); // First console.log to track flow

      if (!chatId)
        throw new Error("Cannot send offer - no active chat session");

      try {
        // 3. Create or reuse peer connection
        const pc =
          peerConnections[toMemberId] || get().createPeerConnection(toMemberId);
        console.log("Peer connection created"); // Second console.log

        // 4. Add local streams if they exist
        if (localStream) {
          localStream.getTracks().forEach((track) => {
            if (!pc.getSenders().some((s) => s.track === track)) {
              pc.addTrack(track, localStream);
            }
          });
          console.log("Local tracks added to peer connection"); // Third console.log
        }

        // 5. Create and send offer
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        console.log("Offer created"); // Fourth console.log

        await pc.setLocalDescription(offer);
        console.log("Local description set"); // Fifth console.log

        callWebSocketService.sendOffer({
          chatId,
          offer,
        });
        console.log("Offer sent successfully"); // Final toast

        set({ callStatus: CallStatus.CONNECTING });
      } catch (error) {
        handleError(error, "Failed to create/send offer");
        get().endCall();
        throw error;
      }
    },

    setIncomingCall: (data) => {
      set({ incomingCall: data, callStatus: CallStatus.INCOMING });
      useModalStore.getState().openModal(ModalType.CALL);
    },

    addIceCandidate: (
      participantId: string,
      candidate: RTCIceCandidateInit
    ) => {
      const { peerConnections, sfuConnection } = get();

      // Case 1: P2P call (participantId is the other user)
      if (peerConnections[participantId]) {
        peerConnections[participantId].addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
      // Case 2: SFU call (participantId === "sfu")
      else if (participantId === "sfu" && sfuConnection) {
        sfuConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
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

    createSfuConnection: async () => {
      const { localStream, chatId } = get();

      if (!chatId) {
        throw new Error("No chatId available for SFU connection");
      }

      // 1. Create peer connection with proper error handling
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Add TURN servers here if needed:
          // { urls: "turn:your-turn-server.com", username: "user", credential: "pass" }
        ],
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
      });

      // 2. Add local stream tracks with cleanup guard
      try {
        if (localStream) {
          localStream.getTracks().forEach((track) => {
            // Prevent duplicate track addition
            if (!pc.getSenders().some((s) => s.track === track)) {
              pc.addTrack(track, localStream);
            }
          });
        }
      } catch (error) {
        console.error("Error adding tracks:", error);
        pc.close();
        throw error;
      }

      // 3. ICE candidate handling with null check
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          try {
            callWebSocketService.sendIceCandidate({
              chatId,
              candidate: event.candidate.toJSON(),
            });
          } catch (error) {
            console.error("Error sending ICE candidate:", error);
          }
        }
      };

      // 4. Handle incoming tracks with stream management
      pc.ontrack = (event) => {
        if (!event.streams || event.streams.length === 0) return;

        const kind = event.track.kind as "audio" | "video";
        set((state) => {
          const sfuStreams = { ...state.sfuStreams };

          // Create stream if doesn't exist
          if (!sfuStreams[kind]) {
            sfuStreams[kind] = new MediaStream();
          }

          // Add track if not already present
          if (
            !sfuStreams[kind]!.getTracks().some((t) => t.id === event.track.id)
          ) {
            sfuStreams[kind]!.addTrack(event.track);
          }

          return { sfuStreams };
        });
      };

      // 5. Enhanced connection state monitoring
      pc.onconnectionstatechange = () => {
        const connectionState = pc.connectionState;
        console.log("SFU connection state:", connectionState);

        switch (connectionState) {
          case "connected":
            set({ callStatus: CallStatus.CONNECTED });
            break;
          case "disconnected":
          case "failed":
            get().disconnectFromSfu();
            break;
          case "closed":
            set({ sfuConnection: null });
            break;
        }
      };

      // 6. Offer creation with proper error handling
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        await pc.setLocalDescription(offer);

        // Store connection with cleanup reference
        set((state) => ({
          sfuConnection: pc,
          peerConnections: {
            ...state.peerConnections,
            sfu: pc,
          },
        }));

        return offer;
      } catch (error) {
        console.error("Error creating offer:", error);
        pc.close();
        throw error;
      }
    },

    disconnectFromSfu: () => {
      const { sfuConnection, sfuStreams } = get();

      if (sfuConnection) {
        sfuConnection.close();
      }

      // Clean up SFU streams
      Object.values(sfuStreams ?? {}).forEach((stream) => {
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
        iceCandidates: [],
        localStream: null,
        remoteStreams: {},
        peerConnections: {},
        isMuted: false,
        callError: null,
      });
    },
  }))
);
