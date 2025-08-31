// stores/call/useP2PCallStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CallStatus } from "@/types/enums/CallStatus";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { toast } from "react-toastify";
import { handleError } from "@/utils/handleError";
import { getMyChatMemberId } from "../chatMemberStore";
import {
  disableP2PVoice,
  enableP2PVoice,
  updateP2PAudioInConnections,
} from "@/utils/webRtc/P2PVoicePermission.Utils";
import {
  disableVideo,
  enableVideo,
  updateVideoInConnections,
} from "@/utils/webRtc/P2PVideoPermission.Utils";
import { useCallStore } from "./callStore";
import { P2PCallMember } from "@/types/store/callMember.type";
import { ModalType, useModalStore } from "../modalStore";

export interface P2PState {
  p2pMembers: P2PCallMember[];
  iceCandidates: RTCIceCandidateInit[];
}

export interface P2PActions {
  initializeP2PCall: (chatId: string, isVideoCall: boolean) => Promise<void>;
  acceptP2PCall: () => Promise<void>;
  rejectP2PCall: (isCancel?: boolean) => void;
  cleanupP2PConnections: () => void;

  // P2P Member Management
  getP2PMember: (memberId: string) => P2PCallMember | undefined;
  addP2PMember: (member: Partial<P2PCallMember>) => void;
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
  sendOffer: (toMemberId: string) => Promise<void>;
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
    p2pMembers: [],
    iceCandidates: [],

    // ========== P2P ACTIONS ==========
    initializeP2PCall: async (chatId: string, isVideoCall: boolean) => {
      toast.info(`initializeSFUCall, isVideoCall: ${isVideoCall}`);

      try {
        // 1. Request media permissions FIRST
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideoCall,
        });

        // 2. Split streams
        const voiceStream = new MediaStream(stream.getAudioTracks());
        const videoStream = isVideoCall
          ? new MediaStream(stream.getVideoTracks())
          : null;

        // 3. Update base store with ALL necessary state
        useCallStore.setState({
          localVoiceStream: voiceStream,
          localVideoStream: videoStream,
          isVideoEnabled: isVideoCall,
          startedAt: new Date(),
          chatId, // Reinforce these
          isVideoCall: isVideoCall,
          callStatus: CallStatus.OUTGOING,
        });

        // 4. OPEN MODAL ONLY AFTER SUCCESS
        useModalStore.getState().openModal(ModalType.CALL);

        // 5. Set timeout
        const timeoutRef = setTimeout(() => {
          const { callStatus } = useCallStore.getState();
          if (callStatus === CallStatus.OUTGOING) {
            useCallStore
              .getState()
              .endCall({ isTimeout: true, isCancel: true });
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
        useCallStore.getState().cleanupStreams();
        useCallStore.setState({
          error: "permission_denied",
          callStatus: CallStatus.ERROR,
        });
        toast.error(
          "Permission denied! Please allow camera and microphone access."
        );
        throw error; // Re-throw to be caught by startCall
      }
    },

    acceptP2PCall: async () => {
      const { chatId, isVideoCall } = useCallStore.getState();

      try {
        // Clean up existing streams
        useCallStore.getState().cleanupStreams();

        // Get fresh media streams
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
                video: isVideoCall,
              });
            }
            throw error;
          });

        // Split streams into audio and video
        const voiceStream = new MediaStream(stream.getAudioTracks());
        const videoStream = isVideoCall
          ? new MediaStream(stream.getVideoTracks())
          : null;

        // Update base store
        useCallStore.getState().setLocalVoiceStream(voiceStream);
        useCallStore.getState().setLocalVideoStream(videoStream);
        useCallStore.getState().setCallStatus(CallStatus.CONNECTING);

        // Create peer connection for the caller
        const callerMemberId = useCallStore.getState().callerMemberId;
        if (callerMemberId && !get().getP2PMember(callerMemberId)) {
          get().addP2PMember({
            memberId: callerMemberId,
            peerConnection: null,
            voiceStream: null,
            videoStream: null,
            screenStream: null,
            isMuted: false,
            isVideoEnabled: false,
            isScreenSharing: false,
          });
          get().createPeerConnection(callerMemberId);
        }

        // Send acceptance via WebSocket
        if (chatId) {
          callWebSocketService.acceptCall({
            chatId,
            isCallerCancel: false,
          });
        }

        toast.success("Call accepted - waiting for connection...");
      } catch (error) {
        handleError(error, "Could not start media devices");
        if (chatId) {
          callWebSocketService.rejectCall({ chatId });
        }
        useCallStore.getState().setCallStatus(CallStatus.ERROR);
      }
    },

    rejectP2PCall: (isCancel = false) => {
      const { chatId } = useCallStore.getState();

      if (!chatId) {
        console.error("No chatId found for rejecting call");
        return;
      }

      try {
        // Tell server we rejected the call
        callWebSocketService.rejectCall({ chatId, isCallerCancel: isCancel });
      } catch (error) {
        console.error("Error rejecting call:", error);
        toast.error("Failed to reject call. Please try again.");
        useCallStore.getState().setCallStatus(CallStatus.ERROR);
      }
    },

    cleanupP2PConnections: () => {
      const { p2pMembers } = get();
      const { localVoiceStream, localVideoStream, localScreenStream } =
        useCallStore.getState();

      // Helper to stop tracks
      const stopAllTracks = (stream: MediaStream | null | undefined) => {
        if (!stream) return;
        stream.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      };

      // Clean up local streams
      stopAllTracks(localVoiceStream);
      stopAllTracks(localVideoStream);
      stopAllTracks(localScreenStream);

      // Clean up all member streams and connections
      p2pMembers.forEach((member) => {
        stopAllTracks(member.voiceStream);
        stopAllTracks(member.videoStream);
        stopAllTracks(member.screenStream);

        if (member.peerConnection) {
          member.peerConnection.close();
        }
      });

      set({
        p2pMembers: [],
        iceCandidates: [],
      });
    },

    addP2PMember: (member: P2PCallMember) => {
      const { localVoiceStream, localVideoStream } = useCallStore.getState();

      // 1. Create peer connection for the new member
      const pc = get().createPeerConnection(member.memberId);

      // 2. Add any pending ICE candidates to the new connection
      get().iceCandidates.forEach((candidate) => {
        try {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding ICE candidate to new member:", error);
        }
      });

      // 3. Add local stream tracks to the new connection
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

      // 4. Add member to state
      set((state) => ({
        p2pMembers: [
          ...state.p2pMembers,
          {
            ...member,
            peerConnection: pc,
            voiceStream: null,
            videoStream: null,
            screenStream: null,
            isMuted: false,
            isVideoEnabled: false,
            isScreenSharing: false,
            joinedAt: Date.now(),
            lastActivity: Date.now(),
          },
        ],
      }));
    },

    removeP2PMember: (memberId: string) => {
      const { p2pMembers } = get();
      const member = p2pMembers.find((m) => m.memberId === memberId);

      if (!member) return;

      // 1. Close connection
      if (member.peerConnection) {
        member.peerConnection.close();
      }

      // 2. Clean up streams
      if (member.voiceStream) {
        member.voiceStream.getTracks().forEach((track) => track.stop());
      }
      if (member.videoStream) {
        member.videoStream.getTracks().forEach((track) => track.stop());
      }
      if (member.screenStream) {
        member.screenStream.getTracks().forEach((track) => track.stop());
      }

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

    updateP2PMember: (
      member: Partial<P2PCallMember> & { memberId: string }
    ) => {
      set((state) => {
        const includeIfDefined = <T>(value: T | undefined, key: string) =>
          value !== undefined ? { [key]: value } : {};

        const updatedMembers = state.p2pMembers.map((m) =>
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

        return { p2pMembers: updatedMembers };
      });
    },

    getP2PMember: (memberId: string) => {
      return get().p2pMembers.find((member) => member.memberId === memberId);
    },

    createPeerConnection: (memberId: string) => {
      const { chatId, localVoiceStream, localVideoStream, localScreenStream } =
        useCallStore.getState();

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          // Add your TURN servers here
        ],
        iceTransportPolicy: "all",
      });

      // ICE Candidate Handling
      pc.onicecandidate = (event) => {
        if (event.candidate && chatId) {
          callWebSocketService.sendIceCandidate({
            chatId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      // Track Handling
      pc.ontrack = (event) => {
        get().handleMemberRemoteStream(memberId, event);
      };

      // Connection Monitoring
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

      // Add local media
      if (localVoiceStream) {
        localVoiceStream.getAudioTracks().forEach((track) => {
          if (!pc.getSenders().some((s) => s.track === track)) {
            pc.addTrack(track, localVoiceStream);
          }
        });
      }

      if (localVideoStream) {
        localVideoStream.getVideoTracks().forEach((track) => {
          if (!pc.getSenders().some((s) => s.track === track)) {
            pc.addTrack(track, localVideoStream);
          }
        });
      }

      if (localScreenStream) {
        localScreenStream.getTracks().forEach((track) => {
          if (!pc.getSenders().some((s) => s.track === track)) {
            pc.addTrack(track, localScreenStream);
          }
        });
      }

      // Store connection in the member's peerConnection
      set((state) => ({
        p2pMembers: state.p2pMembers.map((member) =>
          member.memberId === memberId
            ? {
                ...member,
                peerConnection: pc,
              }
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
      const { chatId } = useCallStore.getState();

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
        callWebSocketService.sendAnswer({
          chatId: chatId!,
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
      const chatId = useCallStore.getState().chatId;
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

            callWebSocketService.sendOffer({
              chatId: chatId!,
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
      const chatId = useCallStore.getState().chatId;
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

            callWebSocketService.sendOffer({
              chatId: chatId!,
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

      set((state) => {
        const member = state.p2pMembers.find((m) => m.memberId === memberId);
        if (!member) return state;

        // 🎤 AUDIO
        if (kind === "audio") {
          const voiceStream = member.voiceStream ?? new MediaStream();

          // only add if not already present
          if (!voiceStream.getTracks().some((t) => t.id === event.track.id)) {
            voiceStream.addTrack(event.track);
          }

          return {
            p2pMembers: state.p2pMembers.map((m) =>
              m.memberId === memberId
                ? { ...m, voiceStream, lastActivity: Date.now() }
                : m
            ),
          };
        }

        // 📹 VIDEO or SCREEN
        if (kind === "video") {
          // check if this is a screen-share track
          const isScreen =
            event.track.label.toLowerCase().includes("screen") ||
            event.track.label.toLowerCase().includes("display");

          if (isScreen) {
            const screenStream = member.screenStream ?? new MediaStream();

            if (
              !screenStream.getTracks().some((t) => t.id === event.track.id)
            ) {
              screenStream.addTrack(event.track);
            }

            return {
              p2pMembers: state.p2pMembers.map((m) =>
                m.memberId === memberId
                  ? { ...m, screenStream, lastActivity: Date.now() }
                  : m
              ),
            };
          } else {
            const videoStream = member.videoStream ?? new MediaStream();

            if (!videoStream.getTracks().some((t) => t.id === event.track.id)) {
              videoStream.addTrack(event.track);
            }

            return {
              p2pMembers: state.p2pMembers.map((m) =>
                m.memberId === memberId
                  ? { ...m, videoStream, lastActivity: Date.now() }
                  : m
              ),
            };
          }
        }

        return state;
      });
    },

    sendOffer: async (toMemberId: string) => {
      const { chatId } = useCallStore.getState();
      const myMemberId = getMyChatMemberId(chatId!);

      if (!myMemberId)
        throw new Error("Cannot send offer - no member ID found");
      if (!chatId)
        throw new Error("Cannot send offer - no active chat session");

      try {
        const pc = get().createPeerConnection(toMemberId);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        await pc.setLocalDescription(offer);

        callWebSocketService.sendOffer({
          chatId,
          offer,
        });

        useCallStore.getState().setCallStatus(CallStatus.CONNECTING);
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
      const { chatId, localVoiceStream, isMuted } = useCallStore.getState();
      const { p2pMembers } = get();
      const myMemberId = getMyChatMemberId(chatId!);

      if (!myMemberId) return;

      try {
        if (isMuted) {
          // 🔊 OPEN mic
          await enableP2PVoice(
            (newVoiceStream) => {
              updateP2PAudioInConnections(
                newVoiceStream,
                p2pMembers,
                false, // P2P mode
                chatId!,
                (chatId: string, offer: RTCSessionDescriptionInit) => {
                  callWebSocketService.sendOffer({ chatId, offer });
                }
              );

              useCallStore.setState({
                isMuted: false,
                localVoiceStream: newVoiceStream,
              });

              callWebSocketService.updateCallMember({
                chatId: chatId!,
                memberId: myMemberId,
                isMuted: false,
              });
            },
            (error) => {
              console.error("Error enabling mic:", error);
              // revert state
              useCallStore.setState({ isMuted });
              callWebSocketService.updateCallMember({
                chatId: chatId!,
                memberId: myMemberId,
                isMuted,
              });
            }
          );
        } else {
          // 🔇 CLOSE mic
          await disableP2PVoice(
            localVoiceStream,
            () => {
              useCallStore.setState({
                isMuted: true,
                localVoiceStream: null,
              });

              callWebSocketService.updateCallMember({
                chatId: chatId!,
                memberId: myMemberId,
                isMuted: true,
              });
            },
            (error) => {
              console.error("Error disabling mic:", error);
              // revert state
              useCallStore.setState({ isMuted });
              callWebSocketService.updateCallMember({
                chatId: chatId!,
                memberId: myMemberId,
                isMuted,
              });
            }
          );
        }
      } catch (error) {
        console.error("Error in toggleAudio:", error);
        useCallStore.setState({ isMuted });
      }
    },

    toggleVideo: async () => {
      const { chatId, localVideoStream, isVideoEnabled } =
        useCallStore.getState();
      const { p2pMembers } = get();
      const myMemberId = getMyChatMemberId(chatId!);

      if (!myMemberId) return;

      try {
        if (!isVideoEnabled) {
          // 🎥 TURN ON camera
          await enableVideo(
            (newVideoStream) => {
              // Update video in peer connections
              updateVideoInConnections(
                newVideoStream,
                p2pMembers,
                false, // P2P mode
                chatId!,
                (chatId: string, offer: RTCSessionDescriptionInit) => {
                  callWebSocketService.sendOffer({ chatId, offer });
                }
              );

              useCallStore.setState({
                isVideoEnabled: true,
                localVideoStream: newVideoStream,
              });

              callWebSocketService.updateCallMember({
                chatId: chatId!,
                memberId: myMemberId,
                isVideoEnabled: true,
              });
            },
            (error) => {
              console.error("Error enabling video:", error);
              // revert state
              useCallStore.setState({
                isVideoEnabled,
                localVideoStream,
              });
              callWebSocketService.updateCallMember({
                chatId: chatId!,
                memberId: myMemberId,
                isVideoEnabled,
              });
            }
          );
        } else {
          // 📷 TURN OFF camera
          await disableVideo(
            localVideoStream,
            () => {
              useCallStore.setState({
                isVideoEnabled: false,
                localVideoStream: null,
              });

              callWebSocketService.updateCallMember({
                chatId: chatId!,
                memberId: myMemberId,
                isVideoEnabled: false,
              });
            },
            (error) => {
              console.error("Error disabling video:", error);
              // revert state
              useCallStore.setState({
                isVideoEnabled,
                localVideoStream,
              });
              callWebSocketService.updateCallMember({
                chatId: chatId!,
                memberId: myMemberId,
                isVideoEnabled,
              });
            }
          );
        }
      } catch (error) {
        console.error("Error in toggleVideo:", error);
        useCallStore.setState({
          isVideoEnabled,
          localVideoStream,
        });
      }
    },

    toggleScreenShare: async () => {
      const { chatId, localScreenStream, isScreenSharing } =
        useCallStore.getState();
      const { p2pMembers } = get();
      const myMemberId = getMyChatMemberId(chatId!);

      if (!myMemberId) return;

      try {
        if (isScreenSharing) {
          // Start screen sharing
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });

          useCallStore.setState({
            isScreenSharing: true,
            localScreenStream: screenStream,
          });

          // Add screen share to peer connections
          p2pMembers.forEach((member) => {
            if (member.peerConnection) {
              screenStream.getTracks().forEach((track) => {
                member.peerConnection!.addTrack(track, screenStream);
              });
            }
          });

          // Notify other participants
          callWebSocketService.updateCallMember({
            chatId: chatId!,
            memberId: myMemberId,
            isScreenSharing: true,
          });
        } else {
          // Stop screen sharing
          if (localScreenStream) {
            localScreenStream.getTracks().forEach((track) => track.stop());
          }

          useCallStore.setState({
            isScreenSharing: false,
            localScreenStream: null,
          });

          // Notify other participants
          callWebSocketService.updateCallMember({
            chatId: chatId!,
            memberId: myMemberId,
            isScreenSharing: false,
          });
        }
      } catch (error) {
        console.error("Error toggling screen share:", error);
        // Revert state on error
        useCallStore.setState({
          isScreenSharing: isScreenSharing,
          localScreenStream: localScreenStream,
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

      // Stop local streams if any
      const localStream = useCallStore.getState().localVoiceStream;
      localStream?.getTracks().forEach((t) => t.stop());

      // Reset store state
      set({
        p2pMembers: [],
        iceCandidates: [],
      });
    },
  }))
);
