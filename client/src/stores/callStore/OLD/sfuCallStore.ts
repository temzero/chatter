// import { create } from "zustand";
// import { devtools } from "zustand/middleware";
// import { LiveKitService } from "@/services/liveKitService";
// import { useCallStore } from "./callStore";
// import { LocalCallStatus } from "@/types/enums/CallStatus";
// import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
// import { callService } from "@/services/callService";
// import { getMyChatMemberId } from "../chatMemberStore";
// import { toast } from "react-toastify";
// import { ModalType, useModalStore } from "../modalStore";
// import { handleError } from "@/utils/handleError";
// import { Room } from "livekit-client";
// import { CallStatus } from "@/types/enums/CallStatus";
// import { useMessageStore } from "../messageStore";
// import { getMyToken } from "./helpers/call.helper";

// export interface SFUState {
//   liveKitService: LiveKitService | null;
// }

// export interface SFUActions {
//   initializeSFUCall: (chatId: string, isVideoCall: boolean) => Promise<void>;
//   acceptSFUCall: () => Promise<void>;
//   rejectSFUCall: (isCancel?: boolean) => void;
//   connectToSFURoom: (url: string, token: string) => Promise<void>;
//   disconnectFromSFU: () => void;

//   getLiveKitRoom: () => Room | null;

//   // Media Controls
//   toggleAudio: (enable?: boolean) => Promise<void>;
//   toggleVideo: (enable?: boolean) => Promise<void>;
//   toggleScreenShare: (enable?: boolean) => Promise<void>;

//   // Clear state
//   clearSFUState: () => void;
// }

// export const useSFUCallStore = create<SFUState & SFUActions>()(
//   devtools((set, get) => ({
//     // ========== SFU STATE ==========
//     liveKitService: null,

//     // ========== SFU ACTIONS ==========
//     initializeSFUCall: async (chatId: string, isVideoCall: boolean) => {
//       toast.info(`initializeSFUCall, isVideoCall: ${isVideoCall}`);

//       try {
//         // 1. Update base store with necessary state (NO media streams yet)
//         useCallStore.setState({
//           isVideoEnabled: isVideoCall,
//           startedAt: new Date(),
//           chatId,
//           isVideoCall: isVideoCall,
//           localCallStatus: LocalCallStatus.OUTGOING,
//         });

//         // 2. OPEN MODAL
//         useModalStore.getState().openModal(ModalType.CALL);

//         // 3. Set timeout
//         const timeoutRef = setTimeout(() => {
//           const { localCallStatus } = useCallStore.getState();
//           if (localCallStatus === LocalCallStatus.OUTGOING) {
//             useCallStore.getState().endCall({ isTimeout: true });
//           }
//         }, 60000);

//         useCallStore.setState({ timeoutRef });

//         // 4. Initialize LiveKit service
//         const liveKitService = new LiveKitService();
//         set({ liveKitService });

//         // 5. Generate token for LiveKit room
//         const token = await getMyToken(chatId);
//         if (!token) return;

//         const url = import.meta.env.VITE_LIVEKIT_URL;

//         // 6. Connect to LiveKit SFU (LiveKit will handle media)
//         await get().connectToSFURoom(url, token);

//         // 7. AFTER SUCCESSFUL CONNECTION: send the call signal
//         callWebSocketService.initiateCall({
//           chatId,
//           isVideoCall: isVideoCall,
//           isGroupCall: true,
//         });
//       } catch (error) {
//         // Handle error locally
//         useCallStore.setState({
//           timeoutRef: null,
//           error: "sfu_init_failed",
//           localCallStatus: LocalCallStatus.ERROR,
//         });

//         // NEW: Update call status to FAILED if call was created
//         const { id: callId } = useCallStore.getState();
//         if (callId) {
//           try {
//             await callService.markCallAsFailed(callId);
//             if (chatId) {
//               useMessageStore.getState().updateCallMessage(chatId, callId, {
//                 status: CallStatus.FAILED,
//                 endedAt: new Date().toISOString(),
//               });
//             }
//           } catch (apiError) {
//             console.error("Failed to update call status to FAILED:", apiError);
//           }
//         }

//         toast.error(
//           "Permission denied! Please allow camera and microphone access."
//         );
//         throw error;
//       }
//     },

//     acceptSFUCall: async () => {
//       const { id: callId, chatId } = useCallStore.getState();

//       if (!callId || !chatId) {
//         console.error("Missing callId or chatId");
//         return;
//       }

//       try {
//         // Update base store
//         useCallStore.getState().setLocalCallStatus(LocalCallStatus.CONNECTING);

//         // Initialize LiveKit service
//         const liveKitService = new LiveKitService();
//         set({ liveKitService });

//         // Generate token for joining
//         const token = await getMyToken(chatId);
//         if (!token) return;

//         const url = import.meta.env.VITE_LIVEKIT_URL;

//         // Connect to SFU (LiveKit will handle media acquisition)
//         await get().connectToSFURoom(url, token);

//         // Send acceptance via WebSocket
//         callWebSocketService.acceptCall({
//           callId,
//           chatId,
//           isCallerCancel: false,
//         });

//         toast.success("Call accepted - connecting to SFU...");
//       } catch (error) {
//         handleError(error, "Could not connect to SFU");
//         if (chatId) {
//           callWebSocketService.rejectCall({ callId, chatId });
//         }
//         useCallStore.getState().setLocalCallStatus(LocalCallStatus.ERROR);
//       }
//     },

//     rejectSFUCall: (isCancel = false) => {
//       const { id: callId, chatId } = useCallStore.getState();

//       if (!chatId || !callId) {
//         console.error("No chatId found for rejecting call");
//         return;
//       }

//       try {
//         // Tell server we rejected the call
//         callWebSocketService.rejectCall({
//           callId,
//           chatId,
//           isCallerCancel: isCancel,
//         });
//         get().disconnectFromSFU();
//       } catch (error) {
//         console.error("Error rejecting call:", error);
//         toast.error("Failed to reject call. Please try again.");
//         useCallStore.getState().setLocalCallStatus(LocalCallStatus.ERROR);
//       }
//     },

//     connectToSFURoom: async (url: string, token: string) => {
//       const { liveKitService } = get();
//       const { isVideoCall } = useCallStore.getState();

//       if (!liveKitService) return;

//       try {
//         await liveKitService.connect(url, token, {
//           audio: true,
//           video: isVideoCall,
//           // Removed participant event handlers since we're accessing participants directly
//           onError: (error) => {
//             useCallStore.getState().setLocalCallStatus(LocalCallStatus.ERROR);
//             console.error("LiveKit connection error:", error);
//           },
//         });

//         // Update store with actual state from LiveKit
//         const localParticipant = liveKitService.getLocalParticipant();

//         useCallStore.setState({
//           isMuted: !localParticipant.isMicrophoneEnabled,
//           isVideoEnabled: localParticipant.isCameraEnabled,
//         });

//         // Set call as connected
//         useCallStore.getState().setLocalCallStatus(LocalCallStatus.CONNECTED);
//       } catch (error) {
//         console.error("Failed to connect to SFU room:", error);
//         useCallStore.getState().setLocalCallStatus(LocalCallStatus.ERROR);
//       }
//     },

//     disconnectFromSFU: () => {
//       const { liveKitService } = get();

//       // Clear timeout from call store
//       const { timeoutRef } = useCallStore.getState();
//       if (timeoutRef) {
//         clearTimeout(timeoutRef);
//         useCallStore.setState({ timeoutRef: null });
//       }

//       if (liveKitService) {
//         try {
//           // Disconnect from room
//           liveKitService.disconnect();
//         } catch (error) {
//           console.error("Error during SFU disconnect:", error);
//         } finally {
//           set({ liveKitService: null });
//         }
//       }
//     },

//     getLiveKitRoom: () => {
//       const { liveKitService } = get();
//       return liveKitService?.getRoom() || null;
//     },

//     // ========== MEDIA CONTROLS ==========
//     toggleAudio: async (enable?: boolean) => {
//       const { id: callId, chatId, isMuted } = useCallStore.getState();
//       const { liveKitService } = get();
//       const myMemberId = await getMyChatMemberId(chatId!);

//       if (!liveKitService || !callId || !chatId || !myMemberId) return;

//       const shouldUnmute = enable !== undefined ? enable : isMuted;

//       try {
//         if (shouldUnmute) {
//           await liveKitService.toggleAudio(true);
//           useCallStore.setState({ isMuted: false });
//         } else {
//           await liveKitService.toggleAudio(false);
//           useCallStore.setState({ isMuted: true });
//         }
//       } catch (error) {
//         console.error("Error in toggleAudio:", error);
//         useCallStore.setState({ isMuted: true });
//       }
//     },

//     toggleVideo: async (enable?: boolean) => {
//       const { id: callId, chatId, isVideoEnabled } = useCallStore.getState();
//       const { liveKitService } = get();
//       const myMemberId = await getMyChatMemberId(chatId!);

//       if (!liveKitService || !callId || !chatId || !myMemberId) return;

//       const shouldTurnOn = enable !== undefined ? enable : !isVideoEnabled;

//       try {
//         if (shouldTurnOn) {
//           await liveKitService.toggleVideo(true);
//           useCallStore.setState({ isVideoEnabled: true });
//         } else {
//           await liveKitService.toggleVideo(false);
//           useCallStore.setState({ isVideoEnabled: false });
//         }
//       } catch (error) {
//         console.error("Error in toggleVideo (SFU):", error);
//         useCallStore.setState({ isVideoEnabled: false });
//       }
//     },

//     toggleScreenShare: async (enable?: boolean) => {
//       const { liveKitService } = get();
//       const { id: callId, chatId, isScreenSharing } = useCallStore.getState();
//       const myMemberId = await getMyChatMemberId(chatId!);

//       if (!liveKitService || !callId || !chatId || !myMemberId) return;

//       const shouldStart = enable !== undefined ? enable : !isScreenSharing;

//       try {
//         if (shouldStart) {
//           await liveKitService.toggleScreenShare(true);
//           useCallStore.setState({ isScreenSharing: true });
//         } else {
//           await liveKitService.toggleScreenShare(false);
//           useCallStore.setState({ isScreenSharing: false });
//         }
//       } catch (error) {
//         console.error("Error toggling screen share:", error);
//         useCallStore.setState({ isScreenSharing: false });
//       }
//     },

//     // ========== CLEANUP METHODS ==========
//     clearSFUState: () => {
//       const { liveKitService } = get();

//       // Disconnect from SFU
//       if (liveKitService) {
//         try {
//           liveKitService.disconnect();
//         } catch (err) {
//           console.error("Error disconnecting SFU:", err);
//         }
//       }

//       // Reset store state
//       set({
//         liveKitService: null,
//       });
//     },
//   }))
// );
