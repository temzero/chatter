// stores/call/useP2PCallStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { LocalCallStatus } from "@/types/enums/LocalCallStatus";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { toast } from "react-toastify";
import { handleError } from "@/utils/handleError";
import { getMyChatMemberId } from "../chatMemberStore";
import { useCallStore } from "./callStore";
import { P2PCallMember } from "@/types/store/callMember.type";
import { ModalType, useModalStore } from "../modalStore";
import {
  getMicStream,
  stopMicStream,
  getVideoStream,
  stopVideoStream,
  getScreenStream,
  stopScreenStream,
  updateP2PAudioInConnections,
  updateVideoInConnections,
  stopMediaStreams,
} from "@/utils/webRtc/localStream.Utils";

export interface P2PState {
  // Local streams (moved from main call store)
  localVoiceStream: MediaStream | null;
  localVideoStream: MediaStream | null;
  localScreenStream: MediaStream | null;

  p2pMembers: P2PCallMember[];
  iceCandidates: RTCIceCandidateInit[];
}

export interface P2PActions {
  // Local stream management (moved from main call store)
  setupLocalStream: () => Promise<void>;
  setLocalVoiceStream: (stream: MediaStream | null) => void;
  setLocalVideoStream: (stream: MediaStream | null) => void;
  setLocalScreenStream: (stream: MediaStream | null) => void;
  cleanupStreams: () => void;

  initializeP2PCall: (chatId: string, isVideoCall: boolean) => Promise<void>;
  acceptP2PCall: () => Promise<void>;
  rejectP2PCall: (isCancel?: boolean) => void;
  cleanupP2PConnections: () => void;

  // P2P Member Management
  getP2PMember: (memberId: string) => P2PCallMember | undefined;
  addP2PMember: (member: Partial<P2PCallMember>) => P2PCallMember | undefined;
  updateP2PMember: (member: Partial<P2PCallMember>) => void;
  removeP2PMember: (memberId: string) => void;

  // WebRTC Connection Management
  createPeerConnection: (memberId: string) => RTCPeerConnection;
  updatePeerConnection: (
    memberId: string,
    offer: RTCSessionDescriptionInit
  ) => Promise<void>;
  removePeerConnection: (memberId: string) => void;
  getPeerConnection: (memberId: string) => RTCPeerConnection | null;
  addTrackToPeerConnection: (
    memberId: string,
    track: MediaStreamTrack,
    stream: MediaStream
  ) => Promise<void>;
  removeTrackFromPeerConnection: (
    memberId: string,
    trackKind: "audio" | "video"
  ) => Promise<void>;
  handleMemberRemoteStream: (memberId: string, event: RTCTrackEvent) => void;

  // WebRTC Signaling
  sendP2POffer: (toMemberId: string) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => void;

  // Media Controls
  toggleAudio: () => void;
  toggleVideo: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;

  // Clear state
  clearP2PState: () => void;
}

export const useP2PCallStore = create<P2PState & P2PActions>()(
  devtools((set, get) => ({
    // ========== P2P STATE ==========
    localVoiceStream: null,
    localVideoStream: null,
    localScreenStream: null,
    p2pMembers: [],
    iceCandidates: [],

    // ========== LOCAL STREAM MANAGEMENT ==========
    setupLocalStream: async () => {
      try {
        const { isVideoCall, isVideoEnabled } = useCallStore.getState();
        // Stop any existing tracks using utility functions
        const { localVoiceStream, localVideoStream, localScreenStream } = get();
        stopMediaStreams(localVoiceStream, localVideoStream, localScreenStream);

        // Always get audio stream
        const audioStream = await getMicStream();

        // Only get video stream if both isVideoCall and isVideoEnabled are true
        const videoStream =
          isVideoCall && isVideoEnabled ? await getVideoStream() : null;

        set({
          localVoiceStream: audioStream,
          localVideoStream: videoStream,
        });

        // Update UI state in main store
        useCallStore.setState({
          isVideoEnabled: isVideoCall && isVideoEnabled && !!videoStream,
          error: null,
        });
      } catch (error) {
        const { isVideoCall, isVideoEnabled } = useCallStore.getState();
        useCallStore.setState({ error: "device_unavailable" });
        handleError(
          error,
          isVideoCall && isVideoEnabled
            ? "Cannot access microphone or camera. Please close other applications."
            : "Cannot access microphone. Please close other applications."
        );
      }
    },

    setLocalVoiceStream: (stream: MediaStream | null) => {
      const oldStream = get().localVoiceStream;
      if (oldStream) {
        oldStream.getTracks().forEach((t) => t.stop()); // cleanup old
      }
      set({ localVoiceStream: stream });
    },

    setLocalVideoStream: (stream: MediaStream | null) => {
      const oldStream = get().localVideoStream;
      if (oldStream) {
        oldStream.getTracks().forEach((t) => t.stop());
      }
      set({ localVideoStream: stream });
    },

    setLocalScreenStream: (stream: MediaStream | null) => {
      const oldStream = get().localScreenStream;
      if (oldStream) {
        oldStream.getTracks().forEach((t) => t.stop());
      }
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
      });
    },

    // ========== P2P ACTIONS ==========
    initializeP2PCall: async (chatId: string, isVideoCall: boolean) => {
      toast.info(`initializeP2PCall, isVideoCall: ${isVideoCall}`);

      try {
        // 1. Request media permissions using utility functions
        const voiceStream = await getMicStream();
        const videoStream = isVideoCall ? await getVideoStream() : null;

        // 2. Update P2P store with streams
        set({
          localVoiceStream: voiceStream,
          localVideoStream: videoStream,
        });

        // 3. Update base store with UI state
        useCallStore.setState({
          isVideoEnabled: isVideoCall,
          startedAt: new Date(),
          chatId,
          isVideoCall: isVideoCall,
          localCallStatus: LocalCallStatus.OUTGOING,
        });

        // 4. OPEN MODAL ONLY AFTER SUCCESS
        useModalStore.getState().openModal(ModalType.CALL);

        // 5. Set timeout
        const timeoutRef = setTimeout(() => {
          const { localCallStatus } = useCallStore.getState();
          if (localCallStatus === LocalCallStatus.OUTGOING) {
            useCallStore.getState().endCall({ isTimeout: true });
          }
        }, 60000);

        useCallStore.setState({ timeoutRef });

        // 6. Initiate signaling
        callWebSocketService.initiateCall({
          chatId,
          isVideoCall: isVideoCall,
          isGroupCall: false,
        });
      } catch (error) {
        // Handle error locally - modal never opened so no need to close it
        get().cleanupStreams();
        useCallStore.setState({
          error: "p2p_init_failed",
          localCallStatus: LocalCallStatus.ERROR,
        });
        toast.error(
          "Permission denied! Please allow camera and microphone access."
        );
        throw error; // Re-throw to be caught by startCall
      }
    },

    acceptP2PCall: async () => {
      const {
        id: callId,
        chatId,
        isVideoCall,
        isVideoEnabled,
      } = useCallStore.getState();
      const isOpenVideoTrack = isVideoCall && isVideoEnabled;

      if (!callId || !chatId) {
        console.error("Missing callId or chatId");
        return;
      }

      console.log("accept P2P CALL");

      try {
        // Clean up existing streams
        get().cleanupStreams();

        // Get fresh media streams using utility functions
        const voiceStream = await getMicStream().catch(async (error) => {
          if (error.name === "NotReadableError") {
            toast.warning("Microphone in use. Trying alternative settings...");
          }
          throw error;
        });

        let videoStream: MediaStream | null = null;
        if (isOpenVideoTrack) {
          videoStream = await getVideoStream().catch(async (error) => {
            if (error.name === "NotReadableError") {
              toast.warning("Camera in use. Trying alternative settings...");
            }
            throw error;
          });
        }

        // Update P2P store
        set({
          localVoiceStream: voiceStream,
          localVideoStream: videoStream,
        });

        // Update base store
        useCallStore.getState().setLocalCallStatus(LocalCallStatus.CONNECTING);

        // Create peer connection for the caller
        const callerMemberId = useCallStore.getState().callerMemberId;
        if (callerMemberId && !get().getP2PMember(callerMemberId)) {
          get().addP2PMember({
            memberId: callerMemberId,
          });
        }

        // Send acceptance via WebSocket
        // if (chatId) {
        callWebSocketService.acceptCall({
          callId,
          chatId,
          isCallerCancel: false,
        });
        // }

        toast.success("Call accepted - waiting for connection...");
      } catch (error) {
        handleError(error, "Could not start media devices");
        if (chatId) {
          callWebSocketService.rejectCall({ callId, chatId });
        }
        useCallStore.getState().setLocalCallStatus(LocalCallStatus.ERROR);
      }
    },

    rejectP2PCall: (isCancel = false) => {
      const { id: callId, chatId } = useCallStore.getState();

      if (!callId || !chatId) {
        console.error("Missing callId or chatId");
        return;
      }

      try {
        // Tell server we rejected the call
        callWebSocketService.rejectCall({
          callId,
          chatId,
          isCallerCancel: isCancel,
        });
      } catch (error) {
        console.error("Error rejecting call:", error);
        toast.error("Failed to reject call. Please try again.");
        useCallStore.getState().setLocalCallStatus(LocalCallStatus.ERROR);
      }
    },

    cleanupP2PConnections: () => {
      const { p2pMembers } = get();
      const { localVoiceStream, localVideoStream, localScreenStream } = get();

      // Clean up local streams using utility functions
      stopMediaStreams(localVoiceStream, localVideoStream, localScreenStream);

      // Clean up all member streams
      p2pMembers.forEach((member) => {
        stopMediaStreams(
          member.voiceStream,
          member.videoStream,
          member.screenStream
        );

        if (member.peerConnection) {
          member.peerConnection.close();
        }
      });

      set({
        p2pMembers: [],
        iceCandidates: [],
      });
    },

    getP2PMember: (memberId: string) => {
      return get().p2pMembers.find((member) => member.memberId === memberId);
    },

    addP2PMember: (member: P2PCallMember): P2PCallMember | undefined => {
      const { localVoiceStream, localVideoStream } = get();
      console.log("addP2PMember");

      // 1. Prevent duplicates
      const existing = get().p2pMembers.find(
        (m) => m.memberId === member.memberId
      );
      if (existing) {
        console.warn(`Member ${member.memberId} already exists`);
        return existing; // return the already existing one
      }

      // 2. Use given pc or create one
      const pc =
        member.peerConnection ?? get().createPeerConnection(member.memberId);

      // 3. Add any pending ICE candidates
      get().iceCandidates.forEach((candidate) => {
        try {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding ICE candidate to new member:", error);
        }
      });

      // 4. Add local stream tracks
      if (localVoiceStream) {
        localVoiceStream.getAudioTracks().forEach((track) => {
          if (!pc.getSenders().some((s) => s.track === track)) {
            pc.addTrack(track, localVoiceStream);
          }
        });
      }

      if (localVideoStream) {
        localVideoStream.getTracks().forEach((track) => {
          if (!pc.getSenders().some((s) => s.track === track)) {
            pc.addTrack(track, localVideoStream);
          }
        });
      }

      // 5. Build full member object
      const newMember: P2PCallMember = {
        ...member,
        peerConnection: pc,
        voiceStream: member.voiceStream ?? null,
        videoStream: member.videoStream ?? null,
        screenStream: member.screenStream ?? null,
        isMuted: member.isMuted ?? false,
        isVideoEnabled: member.isVideoEnabled ?? false,
        isScreenSharing: member.isScreenSharing ?? false,
      };

      // 6. Update state
      set((state) => ({
        p2pMembers: [...state.p2pMembers, newMember],
      }));

      // 7. Return the member
      return newMember;
    },

    updateP2PMember: (
      member: Partial<P2PCallMember> & { memberId: string }
    ) => {
      set((state) => {
        const updatedMembers = state.p2pMembers.map((m) =>
          m.memberId === member.memberId
            ? {
                ...m,
                ...Object.fromEntries(
                  Object.entries(member).filter(
                    ([, value]) => value !== undefined
                  )
                ),
                lastActivity: Date.now(),
              }
            : m
        );

        return { p2pMembers: updatedMembers };
      });
    },

    removeP2PMember: (memberId: string) => {
      const { p2pMembers } = get();
      const member = p2pMembers.find((m) => m.memberId === memberId);

      if (!member) return;

      // 1. Close connection
      if (member.peerConnection) {
        member.peerConnection.close();
      }

      // 2. Clean up streams using utility functions
      stopMediaStreams(
        member.voiceStream,
        member.videoStream,
        member.screenStream
      );

      // 3. Remove from members list
      set({
        p2pMembers: p2pMembers.filter((m) => m.memberId !== memberId),
      });

      // If no one left, end the call
      const remaining = get().p2pMembers;
      if (remaining.length === 0) {
        useCallStore.getState().endCall();
      }
    },

    createPeerConnection: (memberId: string) => {
      const { id: callId, chatId } = useCallStore.getState();
      const { localVoiceStream, localVideoStream, localScreenStream } = get();

      if (!callId || !chatId) {
        console.error("Missing callId or chatId");
        return;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          // TODO: add TURN for production
        ],
        iceTransportPolicy: "all",
      });

      // === ICE Candidate Handling ===
      pc.onicecandidate = (event) => {
        if (event.candidate && chatId) {
          callWebSocketService.sendIceCandidate({
            callId,
            chatId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      // === Remote Tracks Handling ===
      pc.ontrack = (event) => {
        console.log(`📥 ontrack for ${memberId}:`, {
          track: event.track,
          streams: event.streams,
          kind: event.track.kind,
        });
        get().handleMemberRemoteStream(memberId, event);
      };

      // === Connection Monitoring ===
      pc.onconnectionstatechange = () => {
        switch (pc.connectionState) {
          case "connected":
            console.log(`✅ Peer ${memberId} connected`);
            break;
          case "disconnected":
            console.warn(`⚠️ Peer ${memberId} disconnected`);
            break;
          case "failed":
            console.error(`❌ Peer ${memberId} failed`);
            break;
          case "closed":
            console.log(`🔒 Peer ${memberId} closed`);
            break;
        }
      };

      // === Add Local Media Tracks ===
      if (localVoiceStream) {
        localVoiceStream.getAudioTracks().forEach((track) => {
          if (!pc.getSenders().some((s) => s.track?.id === track.id)) {
            pc.addTrack(track, localVoiceStream);
          }
        });
      }

      if (localVideoStream) {
        localVideoStream.getVideoTracks().forEach((track) => {
          if (!pc.getSenders().some((s) => s.track?.id === track.id)) {
            pc.addTrack(track, localVideoStream);
          }
        });
      }

      if (localScreenStream) {
        localScreenStream.getTracks().forEach((track) => {
          if (!pc.getSenders().some((s) => s.track?.id === track.id)) {
            pc.addTrack(track, localScreenStream);
          }
        });
      }

      // === Save connection in store ===
      set((state) => ({
        p2pMembers: state.p2pMembers.map((member) =>
          member.memberId === memberId
            ? { ...member, peerConnection: pc }
            : member
        ),
      }));

      return pc;
    },

    updatePeerConnection: async (
      memberId: string,
      offer: RTCSessionDescriptionInit
    ) => {
      const { p2pMembers } = get();
      const { id: callId, chatId } = useCallStore.getState();

      if (!callId || !chatId) {
        console.error("Missing callId or chatId");
        return;
      }

      // Find the member and their existing peer connection
      const member = p2pMembers.find((m) => m.memberId === memberId);
      if (!member?.peerConnection) {
        throw new Error(`No peer connection found for member ${memberId}`);
      }

      const pc = member.peerConnection;

      try {
        // Set the remote description (the offer from the other peer)
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Create and set local answer
        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        await pc.setLocalDescription(answer);

        // Send the answer back through WebSocket
        callWebSocketService.sendP2PAnswer({
          callId,
          chatId,
          answer,
        });
      } catch (error) {
        console.error("Error updating peer connection:", error);
        throw error;
      }
    },

    removePeerConnection: (memberId: string) => {
      const { p2pMembers } = get();
      const member = p2pMembers.find((m) => m.memberId === memberId);

      if (member && member.peerConnection) {
        const pc = member.peerConnection;
        pc.getSenders().forEach((s) => s.track?.stop());
        pc.close();

        set((state) => ({
          p2pMembers: state.p2pMembers.map((m) =>
            m.memberId === memberId
              ? {
                  ...m,
                  peerConnection: null,
                }
              : m
          ),
        }));
      }
    },

    getPeerConnection: (memberId: string) => {
      const { p2pMembers } = get();
      const member = p2pMembers.find((m) => m.memberId === memberId);
      return member?.peerConnection || null;
    },

    addTrackToPeerConnection: async (
      memberId: string,
      track: MediaStreamTrack,
      stream: MediaStream
    ) => {
      const { p2pMembers } = get();
      const { id: callId, chatId } = useCallStore.getState();

      if (!callId || !chatId) {
        console.error("Missing callId or chatId");
        return;
      }
      const member = p2pMembers.find((m) => m.memberId === memberId);

      if (!member?.peerConnection) {
        throw new Error(`No peer connection found for member ${memberId}`);
      }

      const pc = member.peerConnection;
      const senders = pc.getSenders();

      try {
        // Check if track of this kind already exists
        const existingSender = senders.find(
          (sender) => sender.track && sender.track.kind === track.kind
        );

        if (existingSender) {
          // Replace existing track
          await existingSender.replaceTrack(track);
        } else {
          // Add new track
          pc.addTrack(track, stream);

          // Renegotiate only when adding a new track
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });
            await pc.setLocalDescription(offer);

            callWebSocketService.sendP2POffer({
              callId,
              chatId,
              offer,
            });
          } catch (err) {
            console.error(
              `Error renegotiating after adding ${track.kind}:`,
              err
            );
          }
        }
      } catch (error) {
        console.error(
          `Error adding ${track.kind} track to peer connection:`,
          error
        );
        throw error;
      }
    },

    removeTrackFromPeerConnection: async (
      memberId: string,
      trackKind: "audio" | "video"
    ) => {
      const { p2pMembers } = get();
      const { id: callId, chatId } = useCallStore.getState();

      if (!callId || !chatId) {
        console.error("Missing callId or chatId");
        return;
      }
      const member = p2pMembers.find((m) => m.memberId === memberId);

      if (!member?.peerConnection) {
        throw new Error(`No peer connection found for member ${memberId}`);
      }

      const pc = member.peerConnection;
      const senders = pc.getSenders();
      let trackRemoved = false;

      try {
        // Find and remove all senders of the specified track kind
        for (const sender of senders) {
          if (sender.track && sender.track.kind === trackKind) {
            pc.removeTrack(sender);
            trackRemoved = true;
          }
        }

        // Renegotiate if tracks were actually removed
        if (trackRemoved) {
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: trackKind !== "audio",
              offerToReceiveVideo: trackKind !== "video",
            });
            await pc.setLocalDescription(offer);

            callWebSocketService.sendP2POffer({
              callId,
              chatId,
              offer,
            });
          } catch (err) {
            console.error(
              `Error renegotiating after removing ${trackKind}:`,
              err
            );
          }
        }
      } catch (error) {
        console.error(
          `Error removing ${trackKind} track from peer connection:`,
          error
        );
        throw error;
      }
    },

    handleMemberRemoteStream: (memberId: string, event: RTCTrackEvent) => {
      if (!event.track || !event.streams || event.streams.length === 0) {
        console.error("Received track event without stream!", event);
        return;
      }

      const kind = event.track.kind as "audio" | "video";
      const stream = event.streams[0]; // ✅ Use the stream WebRTC provides

      set((state) => {
        const member = state.p2pMembers.find((m) => m.memberId === memberId);
        if (!member) return state;

        // 🎤 AUDIO - Use the stream from the event
        if (kind === "audio") {
          return {
            p2pMembers: state.p2pMembers.map((m) =>
              m.memberId === memberId
                ? { ...m, voiceStream: stream, lastActivity: Date.now() }
                : m
            ),
          };
        }

        // 📹 VIDEO or SCREEN
        if (kind === "video") {
          const isScreen =
            event.track.label.toLowerCase().includes("screen") ||
            event.track.label.toLowerCase().includes("display");

          if (isScreen) {
            return {
              p2pMembers: state.p2pMembers.map((m) =>
                m.memberId === memberId
                  ? { ...m, screenStream: stream, lastActivity: Date.now() }
                  : m
              ),
            };
          } else {
            return {
              p2pMembers: state.p2pMembers.map((m) =>
                m.memberId === memberId
                  ? { ...m, videoStream: stream, lastActivity: Date.now() }
                  : m
              ),
            };
          }
        }

        return state;
      });
    },

    sendP2POffer: async (toMemberId: string) => {
      const { id: callId, chatId } = useCallStore.getState();

      if (!callId || !chatId) {
        console.error("Missing callId or chatId");
        return;
      }
      const myMemberId = getMyChatMemberId(chatId!);
      console.log("sendP2POffer", toMemberId);

      if (!myMemberId)
        throw new Error("Cannot send offer - no member ID found");
      if (!chatId)
        throw new Error("Cannot send offer - no active chat session");

      try {
        // 1. Create peer connection (tracks already added inside)
        const pc = get().createPeerConnection(toMemberId);

        // 2. Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 3. Send offer to callee
        callWebSocketService.sendP2POffer({
          callId,
          chatId,
          offer,
        });

        useCallStore.getState().setLocalCallStatus(LocalCallStatus.CONNECTING);
      } catch (error) {
        handleError(error, "Failed to create/send offer");
        useCallStore.getState().endCall();
        throw error;
      }
    },

    addIceCandidate: (candidate: RTCIceCandidateInit) => {
      const { p2pMembers } = get();

      // Store candidate for later use
      set((state) => ({
        iceCandidates: [...state.iceCandidates, candidate],
      }));

      // Add to existing connections only if remote description is set
      p2pMembers.forEach((member) => {
        if (member.peerConnection && member.peerConnection.remoteDescription) {
          try {
            member.peerConnection.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (error) {
            console.error(
              `Error adding ICE candidate to ${member.memberId}:`,
              error
            );
          }
        }
      });
    },

    toggleAudio: async () => {
      const { id: callId, chatId, isMuted } = useCallStore.getState();

      if (!callId || !chatId) {
        console.error("Missing callId or chatId");
        return;
      }
      const { p2pMembers, localVoiceStream } = get();
      const myMemberId = await getMyChatMemberId(chatId!);

      if (!myMemberId) return;

      try {
        if (isMuted) {
          // 🔊 OPEN mic
          const newVoiceStream = await getMicStream();

          await updateP2PAudioInConnections(
            newVoiceStream,
            p2pMembers,
            false, // P2P mode
            chatId!,
            (chatId: string, offer: RTCSessionDescriptionInit) => {
              callWebSocketService.sendP2POffer({ callId, chatId, offer });
            }
          );

          set({ localVoiceStream: newVoiceStream });
          useCallStore.setState({ isMuted: false });

          callWebSocketService.updateCallMember({
            callId,
            chatId,
            memberId: myMemberId,
            isMuted: false,
          });
        } else {
          // 🔇 CLOSE mic
          stopMicStream(localVoiceStream);

          set({ localVoiceStream: null });
          useCallStore.setState({ isMuted: true });

          callWebSocketService.updateCallMember({
            callId,
            chatId,
            memberId: myMemberId,
            isMuted: true,
          });
        }
      } catch (error) {
        console.error("Error in toggleAudio (P2P):", error);

        // revert state if error
        useCallStore.setState({ isMuted: true });
        callWebSocketService.updateCallMember({
          callId,
          chatId,
          memberId: myMemberId,
          isMuted: true,
        });
      }
    },

    toggleVideo: async () => {
      const { id: callId, chatId, isVideoEnabled } = useCallStore.getState();

      if (!callId || !chatId) {
        console.error("Missing callId or chatId");
        return;
      }
      const { p2pMembers, localVideoStream } = get();
      const myMemberId = await getMyChatMemberId(chatId!);

      if (!myMemberId) return;

      try {
        if (!isVideoEnabled) {
          // 🎥 TURN ON camera
          const newVideoStream = await getVideoStream();

          await updateVideoInConnections(
            newVideoStream,
            p2pMembers,
            false, // P2P mode
            chatId!,
            (chatId: string, offer: RTCSessionDescriptionInit) => {
              callWebSocketService.sendP2POffer({ callId, chatId, offer });
            }
          );

          set({ localVideoStream: newVideoStream });
          useCallStore.setState({ isVideoEnabled: true });

          callWebSocketService.updateCallMember({
            callId,
            chatId,
            memberId: myMemberId,
            isVideoEnabled: true,
          });
        } else {
          // 📷 TURN OFF camera
          // Remove video tracks from ALL peer connections
          for (const member of p2pMembers) {
            if (member.peerConnection) {
              await get().removeTrackFromPeerConnection(
                member.memberId,
                "video"
              );
            }
          }

          stopVideoStream(localVideoStream);

          set({ localVideoStream: null });
          useCallStore.setState({ isVideoEnabled: false });

          callWebSocketService.updateCallMember({
            callId,
            chatId,
            memberId: myMemberId,
            isVideoEnabled: false,
          });
        }
      } catch (error) {
        console.error("Error in toggleVideo (P2P):", error);
        useCallStore.setState({ isVideoEnabled: false });
        callWebSocketService.updateCallMember({
          callId,
          chatId,
          memberId: myMemberId,
          isVideoEnabled: false,
        });
      }
    },

    toggleScreenShare: async () => {
      const { id: callId, chatId, isScreenSharing } = useCallStore.getState();

      if (!callId || !chatId) {
        console.error("Missing callId or chatId");
        return;
      }
      const { p2pMembers, localScreenStream } = get();
      const myMemberId = await getMyChatMemberId(chatId!);

      if (!myMemberId) return;

      try {
        if (!isScreenSharing) {
          // Start screen sharing
          const screenStream = await getScreenStream();

          set({
            localScreenStream: screenStream,
          });
          useCallStore.setState({ isScreenSharing: true });

          // Add tracks to peer connections
          p2pMembers.forEach((member) => {
            if (member.peerConnection) {
              screenStream.getTracks().forEach((track) => {
                member.peerConnection!.addTrack(track, screenStream);
              });
            }
          });

          // Handle browser UI stop
          screenStream.getTracks().forEach((track) => {
            track.onended = () => get().toggleScreenShare();
          });

          callWebSocketService.updateCallMember({
            callId,
            chatId,
            memberId: myMemberId,
            isScreenSharing: true,
          });
        } else {
          // Stop screen sharing
          stopScreenStream(localScreenStream);

          set({ localScreenStream: null });
          useCallStore.setState({ isScreenSharing: false });

          callWebSocketService.updateCallMember({
            callId,
            chatId,
            memberId: myMemberId,
            isScreenSharing: false,
          });
        }
      } catch (error) {
        console.error("Error toggling screen share:", error);
        useCallStore.setState({ isScreenSharing: false });
        callWebSocketService.updateCallMember({
          callId,
          chatId,
          memberId: myMemberId,
          isScreenSharing: false,
        });
      }
    },

    clearP2PState: () => {
      const state = get();

      // Close peer connections
      state.p2pMembers.forEach((m) => {
        if (m.peerConnection) {
          m.peerConnection.close();
        }
      });

      // Stop local streams using utility functions
      const { localVoiceStream, localVideoStream, localScreenStream } = get();
      stopMediaStreams(localVoiceStream, localVideoStream, localScreenStream);

      // Reset store state
      set({
        localVoiceStream: null,
        localVideoStream: null,
        localScreenStream: null,
        p2pMembers: [],
        iceCandidates: [],
      });
    },
  }))
);
