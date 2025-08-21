// // stores/callStore.ts
// import { create } from "zustand";
// import { devtools } from "zustand/middleware";
// import { ModalType } from "@/types/enums/modalType";
// import { CallStatus } from "@/types/enums/CallStatus";
// import { useModalStore } from "@/stores/modalStore";
// import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
// import { toast } from "react-toastify";
// import { handleError } from "@/utils/handleError";
// import { getMyChatMemberId } from "./chatMemberStore";

// interface CallMember {
//   memberId: string; // memberId
//   isMuted: boolean;
//   isVideoEnable: boolean;
//   isSpeaking?: boolean; // useful for active speaker UI
// }

// interface CallStoreState {
//   chatId: string | null; // The chat this call belongs to
//   callStatus: CallStatus | null; // ringing | connected | ended | etc.
//   startedAt?: Date;
//   endedAt?: Date;
//   callerMemberId?: string; // memberId of caller
//   timeoutRef?: NodeJS.Timeout; // internal only (not serializable)
//   isVideoCall: boolean;

//   // myMember
//   isMuted: boolean;
//   isVideoEnable: boolean;

//   // other members
//   callMembers: CallMember[];
//   iceCandidates: RTCIceCandidateInit[];

//   // media connections
//   localStream: MediaStream | null; // This user's mic/cam
//   peerConnections: Record<string, RTCPeerConnection>; // P2P connections
//   remoteStreams: Record<string, MediaStream>; // Per memberId
//   sfuConnection?: RTCPeerConnection | null; // If SFU is used
//   sfuStreams?: { audio?: MediaStream; video?: MediaStream };

//   error?: "permission_denied" | "device_unavailable" | null;
// }

// interface CallStoreActions {
//   // Core lifecycle
//   startCall: (chatId: string, isVideo: boolean) => Promise<void>;
//   acceptCall: () => Promise<void>;
//   rejectCall: (isCancel?: boolean) => void;
//   addCallMember: (member: CallMember) => void;
//   removeCallMember: (memberId: string) => void;
//   endCall: (option?: { isCancel?: boolean; isRejected?: boolean }) => void;

//   // Status / Type
//   setStatus: (status: CallStatus) => void;
//   switchType: () => Promise<void>;

//   // Media toggles
//   toggleMute: () => void;
//   toggleVideo: () => Promise<void>;

//   // Media setup/cleanup
//   setupLocalStream: () => Promise<void>;
//   cleanupStreams: () => void;
//   createPeerConnection: (memberId: string) => RTCPeerConnection;
//   removePeerConnection: (memberId: string) => void;
//   handleRemoteStream: (memberId: string, event: RTCTrackEvent) => void;
//   createSfuConnection: () => Promise<RTCSessionDescriptionInit>;
//   disconnectFromSfu: () => void;

//   // Socket handlers
//   sendOffer: (toMemberId: string) => Promise<void>;
//   addIceCandidate: (candidate: RTCIceCandidateInit) => void;

//   // Utilities
//   getCallDuration: () => number;
//   closeCallModal: () => void;
// }

// export type CallStore = CallStoreState & CallStoreActions;

// export const useCallStore = create<CallStore>()(
//   devtools((set, get) => ({
//     // Initial state
//     chatId: null,
//     callStatus: null,
//     isVideoCall: false,
//     isMuted: false,
//     isVideoEnable: false,
//     callMembers: [],
//     iceCandidates: [],

//     // Flattened media state
//     localStream: null,
//     remoteStreams: {},
//     peerConnections: {},
//     sfuConnection: null,
//     sfuStreams: {},

//     error: null,

//     // 📞 Start Call with media setup
//     startCall: async (chatId, isVideo) => {
//       try {
//         // 1. Request media permissions
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: true,
//           video: isVideo,
//         });

//         // 2. Save stream to state
//         set({
//           localStream: stream,
//           chatId,
//           callStatus: CallStatus.OUTGOING,
//           isVideoCall: isVideo,
//         });

//         // 3. Use openCall to open the modal and set basic call state
//         useModalStore.getState().openModal(ModalType.CALL);

//         // 4. Set timeout to automatically end call after 1 minute
//         const timeoutRef = setTimeout(() => {
//           const { callStatus } = get();
//           // Only end if still in outgoing state (not answered)
//           if (callStatus === CallStatus.OUTGOING) {
//             get().rejectCall(true);
//           }
//         }, 60000); // 60 seconds = 1 minute

//         set({ timeoutRef });

//         // 5. Initiate WebRTC connection
//         callWebSocketService.initiateCall({
//           chatId,
//           isVideoCall: isVideo,
//         });
//       } catch (error) {
//         useModalStore.getState().closeModal();
//         console.error("Permission denied:", error);
//         get().cleanupStreams();
//         set({
//           error: "permission_denied",
//           callStatus: CallStatus.ERROR,
//         });
//         toast.error(
//           "Permission denied! Please allow camera and microphone access."
//         );
//       }
//     },

//     acceptCall: async () => {
//       const { isVideoCall, chatId, localStream } = get();

//       try {
//         // 1. Clean up any existing stream first
//         if (localStream) {
//           localStream.getTracks().forEach((track) => track.stop());
//         }

//         // 2. Get fresh media stream
//         const stream = await navigator.mediaDevices
//           .getUserMedia({
//             audio: {
//               echoCancellation: true,
//               noiseSuppression: true,
//             },
//             video: isVideoCall
//               ? {
//                   width: { ideal: 1280 },
//                   height: { ideal: 720 },
//                   facingMode: "user",
//                 }
//               : false,
//           })
//           .catch(async (error) => {
//             if (error.name === "NotReadableError") {
//               toast.warning("Device in use. Trying alternative settings...");
//               return await navigator.mediaDevices.getUserMedia({
//                 audio: true,
//                 video: isVideoCall ? true : false,
//               });
//             }
//             throw error;
//           });

//         // 3. Set stream in state
//         set({
//           localStream: stream,
//           callStatus: CallStatus.CONNECTING,
//         });

//         // 4. Send acceptance via WebSocket
//         if (chatId) {
//           callWebSocketService.acceptCall({
//             chatId,
//             isCallerCancel: false,
//           });
//         }

//         toast.success("Call accepted - waiting for connection...");
//       } catch (error) {
//         handleError(error, "Could not start media devices");

//         // Send rejection if media setup fails
//         if (chatId) {
//           callWebSocketService.rejectCall({
//             chatId,
//           });
//         }

//         set({
//           error: "device_unavailable",
//           callStatus: CallStatus.ERROR,
//         });
//       }
//     },

//     rejectCall: (isCancel = false) => {
//       const { chatId } = get();

//       if (!chatId) {
//         console.error("No chatId found for rejecting call");
//         return;
//       }

//       try {
//         // Tell server we rejected the call
//         callWebSocketService.rejectCall({ chatId, isCallerCancel: isCancel });

//         // Close modal and clean up
//         get().endCall({ isCancel, isRejected: true });
//       } catch (error) {
//         console.error("Error rejecting call:", error);
//         toast.error("Failed to reject call. Please try again.");
//         set({
//           error: "device_unavailable",
//           callStatus: CallStatus.ERROR,
//         });
//       }
//     },

//     addCallMember: (member: CallMember) => {
//       const { localStream, iceCandidates } = get();

//       // 1. Create peer connection for the new member
//       const pc = get().createPeerConnection(member.memberId);

//       // 2. Add any pending ICE candidates to the new connection
//       iceCandidates.forEach((candidate) => {
//         try {
//           pc.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (error) {
//           console.error("Error adding ICE candidate to new member:", error);
//         }
//       });

//       // 3. Add local stream tracks to the new connection
//       if (localStream) {
//         localStream.getTracks().forEach((track) => {
//           if (!pc.getSenders().some((s) => s.track === track)) {
//             pc.addTrack(track, localStream);
//           }
//         });
//       }

//       // 4. Initialize remote stream for the new member
//       set((state) => ({
//         callMembers: [...state.callMembers, member],
//         remoteStreams: {
//           ...state.remoteStreams,
//           [member.memberId]: new MediaStream(), // Initialize empty stream
//         },
//       }));

//       console.log(`Member ${member.memberId} added to call`);

//       // 5. If this is the first member joining, update call status
//       const currentMembers = get().callMembers;
//       if (
//         currentMembers.length === 1 &&
//         get().callStatus === CallStatus.CONNECTING
//       ) {
//         set({ callStatus: CallStatus.CONNECTED });
//       }
//     },

//     removeCallMember: (memberId: string) => {
//       const { peerConnections, remoteStreams } = get();

//       // 1. Close the peer connection for this member
//       if (peerConnections[memberId]) {
//         peerConnections[memberId].close();
//         set((state) => {
//           // eslint-disable-next-line @typescript-eslint/no-unused-vars
//           const { [memberId]: _, ...remainingConnections } =
//             state.peerConnections;
//           return {
//             peerConnections: remainingConnections,
//           };
//         });
//       }

//       // 2. Clean up their remote stream
//       if (remoteStreams[memberId]) {
//         remoteStreams[memberId].getTracks().forEach((track) => track.stop());
//         set((state) => {
//           // eslint-disable-next-line @typescript-eslint/no-unused-vars
//           const { [memberId]: _, ...remainingStreams } = state.remoteStreams;
//           return {
//             remoteStreams: remainingStreams,
//           };
//         });
//       }

//       // 3. Remove from members list
//       set({
//         callMembers: get().callMembers.filter((m) => m.memberId !== memberId),
//       });
//       console.log(`Member ${memberId} removed from call`);

//       // If no one left, end the call
//       const remaining = get().callMembers;
//       if (remaining.length === 0) {
//         get().endCall();
//       }
//     },

//     // 🛑 End Call: cleanup everything
//     endCall: (option) => {
//       const { isCancel = false, isRejected = false } = option ?? {};
//       const {
//         localStream,
//         remoteStreams,
//         peerConnections,
//         sfuConnection,
//         sfuStreams,
//         timeoutRef,
//         callStatus,
//       } = get();

//       // Clear the timeout if it exists
//       if (timeoutRef) {
//         clearTimeout(timeoutRef);
//       }

//       if (
//         callStatus === CallStatus.ENDED ||
//         callStatus === CallStatus.CANCELED ||
//         callStatus === CallStatus.REJECTED
//       ) {
//         return;
//       }

//       // Helper to stop tracks
//       const stopAllTracks = (stream: MediaStream | null | undefined) => {
//         if (!stream) return;
//         stream.getTracks().forEach((track) => {
//           track.stop();
//           track.enabled = false;
//         });
//       };

//       stopAllTracks(localStream);
//       Object.values(remoteStreams).forEach(stopAllTracks);

//       Object.values(peerConnections).forEach((pc) => {
//         pc.ontrack = null;
//         pc.onicecandidate = null;
//         pc.oniceconnectionstatechange = null;
//         if (pc.connectionState !== "closed") {
//           pc.close();
//         }
//       });

//       if (sfuConnection) {
//         sfuConnection.close();
//       }
//       if (sfuStreams) {
//         Object.values(sfuStreams).forEach(stopAllTracks);
//       }

//       set({
//         callStatus: isCancel
//           ? CallStatus.CANCELED
//           : isRejected
//           ? CallStatus.REJECTED
//           : CallStatus.ENDED,
//         endedAt: new Date(),
//         callMembers: [],
//         iceCandidates: [],
//         localStream: null,
//         remoteStreams: {},
//         peerConnections: {},
//         sfuConnection: null,
//         sfuStreams: {},
//         error: null,
//       });
//     },

//     setStatus: (callStatus: CallStatus) => {
//       set({ callStatus });
//     },

//     // 🎤 Toggle audio mute
//     toggleMute: () => {
//       const { localStream, isMuted } = get();
//       if (localStream) {
//         localStream.getAudioTracks().forEach((track) => {
//           track.enabled = isMuted; // if muted=true → enable again
//         });
//         set({ isMuted: !isMuted }); // toggle UI state
//       }
//     },

//     // 🎥 Toggle video
//     toggleVideo: async () => {
//       const { localStream, peerConnections, isVideoCall } = get();

//       if (!localStream) return;

//       const videoTracks = localStream.getVideoTracks();

//       if (videoTracks.length > 0) {
//         // Toggle existing video tracks
//         videoTracks.forEach((track) => {
//           track.enabled = !track.enabled;
//         });
//       } else if (isVideoCall) {
//         // Add video if it's a video call but no video tracks exist
//         try {
//           const videoStream = await navigator.mediaDevices.getUserMedia({
//             video: {
//               width: { ideal: 1280 },
//               height: { ideal: 720 },
//               facingMode: "user",
//             },
//           });

//           videoStream.getVideoTracks().forEach((track) => {
//             localStream.addTrack(track);
//           });

//           // Update all peer connections
//           Object.values(peerConnections).forEach((pc) => {
//             if (pc) {
//               videoStream.getVideoTracks().forEach((track) => {
//                 pc.addTrack(track, localStream);
//               });
//             }
//           });
//         } catch (error) {
//           console.error("Error enabling video:", error);
//           toast.error("Could not enable video");
//         }
//       }
//     },

//     // 🎥 Setup local media stream
//     setupLocalStream: async () => {
//       const { isVideoCall } = get();

//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: true,
//           video: isVideoCall
//             ? {
//                 width: { ideal: 1280 },
//                 height: { ideal: 720 },
//                 facingMode: "user",
//               }
//             : false,
//         });

//         set({
//           localStream: stream,
//         });
//       } catch (error) {
//         console.error("Error accessing media devices:", error);
//         throw error;
//       }
//     },

//     // � Cleanup media streams
//     cleanupStreams: () => {
//       const { localStream, remoteStreams } = get();

//       [localStream, ...Object.values(remoteStreams)].forEach((stream) => {
//         stream?.getTracks().forEach((track) => {
//           track.stop();
//           track.enabled = false;
//         });
//       });

//       set({
//         localStream: null,
//         remoteStreams: {},
//         error: null,
//       });
//     },

//     // 🤝 Create WebRTC peer connection
//     createPeerConnection: (memberId: string) => {
//       const { chatId, localStream } = get();

//       const pc = new RTCPeerConnection({
//         iceServers: [
//           { urls: "stun:stun.l.google.com:19302" },
//           // Add TURN servers here if needed
//         ],
//       });

//       // ICE Candidate Handling
//       pc.onicecandidate = (event) => {
//         if (event.candidate && chatId) {
//           callWebSocketService.sendIceCandidate({
//             chatId,
//             candidate: event.candidate.toJSON(),
//           });
//         }
//       };

//       // Track Handling
//       pc.ontrack = (event) => {
//         get().handleRemoteStream(memberId, event);
//       };

//       // Connection Monitoring
//       pc.onconnectionstatechange = () => {
//         switch (pc.connectionState) {
//           case "connected":
//             console.log(`✅ Peer ${memberId} connected`);
//             break;
//           case "disconnected":
//             console.warn(`⚠️ Peer ${memberId} disconnected`);
//             break;
//           case "failed":
//             console.error(`❌ Peer ${memberId} failed`);
//             break;
//           case "closed":
//             console.log(`🔒 Peer ${memberId} closed`);
//             break;
//         }
//       };

//       // Add local media
//       if (localStream) {
//         localStream.getTracks().forEach((track) => {
//           if (!pc.getSenders().some((s) => s.track === track)) {
//             pc.addTrack(track, localStream);
//           }
//         });
//       }

//       // Store connection
//       set((state) => ({
//         peerConnections: { ...state.peerConnections, [memberId]: pc },
//       }));

//       return pc;
//     },

//     removePeerConnection: (memberId: string) => {
//       const { peerConnections } = get();
//       const pc = peerConnections[memberId];

//       if (pc) {
//         pc.getSenders().forEach((s) => s.track?.stop());
//         pc.close();
//         set((state) => {
//           // eslint-disable-next-line @typescript-eslint/no-unused-vars
//           const { [memberId]: _, ...rest } = state.peerConnections;
//           return {
//             peerConnections: rest,
//           };
//         });
//       }
//     },

//     // 📺 Handle incoming remote stream
//     handleRemoteStream: (memberId: string, event: RTCTrackEvent) => {
//       set((state) => {
//         if (!event.track) {
//           console.error("Received track event without track!", event);
//           return state;
//         }

//         // 1. Get or create stream
//         let stream = state.remoteStreams[memberId];
//         if (!stream) {
//           stream = new MediaStream();
//           console.log(`Created new stream for ${memberId}`);
//         }

//         // 2. Avoid duplicate tracks
//         const existingTrack = stream
//           .getTracks()
//           .find((t) => t.id === event.track.id);
//         if (existingTrack) {
//           console.warn(`Duplicate ${event.track.kind} track from ${memberId}`);
//           return state;
//         }

//         // 3. Add track
//         stream.addTrack(event.track);
//         console.log(`Added ${event.track.kind} track to ${memberId}'s stream`);

//         // 4. Track lifecycle updates
//         const updateMemberFromStream = (s: typeof state, st: MediaStream) => {
//           const hasAudioTrack = st.getAudioTracks().some((t) => t.enabled);
//           const hasVideoTrack = st.getVideoTracks().some((t) => t.enabled);

//           return s.callMembers.map((m) =>
//             m.memberId === memberId
//               ? { ...m, isMuted: !hasAudioTrack, isVideoEnable: hasVideoTrack }
//               : m
//           );
//         };

//         event.track.onmute = () => {
//           console.log(`Track ${event.track.id} muted`);
//           set((s) => ({
//             callMembers: updateMemberFromStream(s, s.remoteStreams[memberId]),
//           }));
//         };

//         event.track.onunmute = () => {
//           console.log(`Track ${event.track.id} active`);
//           set((s) => ({
//             callMembers: updateMemberFromStream(s, s.remoteStreams[memberId]),
//           }));
//         };

//         event.track.onended = () => {
//           console.log(`Track ${event.track.id} ended`);
//           set((s) => {
//             const newStream = new MediaStream(
//               s.remoteStreams[memberId]
//                 ?.getTracks()
//                 .filter((t) => t.id !== event.track.id) || []
//             );
//             return {
//               remoteStreams: {
//                 ...s.remoteStreams,
//                 [memberId]: newStream,
//               },
//               callMembers: updateMemberFromStream(s, newStream),
//             };
//           });
//         };

//         // 5. Return updated state
//         return {
//           ...state,
//           remoteStreams: {
//             ...state.remoteStreams,
//             [memberId]: stream,
//           },
//           callMembers: state.callMembers.some((m) => m.memberId === memberId)
//             ? updateMemberFromStream(state, stream)
//             : [
//                 ...state.callMembers,
//                 {
//                   memberId,
//                   isMuted: stream.getAudioTracks().length === 0,
//                   isVideoEnable: stream.getVideoTracks().length > 0,
//                   isSpeaking: false,
//                 },
//               ],
//         };
//       });
//     },

//     // 🔄 Switch between video/voice
//     switchType: async () => {
//       const { chatId, localStream, peerConnections, isVideoCall } = get();
//       const newType = !isVideoCall;

//       try {
//         // 1. Stop all existing video tracks if switching to audio
//         if (!newType && localStream) {
//           localStream.getVideoTracks().forEach((track) => track.stop());
//         }

//         // 2. For video calls, get new media stream
//         if (newType) {
//           const currentAudioTracks = localStream?.getAudioTracks() || [];

//           // Get new video stream
//           const videoStream = await navigator.mediaDevices
//             .getUserMedia({
//               video: {
//                 width: { ideal: 1280 },
//                 height: { ideal: 720 },
//                 facingMode: "user",
//               },
//             })
//             .catch((error) => {
//               console.error("Camera access error:", error);
//               throw new Error("Could not access camera");
//             });

//           // Create new combined stream
//           const newStream = new MediaStream([
//             ...currentAudioTracks,
//             ...videoStream.getVideoTracks(),
//           ]);

//           // 3. Update all peer connections
//           Object.values(peerConnections).forEach((pc) => {
//             if (!pc) return;

//             // Remove all existing tracks
//             pc.getSenders().forEach((sender) => {
//               if (sender.track) {
//                 pc.removeTrack(sender);
//               }
//             });

//             // Add new tracks
//             newStream.getTracks().forEach((track) => {
//               pc.addTrack(track, newStream);
//             });
//           });

//           // 4. Update state
//           set({
//             localStream: newStream,
//             isVideoCall: newType,
//           });
//         } else {
//           // Audio-only mode - just update state
//           set({ isVideoCall: newType });
//         }

//         // Notify other members
//         if (chatId) {
//           callWebSocketService.updateCallType({
//             chatId,
//             isVideoCall: newType,
//           });
//         }
//       } catch (error) {
//         console.error("Error switching call type:", error);
//         // Revert to previous state if error occurs
//         set({ isVideoCall });
//         throw error;
//       }
//     },

//     sendOffer: async (toMemberId) => {
//       // 1. Verify member ID exists
//       const { chatId } = get();

//       const myMemberId = getMyChatMemberId(chatId!);
//       if (!myMemberId)
//         throw new Error("Cannot send offer - no member ID found");

//       // 2. Get current state
//       const { localStream, peerConnections } = get();
//       console.log("Creating call offer..."); // First console.log to track flow

//       if (!chatId)
//         throw new Error("Cannot send offer - no active chat session");

//       try {
//         // 3. Create or reuse peer connection
//         const pc =
//           peerConnections[toMemberId] || get().createPeerConnection(toMemberId);
//         console.log("Peer connection created"); // Second console.log

//         // 4. Add local streams if they exist
//         if (localStream) {
//           localStream.getTracks().forEach((track) => {
//             if (!pc.getSenders().some((s) => s.track === track)) {
//               pc.addTrack(track, localStream);
//             }
//           });
//           console.log("Local tracks added to peer connection"); // Third console.log
//         }

//         // 5. Create and send offer
//         const offer = await pc.createOffer({
//           offerToReceiveAudio: true,
//           offerToReceiveVideo: true,
//         });
//         console.log("Offer created"); // Fourth console.log

//         await pc.setLocalDescription(offer);
//         console.log("Local description set"); // Fifth console.log

//         callWebSocketService.sendOffer({
//           chatId,
//           offer,
//         });
//         console.log("Offer sent successfully"); // Final toast

//         set({ callStatus: CallStatus.CONNECTING });
//       } catch (error) {
//         handleError(error, "Failed to create/send offer");
//         get().endCall();
//         throw error;
//       }
//     },

//     addIceCandidate: (candidate: RTCIceCandidateInit) => {
//       const { peerConnections, sfuConnection } = get();

//       // Add to iceCandidates array for later use when peer connections are established
//       set((state) => ({
//         iceCandidates: [...state.iceCandidates, candidate],
//       }));

//       // Try to add to all existing peer connections
//       Object.values(peerConnections).forEach((pc) => {
//         try {
//           pc.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (error) {
//           console.error("Error adding ICE candidate:", error);
//         }
//       });

//       // Try to add to SFU connection if exists
//       if (sfuConnection) {
//         try {
//           sfuConnection.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (error) {
//           console.error("Error adding ICE candidate to SFU:", error);
//         }
//       }
//     },

//     createSfuConnection: async () => {
//       const { localStream, chatId } = get();

//       if (!chatId) {
//         throw new Error("No chatId available for SFU connection");
//       }

//       // 1. Create peer connection with proper error handling
//       const pc = new RTCPeerConnection({
//         iceServers: [
//           { urls: "stun:stun.l.google.com:19302" },
//           // Add TURN servers here if needed:
//           // { urls: "turn:your-turn-server.com", username: "user", credential: "pass" }
//         ],
//         bundlePolicy: "max-bundle",
//         rtcpMuxPolicy: "require",
//       });

//       // 2. Add local stream tracks with cleanup guard
//       try {
//         if (localStream) {
//           localStream.getTracks().forEach((track) => {
//             // Prevent duplicate track addition
//             if (
//               !pc.getSenders().some((s) => s.track === track) &&
//               localStream
//             ) {
//               // Add the track with the local stream (not null)
//               pc.addTrack(track, localStream);
//             }
//           });
//         }
//       } catch (error) {
//         console.error("Error adding tracks:", error);
//         pc.close();
//         throw error;
//       }

//       // 3. ICE candidate handling with null check
//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           try {
//             callWebSocketService.sendIceCandidate({
//               chatId,
//               candidate: event.candidate.toJSON(),
//             });
//           } catch (error) {
//             console.error("Error sending ICE candidate:", error);
//           }
//         }
//       };

//       // 4. Handle incoming tracks with stream management
//       pc.ontrack = (event) => {
//         if (!event.streams || event.streams.length === 0) return;

//         const kind = event.track.kind as "audio" | "video";
//         set((state) => {
//           const sfuStreams = { ...state.sfuStreams };

//           // Create stream if doesn't exist
//           if (!sfuStreams[kind]) {
//             sfuStreams[kind] = new MediaStream();
//           }

//           // Add track if not already present
//           if (
//             sfuStreams[kind] &&
//             !sfuStreams[kind]!.getTracks().some((t) => t.id === event.track.id)
//           ) {
//             sfuStreams[kind]!.addTrack(event.track);
//           }

//           return {
//             sfuStreams,
//           };
//         });
//       };

//       // 5. Enhanced connection state monitoring
//       pc.onconnectionstatechange = () => {
//         const connectionState = pc.connectionState;
//         console.log("SFU connection state:", connectionState);

//         switch (connectionState) {
//           case "connected":
//             set({ callStatus: CallStatus.CONNECTED });
//             break;
//           case "disconnected":
//           case "failed":
//             get().disconnectFromSfu();
//             break;
//           case "closed":
//             set({
//               sfuConnection: null,
//             });
//             break;
//         }
//       };

//       // 6. Offer creation with proper error handling
//       try {
//         const offer = await pc.createOffer({
//           offerToReceiveAudio: true,
//           offerToReceiveVideo: true,
//         });

//         await pc.setLocalDescription(offer);

//         // Store connection with cleanup reference
//         set((state) => ({
//           sfuConnection: pc,
//           peerConnections: {
//             ...state.peerConnections,
//             sfu: pc,
//           },
//         }));

//         return offer;
//       } catch (error) {
//         console.error("Error creating offer:", error);
//         pc.close();
//         throw error;
//       }
//     },
//     disconnectFromSfu: () => {
//       const { sfuConnection, sfuStreams } = get();

//       if (sfuConnection) {
//         sfuConnection.close();
//       }

//       // Clean up SFU streams
//       if (sfuStreams) {
//         Object.values(sfuStreams).forEach((stream) => {
//           stream?.getTracks().forEach((track) => track.stop());
//         });
//       }

//       set((state) => ({
//         sfuConnection: null,
//         sfuStreams: {},
//         // Remove from peerConnections if needed
//         peerConnections: Object.fromEntries(
//           Object.entries(state.peerConnections).filter(([key]) => key !== "sfu")
//         ),
//       }));
//     },

//     getCallDuration: (): number => {
//       const state = get();
//       if (!state.startedAt) return 0;

//       const endTime = state.endedAt || new Date();
//       return Math.floor((endTime.getTime() - state.startedAt.getTime()) / 1000);
//     },

//     closeCallModal: () => {
//       // Close the modal first to provide immediate feedback
//       useModalStore.getState().closeModal();

//       // Additional cleanup if needed
//       set({
//         chatId: null,
//         callStatus: null,
//         isVideoCall: false,
//         callMembers: [],
//         iceCandidates: [],
//         localStream: null,
//         remoteStreams: {},
//         peerConnections: {},
//         sfuConnection: null,
//         sfuStreams: {},
//         error: null,
//       });
//     },
//   }))
// );
