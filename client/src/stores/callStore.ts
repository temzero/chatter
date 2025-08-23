// stores/callStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ModalType } from "@/types/enums/modalType";
import { CallStatus } from "@/types/enums/CallStatus";
import { useModalStore } from "@/stores/modalStore";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { toast } from "react-toastify";
import { handleError } from "@/utils/handleError";
import { getMyChatMemberId } from "./chatMemberStore";
import { callMemberPayload } from "@/types/callPayload";

export interface CallMember {
  memberId: string;
  displayName?: string;
  avatarUrl?: string;

  // Connections - only one type per call
  peerConnection?: RTCPeerConnection | null; // for direct call
  sfuConnection?: RTCPeerConnection | null; // for group call

  // Streams - SEPARATE for optimal React performance
  voiceStream?: MediaStream | null;
  videoStream?: MediaStream | null;
  screenStream?: MediaStream | null;

  // State flags
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  isScreenSharing?: boolean;

  isSpeaking?: boolean;
  joinedAt?: number;
  lastActivity?: number;
}

interface CallStoreState {
  chatId: string | null;
  callerMemberId?: string;
  callStatus: CallStatus | null;
  startedAt?: Date;
  timeoutRef?: NodeJS.Timeout;
  isVideoCall: boolean;
  isGroupCall: boolean;
  endedAt?: Date;

  // my local streams - these contain the truth!
  localVoiceStream: MediaStream | null;
  localVideoStream: MediaStream | null;
  localScreenStream: MediaStream | null;

  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;

  // members
  callMembers: CallMember[];
  iceCandidates: RTCIceCandidateInit[];

  error?:
    | "permission_denied"
    | "device_unavailable"
    | "connection_failed"
    | null;
}

interface CallStoreActions {
  // Core lifecycle
  startCall: (
    chatId: string,
    isVideo: boolean,
    isGroup: boolean
  ) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: (isCancel?: boolean) => void;
  addCallMember: (member: CallMember) => void;
  removeCallMember: (memberId: string) => void;
  updateCallMember: (payload: callMemberPayload) => void;
  endCall: (option?: {
    isCancel?: boolean;
    isRejected?: boolean;
    isTimeout?: boolean;
  }) => void;

  // Status / Type
  setStatus: (status: CallStatus) => void;

  // Media toggles
  toggleLocalVoice: () => void;
  toggleLocalVideo: () => Promise<void>;
  toggleLocalScreenShare: () => Promise<void>;

  // Media setup/cleanup
  setupLocalStream: () => Promise<void>;
  cleanupStreams: () => void;
  createPeerConnection: (memberId: string) => RTCPeerConnection;
  removePeerConnection: (memberId: string) => void;
  handleRemoteStream: (memberId: string, event: RTCTrackEvent) => void;
  createSfuConnection: () => Promise<RTCSessionDescriptionInit>;
  disconnectFromSfu: () => void;

  // Socket handlers
  sendOffer: (toMemberId: string) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => void;

  // Utilities
  getCallDuration: () => number;
  closeCallModal: () => void;
  getCallMember: (memberId: string) => CallMember | undefined;
  updateMemberActivity: (memberId: string) => void;
}

export type CallStore = CallStoreState & CallStoreActions;

export const useCallStore = create<CallStore>()(
  devtools((set, get) => ({
    // Initial state
    chatId: null,
    callStatus: null,
    isVideoCall: false,
    isGroupCall: false,
    isMuted: false,
    isVideoEnabled: false,
    localVoiceStream: null,
    localVideoStream: null,
    localScreenStream: null,
    callMembers: [],
    iceCandidates: [],
    error: null,

    // 📞 Start Call with media setup
    startCall: async (chatId, isVideo, isGroup) => {
      try {
        // 1. Request media permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideo,
        });

        // 2. Split streams into audio and video
        const voiceStream = new MediaStream(stream.getAudioTracks());
        const videoStream = isVideo
          ? new MediaStream(stream.getVideoTracks())
          : null;

        // 3. Save streams to state
        set({
          localVoiceStream: voiceStream,
          localVideoStream: videoStream,
          chatId,
          callStatus: CallStatus.OUTGOING,
          isVideoCall: isVideo,
          isGroupCall: isGroup,
          isVideoEnabled: isVideo,
          startedAt: new Date(),
        });

        // 4. Use openCall to open the modal and set basic call state
        useModalStore.getState().openModal(ModalType.CALL);

        // 5. Set timeout to automatically end call after 1 minute
        const timeoutRef = setTimeout(() => {
          const { callStatus } = get();
          // Only end if still in outgoing state (not answered)
          if (callStatus === CallStatus.OUTGOING) {
            get().endCall({ isTimeout: true, isCancel: true });
          }
        }, 60000); // 60 seconds = 1 minute

        set({ timeoutRef });

        // 6. Initiate WebRTC connection
        callWebSocketService.initiateCall({
          chatId,
          isVideoCall: isVideo,
          isGroupCall: isGroup,
        });
      } catch (error) {
        useModalStore.getState().closeModal();
        console.error("Permission denied:", error);
        get().cleanupStreams();
        set({
          error: "permission_denied",
          callStatus: CallStatus.ERROR,
        });
        toast.error(
          "Permission denied! Please allow camera and microphone access."
        );
      }
    },

    acceptCall: async () => {
      const {
        chatId,
        localVoiceStream,
        localVideoStream,
        isVideoCall,
        isGroupCall,
      } = get();

      try {
        // 1. Clean up any existing streams first
        if (localVoiceStream) {
          localVoiceStream.getTracks().forEach((track) => track.stop());
        }
        if (localVideoStream) {
          localVideoStream.getTracks().forEach((track) => track.stop());
        }

        // 2. Get fresh media streams
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

        // 3. Split streams into audio and video
        const voiceStream = new MediaStream(stream.getAudioTracks());
        const videoStream = isVideoCall
          ? new MediaStream(stream.getVideoTracks())
          : null;

        // 4. Set streams in state
        set({
          localVoiceStream: voiceStream,
          localVideoStream: videoStream,
          callStatus: CallStatus.CONNECTING,
          isVideoEnabled: isVideoCall,
          startedAt: new Date(),
        });

        // 5. Send acceptance via WebSocket
        if (chatId) {
          callWebSocketService.acceptCall({
            chatId,
            isCallerCancel: false,
          });
        }

        // 6. If group call, create SFU connection
        if (isGroupCall) {
          await get().createSfuConnection();
        }

        toast.success("Call accepted - waiting for connection...");
      } catch (error) {
        handleError(error, "Could not start media devices");

        // Send rejection if media setup fails
        if (chatId) {
          callWebSocketService.rejectCall({
            chatId,
          });
        }

        set({
          error: "device_unavailable",
          callStatus: CallStatus.ERROR,
        });
      }
    },

    rejectCall: (isCancel = false) => {
      const { chatId } = get();

      if (!chatId) {
        console.error("No chatId found for rejecting call");
        return;
      }

      try {
        // Tell server we rejected the call
        callWebSocketService.rejectCall({ chatId, isCallerCancel: isCancel });

        // Close modal and clean up
        get().endCall({ isCancel, isRejected: true });
      } catch (error) {
        console.error("Error rejecting call:", error);
        toast.error("Failed to reject call. Please try again.");
        set({
          error: "device_unavailable",
          callStatus: CallStatus.ERROR,
        });
      }
    },

    addCallMember: (member: CallMember) => {
      const { isGroupCall, localVoiceStream, localVideoStream, iceCandidates } =
        get();

      // For direct calls, create peer connection
      if (!isGroupCall) {
        // 1. Create peer connection for the new member
        const pc = get().createPeerConnection(member.memberId);

        // 2. Add any pending ICE candidates to the new connection
        iceCandidates.forEach((candidate) => {
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
              console.log("➕ Adding audio track to peer connection:", track);
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
      }

      // 4. Initialize remote streams for the new member
      set((state) => ({
        callMembers: [
          ...state.callMembers,
          {
            ...member,
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

      console.log(`Member ${member.memberId} added to call`);

      // 5. If this is the first member joining, update call status
      const currentMembers = get().callMembers;
      if (
        currentMembers.length === 1 &&
        get().callStatus === CallStatus.CONNECTING
      ) {
        set({ callStatus: CallStatus.CONNECTED });
      }
    },

    removeCallMember: (memberId: string) => {
      const { callMembers, isGroupCall } = get();
      const member = callMembers.find((m) => m.memberId === memberId);

      if (!member) return;

      // 1. Close connections based on call type
      if (isGroupCall && member.sfuConnection) {
        member.sfuConnection.close();
      } else if (!isGroupCall && member.peerConnection) {
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
        callMembers: callMembers.filter((m) => m.memberId !== memberId),
      });
      console.log(`Member ${memberId} removed from call`);

      // If no one left, end the call
      const remaining = get().callMembers;
      if (remaining.length === 0) {
        get().endCall();
      }
    },

    updateCallMember: (payload: callMemberPayload) => {
      set((state) => {
        const includeIfDefined = <T>(value: T | undefined, key: string) =>
          value !== undefined ? { [key]: value } : {};

        const updatedMembers = state.callMembers.map((member) =>
          member.memberId === payload.memberId
            ? {
                ...member,
                ...includeIfDefined(payload.isMuted, "isMuted"),
                ...includeIfDefined(payload.isVideoEnabled, "isVideoEnabled"),
                ...includeIfDefined(payload.isScreenSharing, "isScreenSharing"),
                lastActivity: Date.now(),
              }
            : member
        );

        const hasVideoEnabled = updatedMembers.some(
          (member) => member.isVideoEnabled
        );

        return {
          callMembers: updatedMembers,
          isVideoCall: hasVideoEnabled,
        };
      });
    },

    // 🛑 End Call: cleanup everything
    endCall: (option) => {
      const { isCancel = false, isRejected = false } = option ?? {};
      const {
        localVoiceStream,
        localVideoStream,
        localScreenStream,
        callMembers,
        timeoutRef,
        callStatus,
        isGroupCall,
      } = get();

      // Clear the timeout if it exists
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }

      if (
        callStatus === CallStatus.ENDED ||
        callStatus === CallStatus.CANCELED ||
        callStatus === CallStatus.REJECTED
      ) {
        return;
      }

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
      callMembers.forEach((member) => {
        stopAllTracks(member.voiceStream);
        stopAllTracks(member.videoStream);
        stopAllTracks(member.screenStream);

        if (isGroupCall && member.sfuConnection) {
          member.sfuConnection.close();
        } else if (!isGroupCall && member.peerConnection) {
          member.peerConnection.close();
        }
      });

      let finalStatus = CallStatus.ENDED;
      if (isCancel) finalStatus = CallStatus.CANCELED;
      if (isRejected) finalStatus = CallStatus.REJECTED;

      set({
        callStatus: finalStatus,
        endedAt: new Date(),
        callMembers: [],
        iceCandidates: [],
        localVoiceStream: null,
        localVideoStream: null,
        localScreenStream: null,
        error: null,
        isMuted: false,
        isVideoEnabled: false,
        isScreenSharing: false,
      });

      // Close modal after a brief delay to show call ended state
      setTimeout(() => {
        useModalStore.getState().closeModal();
      }, 2000);
    },

    setStatus: (callStatus: CallStatus) => {
      set({ callStatus });
    },

    // 🎤 Toggle audio mute
    toggleLocalVoice: () => {
      const { localVoiceStream, isMuted, chatId } = get();
      const myMemberId = getMyChatMemberId(chatId!);

      if (!myMemberId || !localVoiceStream) return;

      const newMutedState = !isMuted;

      try {
        // 🎤 Toggle mic input without breaking the connection
        localVoiceStream.getAudioTracks().forEach((track) => {
          track.enabled = !newMutedState;
          // false = muted (no audio sent)
          // true  = unmuted (audio sent)
        });

        // Update local state
        set({ isMuted: newMutedState });

        // Sync mute status to other peers (for UI only)
        callWebSocketService.updateCallMember({
          chatId: chatId!,
          memberId: myMemberId,
          isMuted: newMutedState,
        });
      } catch (err) {
        console.error("Error toggling mute:", err);
      }
    },

    // toggleLocalVoice: () => {
    //   const { localVoiceStream, isMuted, chatId } = get();
    //   const myMemberId = getMyChatMemberId(chatId!);

    //   if (!myMemberId || !localVoiceStream) return;

    //   const newMutedState = !isMuted;

    //   try {
    //     // 🎤 Toggle mic input without stopping the stream
    //     localVoiceStream.getAudioTracks().forEach((track) => {
    //       track.enabled = !newMutedState; // false = muted, true = unmuted
    //     });

    //     // Update state
    //     set({ isMuted: newMutedState });

    //     // Let others know about the mute status (for UI)
    //     callWebSocketService.updateCallMember({
    //       chatId: chatId!,
    //       memberId: myMemberId,
    //       isMuted: newMutedState,
    //     });
    //   } catch (err) {
    //     console.error("Error toggling mute:", err);
    //   }
    // },

    toggleLocalVideo: async () => {
      const {
        localVideoStream,
        isVideoEnabled,
        chatId,
        isGroupCall,
        callMembers,
        callStatus,
      } = get();

      const myMemberId = getMyChatMemberId(chatId!);
      if (!myMemberId) return;

      try {
        if (isVideoEnabled) {
          // Disable video - stop all video tracks to release the webcam
          if (localVideoStream) {
            localVideoStream.getTracks().forEach((track) => {
              track.stop(); // This stops the track and releases the webcam
            });
          }

          set({ localVideoStream: null, isVideoEnabled: false });

          // Notify peers about video state change
          callWebSocketService.updateCallMember({
            chatId: chatId!,
            memberId: myMemberId,
            isVideoEnabled: false,
          });

          // For direct calls, remove video tracks from peer connections
          if (!isGroupCall && callStatus === CallStatus.CONNECTED) {
            for (const member of callMembers) {
              if (!member.peerConnection) continue;

              const pc = member.peerConnection;
              const senders = pc.getSenders();

              // Remove video tracks and renegotiate
              let hasVideoTracks = false;

              for (const sender of senders) {
                if (sender.track && sender.track.kind === "video") {
                  pc.removeTrack(sender);
                  hasVideoTracks = true;
                }
              }

              // Renegotiate only if we removed video tracks
              if (hasVideoTracks) {
                try {
                  const offer = await pc.createOffer();
                  await pc.setLocalDescription(offer);
                  callWebSocketService.sendOffer({ chatId: chatId!, offer });
                } catch (err) {
                  console.error(
                    "Error renegotiating after removing video:",
                    err
                  );
                }
              }
            }
          }
        } else {
          // Enable video - get new video stream
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
          });

          const newVideoStream = new MediaStream(videoStream.getVideoTracks());

          set({
            localVideoStream: newVideoStream,
            isVideoEnabled: true,
          });

          // Notify peers about video state change
          callWebSocketService.updateCallMember({
            chatId: chatId!,
            memberId: myMemberId,
            isVideoEnabled: true,
          });

          // For direct calls, add video tracks to peer connections
          if (!isGroupCall && callStatus === CallStatus.CONNECTED) {
            for (const member of callMembers) {
              if (!member.peerConnection) continue;

              const pc = member.peerConnection;

              // Add video track
              pc.addTrack(newVideoStream.getVideoTracks()[0], newVideoStream);

              // Renegotiate connection
              try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                callWebSocketService.sendOffer({ chatId: chatId!, offer });
              } catch (err) {
                console.error("Error renegotiating video:", err);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error toggling video:", error);
        toast.error("Could not toggle video");
      }
    },

    // toggleLocalVideo: async () => {
    //   const {
    //     localVideoStream,
    //     isVideoEnabled,
    //     chatId,
    //     isGroupCall,
    //     callMembers,
    //     callStatus,
    //   } = get();

    //   const myMemberId = getMyChatMemberId(chatId!);
    //   if (!myMemberId) return;

    //   try {
    //     // If video is currently enabled, just disable it
    //     if (isVideoEnabled) {
    //       if (localVideoStream) {
    //         localVideoStream.getVideoTracks().forEach((track) => {
    //           track.enabled = false;
    //         });
    //       }

    //       set({ isVideoEnabled: false });

    //       // Notify peers about video state change
    //       callWebSocketService.updateCallMember({
    //         chatId: chatId!,
    //         memberId: myMemberId,
    //         isVideoEnabled: false,
    //       });

    //       // For direct calls, disable video tracks in peer connections
    //       if (!isGroupCall) {
    //         for (const member of callMembers) {
    //           if (!member.peerConnection) continue;
    //           member.peerConnection.getSenders().forEach((sender) => {
    //             if (sender.track && sender.track.kind === "video") {
    //               sender.track.enabled = false;
    //             }
    //           });
    //         }
    //       }
    //     } else {
    //       // If video is currently disabled

    //       // Case 1: No video stream exists yet (first time enabling)
    //       if (!localVideoStream) {
    //         // Get new video stream
    //         const videoStream = await navigator.mediaDevices.getUserMedia({
    //           video: {
    //             width: { ideal: 1280 },
    //             height: { ideal: 720 },
    //             facingMode: "user",
    //           },
    //         });

    //         const newVideoStream = new MediaStream(
    //           videoStream.getVideoTracks()
    //         );

    //         set({
    //           localVideoStream: newVideoStream,
    //           isVideoEnabled: true,
    //         });

    //         // Notify peers about video state change
    //         callWebSocketService.updateCallMember({
    //           chatId: chatId!,
    //           memberId: myMemberId,
    //           isVideoEnabled: true,
    //         });

    //         // For direct calls, add video tracks to peer connections
    //         if (!isGroupCall) {
    //           for (const member of callMembers) {
    //             if (!member.peerConnection) continue;

    //             const pc = member.peerConnection;
    //             const senders = pc.getSenders();

    //             // Check if we already have a video sender
    //             const videoSender = senders.find(
    //               (s) => s.track && s.track.kind === "video"
    //             );

    //             if (videoSender) {
    //               // Replace existing video track
    //               await videoSender.replaceTrack(
    //                 newVideoStream.getVideoTracks()[0]
    //               );
    //             } else {
    //               // Add new video track and renegotiate
    //               pc.addTrack(
    //                 newVideoStream.getVideoTracks()[0],
    //                 newVideoStream
    //               );

    //               // Only renegotiate if call is already connected
    //               if (callStatus === CallStatus.CONNECTED) {
    //                 try {
    //                   const offer = await pc.createOffer();
    //                   await pc.setLocalDescription(offer);
    //                   callWebSocketService.sendOffer({
    //                     chatId: chatId!,
    //                     offer,
    //                   });
    //                 } catch (err) {
    //                   console.error("Error renegotiating video:", err);
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       } else {
    //         // Case 2: Video stream exists but is disabled - just enable it
    //         localVideoStream.getVideoTracks().forEach((track) => {
    //           track.enabled = true;
    //         });

    //         set({ isVideoEnabled: true });

    //         // Notify peers about video state change
    //         callWebSocketService.updateCallMember({
    //           chatId: chatId!,
    //           memberId: myMemberId,
    //           isVideoEnabled: true,
    //         });

    //         // For direct calls, enable video tracks in peer connections
    //         if (!isGroupCall) {
    //           for (const member of callMembers) {
    //             if (!member.peerConnection) continue;
    //             member.peerConnection.getSenders().forEach((sender) => {
    //               if (sender.track && sender.track.kind === "video") {
    //                 sender.track.enabled = true;
    //               }
    //             });
    //           }
    //         }
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Error toggling video:", error);
    //     toast.error("Could not toggle video");
    //   }
    // },

    // 🖥️ Toggle screen sharing
    toggleLocalScreenShare: () => {
      const { localScreenStream, isScreenSharing, chatId } = get();
      const myMemberId = getMyChatMemberId(chatId!);
      const newScreenState = !isScreenSharing;

      if (!myMemberId || !localScreenStream) return;

      try {
        // Only toggle enabled state
        localScreenStream.getVideoTracks().forEach((track) => {
          track.enabled = newScreenState;
        });

        set({ isScreenSharing: newScreenState });

        // Notify other participants (UI/sync only)
        callWebSocketService.updateCallMember({
          chatId: chatId!,
          memberId: myMemberId,
          isScreenSharing: newScreenState,
        });
      } catch (err) {
        console.error("Error toggling screen share:", err);
      }
    },

    // // 🎥 Toggle video
    // toggleLocalVideo: async () => {
    //   const {
    //     localVideoStream,
    //     isVideoEnabled,
    //     chatId,
    //     isGroupCall,
    //     callMembers,
    //   } = get();
    //   const myMemberId = getMyChatMemberId(chatId!);

    //   if (!myMemberId) return;

    //   try {
    //     if (isVideoEnabled) {
    //       // Disable video - stop all video tracks
    //       if (localVideoStream) {
    //         localVideoStream.getTracks().forEach((track) => track.stop());
    //         set({ localVideoStream: null, isVideoEnabled: false });
    //       }
    //       // Notify other participants about video state change
    //       if (chatId) {
    //         callWebSocketService.updateCallMember({
    //           chatId,
    //           memberId: myMemberId,
    //           isVideoEnabled: false,
    //         });
    //       }
    //     } else {
    //       // Enable video - get new video stream
    //       const videoStream = await navigator.mediaDevices.getUserMedia({
    //         video: {
    //           width: { ideal: 1280 },
    //           height: { ideal: 720 },
    //           facingMode: "user",
    //         },
    //       });

    //       const newVideoStream = new MediaStream(videoStream.getVideoTracks());
    //       set({ localVideoStream: newVideoStream, isVideoEnabled: true });

    //       // Notify other participants
    //       if (chatId) {
    //         callWebSocketService.updateCallMember({
    //           chatId,
    //           memberId: myMemberId,
    //           isVideoEnabled: true,
    //         });
    //       }

    //       // CRITICAL: Re-negotiate connections for all members
    //       if (!isGroupCall) {
    //         for (const member of callMembers) {
    //           if (member.peerConnection) {
    //             const pc = member.peerConnection;

    //             // Remove existing video tracks
    //             const senders = pc.getSenders();
    //             for (const sender of senders) {
    //               if (sender.track?.kind === "video") {
    //                 pc.removeTrack(sender);
    //               }
    //             }

    //             // Add new video tracks
    //             newVideoStream.getTracks().forEach((track) => {
    //               pc.addTrack(track, newVideoStream);
    //             });

    //             // Re-negotiate by creating new offer
    //             try {
    //               const offer = await pc.createOffer({
    //                 offerToReceiveAudio: true,
    //                 offerToReceiveVideo: true,
    //               });

    //               await pc.setLocalDescription(offer);

    //               callWebSocketService.sendOffer({
    //                 chatId: chatId!,
    //                 offer,
    //               });
    //             } catch (error) {
    //               console.error(
    //                 "Error creating offer for renegotiation:",
    //                 error
    //               );
    //             }
    //           }
    //         }
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Error toggling video:", error);
    //     toast.error("Could not toggle video");
    //   }
    // },

    // // Toggle screen sharing
    // toggleLocalScreenShare: async () => {
    //   const { localScreenStream, chatId, isGroupCall, callMembers } = get();
    //   const myMemberId = getMyChatMemberId(chatId!);

    //   if (!myMemberId) return;

    //   try {
    //     if (localScreenStream) {
    //       // Stop screen sharing
    //       localScreenStream.getTracks().forEach((track) => track.stop());
    //       set({ localScreenStream: null, isScreenSharing: false });

    //       // Notify other participants about screen share state change
    //       if (chatId) {
    //         callWebSocketService.updateCallMember({
    //           chatId,
    //           memberId: myMemberId,
    //           isScreenSharing: false,
    //         });
    //       }
    //     } else {
    //       // Start screen sharing
    //       const screenStream = await navigator.mediaDevices.getDisplayMedia({
    //         video: true,
    //         audio: true,
    //       });

    //       set({ localScreenStream: screenStream, isScreenSharing: true });

    //       // Notify other participants about screen share state change
    //       if (chatId) {
    //         callWebSocketService.updateCallMember({
    //           chatId,
    //           memberId: myMemberId,
    //           isScreenSharing: true,
    //         });
    //       }

    //       // Handle when user stops sharing via browser UI
    //       screenStream.getTracks().forEach((track) => {
    //         track.onended = () => {
    //           get().toggleLocalScreenShare();
    //         };
    //       });

    //       // For direct calls, add screen share to peer connections
    //       if (!isGroupCall) {
    //         callMembers.forEach((member) => {
    //           if (member.peerConnection) {
    //             screenStream.getTracks().forEach((track) => {
    //               member.peerConnection!.addTrack(track, screenStream);
    //             });
    //           }
    //         });
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Error toggling screen share:", error);
    //     toast.error("Could not toggle screen sharing");
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

        const voiceStream = new MediaStream(stream.getAudioTracks());
        const videoStream = isVideoCall
          ? new MediaStream(stream.getVideoTracks())
          : null;

        set({
          localVoiceStream: voiceStream,
          localVideoStream: videoStream,
          isVideoEnabled: isVideoCall,
        });
      } catch (error) {
        console.error("Error accessing media devices:", error);
        throw error;
      }
    },

    // � Cleanup media streams
    cleanupStreams: () => {
      const {
        localVoiceStream,
        localVideoStream,
        localScreenStream,
        callMembers,
      } = get();

      // Clean up local streams
      [localVoiceStream, localVideoStream, localScreenStream].forEach(
        (stream) => {
          stream?.getTracks().forEach((track) => {
            track.stop();
            track.enabled = false;
          });
        }
      );

      // Clean up member streams
      callMembers.forEach((member) => {
        [member.voiceStream, member.videoStream, member.screenStream].forEach(
          (stream) => {
            stream?.getTracks().forEach((track) => {
              track.stop();
              track.enabled = false;
            });
          }
        );
      });

      set({
        localVoiceStream: null,
        localVideoStream: null,
        localScreenStream: null,
        error: null,
      });
    },

    // 🤝 Create WebRTC peer connection for direct calls
    createPeerConnection: (memberId: string) => {
      const { chatId, localVoiceStream, localVideoStream, localScreenStream } =
        get();

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Add TURN servers here if needed
        ],
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
      // In createPeerConnection, add this:
      pc.ontrack = (event) => {
        console.log("📡 Track event received:", {
          streams: event.streams?.length,
          track: event.track,
          trackKind: event.track?.kind,
          trackId: event.track?.id,
        });
        get().handleRemoteStream(memberId, event);
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
        callMembers: state.callMembers.map((member) =>
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

    removePeerConnection: (memberId: string) => {
      const { callMembers } = get();
      const member = callMembers.find((m) => m.memberId === memberId);

      if (member && member.peerConnection) {
        const pc = member.peerConnection;
        pc.getSenders().forEach((s) => s.track?.stop());
        pc.close();

        set((state) => ({
          callMembers: state.callMembers.map((m) =>
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

    // 📺 Handle incoming remote stream
    handleRemoteStream: (memberId: string, event: RTCTrackEvent) => {
      if (!event.track || !event.streams || event.streams.length === 0) {
        console.error("Received track event without stream!", event);
        return;
      }

      const kind = event.track.kind as "audio" | "video";
      console.log(`📡 Received ${kind} track from ${memberId}`, event.track);

      set((state) => {
        const member = state.callMembers.find((m) => m.memberId === memberId);
        if (!member) return state;

        // 🎤 AUDIO
        if (kind === "audio") {
          const voiceStream = member.voiceStream ?? new MediaStream();

          // only add if not already present
          if (!voiceStream.getTracks().some((t) => t.id === event.track.id)) {
            voiceStream.addTrack(event.track);
          }

          return {
            callMembers: state.callMembers.map((m) =>
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
              callMembers: state.callMembers.map((m) =>
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
              callMembers: state.callMembers.map((m) =>
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

    // handleRemoteStream: (memberId: string, event: RTCTrackEvent) => {
    //   toast.info('handleRemoteStream')
    //   console.log('handleRemoteStream')
    //   if (!event.track || !event.streams || event.streams.length === 0) {
    //     console.error("Received track event without stream!", event);
    //     return;
    //   }

    //   const kind = event.track.kind as "audio" | "video";
    //   console.log(`📡 Received ${kind} track from ${memberId}`, event.track);

    //   set((state) => {
    //     const member = state.callMembers.find((m) => m.memberId === memberId);
    //     if (!member) return state;

    //     // Handle audio and video separately - CRITICAL FIX:
    //     if (kind === "audio") {
    //       let voiceStream = member.voiceStream;

    //       if (!voiceStream) {
    //         voiceStream = new MediaStream();
    //       }

    //       // DON'T remove existing tracks! Just add the new one
    //       const existingTrack = voiceStream
    //         .getTracks()
    //         .find((t) => t.id === event.track.id);

    //       if (!existingTrack) {
    //         voiceStream.addTrack(event.track);
    //       }

    //       return {
    //         callMembers: state.callMembers.map((m) =>
    //           m.memberId === memberId
    //             ? { ...m, voiceStream, lastActivity: Date.now() }
    //             : m
    //         ),
    //       };
    //     } else {
    //       let videoStream = member.videoStream;

    //       if (!videoStream) {
    //         videoStream = new MediaStream();
    //       }

    //       // DON'T remove existing tracks!
    //       const existingTrack = videoStream
    //         .getTracks()
    //         .find((t) => t.id === event.track.id);

    //       if (!existingTrack) {
    //         videoStream.addTrack(event.track);
    //       }

    //       return {
    //         callMembers: state.callMembers.map((m) =>
    //           m.memberId === memberId
    //             ? { ...m, videoStream, lastActivity: Date.now() }
    //             : m
    //         ),
    //       };
    //     }
    //   });
    // },

    sendOffer: async (toMemberId) => {
      const { chatId, isGroupCall } = get();
      const myMemberId = getMyChatMemberId(chatId!);

      if (!myMemberId)
        throw new Error("Cannot send offer - no member ID found");
      if (!chatId)
        throw new Error("Cannot send offer - no active chat session");

      try {
        // For direct calls, create peer connection and send offer
        if (!isGroupCall) {
          const pc = get().createPeerConnection(toMemberId);
          console.log("Peer connection created");

          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          console.log("Offer created");

          await pc.setLocalDescription(offer);
          console.log("Local description set");

          callWebSocketService.sendOffer({
            chatId,
            offer,
          });
          console.log("Offer sent successfully");
        }

        set({ callStatus: CallStatus.CONNECTING });
      } catch (error) {
        handleError(error, "Failed to create/send offer");
        get().endCall();
        throw error;
      }
    },

    addIceCandidate: (candidate: RTCIceCandidateInit) => {
      const { callMembers, isGroupCall } = get();

      // Add to iceCandidates array for later use
      set((state) => ({
        iceCandidates: [...state.iceCandidates, candidate],
      }));

      // Try to add to all existing connections
      callMembers.forEach((member) => {
        if (isGroupCall && member.sfuConnection) {
          try {
            member.sfuConnection.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (error) {
            console.error("Error adding ICE candidate to SFU:", error);
          }
        } else if (!isGroupCall && member.peerConnection) {
          try {
            member.peerConnection.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (error) {
            console.error("Error adding ICE candidate to peer:", error);
          }
        }
      });
    },

    createSfuConnection: async () => {
      const { localVoiceStream, localVideoStream, localScreenStream, chatId } =
        get();

      if (!chatId) {
        throw new Error("No chatId available for SFU connection");
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
      });

      try {
        // Add local audio tracks
        if (localVoiceStream) {
          localVoiceStream.getTracks().forEach((track) => {
            if (!pc.getSenders().some((s) => s.track === track)) {
              pc.addTrack(track, localVoiceStream);
            }
          });
        }

        // Add local video tracks
        if (localVideoStream) {
          localVideoStream.getTracks().forEach((track) => {
            if (!pc.getSenders().some((s) => s.track === track)) {
              pc.addTrack(track, localVideoStream);
            }
          });
        }

        // Add local screen share tracks
        if (localScreenStream) {
          localScreenStream.getTracks().forEach((track) => {
            if (!pc.getSenders().some((s) => s.track === track)) {
              pc.addTrack(track, localScreenStream);
            }
          });
        }
      } catch (error) {
        console.error("Error adding tracks:", error);
        pc.close();
        throw error;
      }

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

      pc.ontrack = (event) => {
        if (!event.streams || event.streams.length === 0) return;

        const stream = event.streams[0];
        const kind = event.track.kind as "audio" | "video";
        const memberId = event.track.id.split("_")[0]; // Assuming track ID contains member ID

        set((state) => ({
          callMembers: state.callMembers.map((member) => {
            if (member.memberId === memberId) {
              if (kind === "audio") {
                return {
                  ...member,
                  voiceStream: stream,
                  lastActivity: Date.now(),
                };
              } else {
                return {
                  ...member,
                  videoStream: stream,
                  lastActivity: Date.now(),
                };
              }
            }
            return member;
          }),
        }));
      };

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
            set((state) => ({
              callMembers: state.callMembers.map((member) => ({
                ...member,
                sfuConnection: null,
              })),
            }));
            break;
        }
      };

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        await pc.setLocalDescription(offer);

        // Store SFU connection in state
        set((state) => ({
          callMembers: state.callMembers.map((member) => ({
            ...member,
            sfuConnection: pc,
          })),
        }));

        return offer;
      } catch (error) {
        console.error("Error creating offer:", error);
        pc.close();
        throw error;
      }
    },

    disconnectFromSfu: () => {
      set((state) => ({
        callMembers: state.callMembers.map((member) => {
          if (member.sfuConnection) {
            member.sfuConnection.close();
          }
          return {
            ...member,
            sfuConnection: null,
          };
        }),
      }));
    },

    getCallDuration: (): number => {
      const state = get();
      if (!state.startedAt) return 0;

      const endTime = state.endedAt || new Date();
      return Math.floor((endTime.getTime() - state.startedAt.getTime()) / 1000);
    },

    closeCallModal: () => {
      useModalStore.getState().closeModal();

      set({
        chatId: null,
        callStatus: null,
        isVideoCall: false,
        isGroupCall: false,
        callMembers: [],
        iceCandidates: [],
        localVoiceStream: null,
        localVideoStream: null,
        localScreenStream: null,
        error: null,
        isMuted: false,
        isVideoEnabled: false,
        isScreenSharing: false,
      });
    },

    getCallMember: (memberId: string): CallMember | undefined => {
      return get().callMembers.find((member) => member.memberId === memberId);
    },

    updateMemberActivity: (memberId: string) => {
      set((state) => ({
        callMembers: state.callMembers.map((member) =>
          member.memberId === memberId
            ? { ...member, lastActivity: Date.now() }
            : member
        ),
      }));
    },
  }))
);
