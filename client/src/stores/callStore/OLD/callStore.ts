// // stores/call/useCallStore.ts
// import { create } from "zustand";
// import { devtools } from "zustand/middleware";
// import { useSFUCallStore } from "./sfuCallStore";
// import { useModalStore } from "../modalStore";
// import { audioService } from "@/services/audio.service";
// import { useMessageStore } from "../messageStore";
// import { CallStatus, LocalCallStatus } from "@/types/enums/CallStatus";
// import { callService } from "@/services/callService";

// export interface CallState {
//   id: string | null;
//   chatId: string | null;
//   // Call metadata
//   initiatorMemberId?: string;
//   localCallStatus: LocalCallStatus | null;
//   isVideoCall: boolean;
//   isGroupCall: boolean;
//   timeoutRef?: NodeJS.Timeout | null;
//   startedAt?: Date;
//   endedAt?: Date;

//   // Local device states
//   isMuted: boolean;
//   isVideoEnabled: boolean;
//   isScreenSharing: boolean;

//   // Error handling
//   error?:
//     | "permission_denied"
//     | "device_unavailable"
//     | "connection_failed"
//     | "sfu_init_failed"
//     | null;
// }

// export interface CallActions {
//   // Core lifecycle
//   startCall: (
//     chatId: string,
//     option?: {
//       isVideoCall?: boolean;
//       isGroupCall?: boolean;
//     }
//   ) => Promise<void>;
//   acceptCall: () => Promise<void>;
//   rejectCall: (isCancel?: boolean) => void;
//   endCall: (option?: {
//     isCancel?: boolean;
//     isRejected?: boolean;
//     isTimeout?: boolean;
//   }) => void;

//   // Media toggles
//   toggleLocalVoice: () => void;
//   toggleLocalVideo: () => Promise<void>;
//   toggleLocalScreenShare: () => Promise<void>;

//   setIsMuted: (isMuted: boolean) => void;
//   setIsVideoEnable: (isVideoEnabled: boolean) => void;
//   setIsScreenSharing: (isScreenSharing: boolean) => void;

//   // Utilities
//   setLocalCallStatus: (status: LocalCallStatus) => void;
//   getCallDuration: () => number;
//   closeCallModal: () => void;
// }

// export const useCallStore = create<CallState & CallActions>()(
//   devtools((set, get) => ({
//     // ========== CORE STATE ==========
//     id: null,
//     chatId: null,
//     localCallStatus: null,
//     isVideoCall: false,
//     isGroupCall: false,
//     isMuted: false,
//     isVideoEnabled: false,
//     isScreenSharing: false,
//     error: null,

//     // ========== CORE ACTIONS ==========
//     startCall: async (
//       chatId: string,
//       option?: {
//         isVideoCall?: boolean;
//         isGroupCall?: boolean;
//       }
//     ) => {
//       const isVideoCall = option?.isVideoCall ?? false;
//       const isGroupCall = option?.isGroupCall ?? false;
//       try {
//         await useSFUCallStore.getState().initializeSFUCall(chatId, isVideoCall);

//         set({
//           chatId,
//           isVideoCall,
//           isGroupCall,
//           localCallStatus: LocalCallStatus.OUTGOING,
//         });
//       } catch (error) {
//         console.error("Failed to start call:", error);
//         set({ error: "connection_failed" });
//         audioService.stopAllSounds();

//         const { id } = get();
//         if (id) {
//           callService.markCallAsFailed(id);
//         }
//       }
//     },

//     acceptCall: async () => {
//       try {
//         await useSFUCallStore.getState().acceptSFUCall();

//         const startedAt = new Date();
//         set({
//           localCallStatus: LocalCallStatus.CONNECTED,
//           startedAt,
//         });
//       } catch (err) {
//         console.error("Failed to accept call:", err);
//         set({ error: "device_unavailable" });
//         get().endCall({ isCancel: false });
//       }
//     },

//     rejectCall: (isCancel = false) => {
//       const { chatId, id } = get();

//       useSFUCallStore.getState().rejectSFUCall(isCancel);

//       if (chatId && id) {
//         if (isCancel) {
//           // Caller cancels → delete the system call message
//           useMessageStore.getState().deleteMessage(chatId, id);
//         } else {
//           useMessageStore
//             .getState()
//             .updateMessageCallStatus(chatId, id, CallStatus.DECLINED);
//           callService.markCallAsDeclined(id);
//         }
//       }

//       get().endCall({ isCancel });
//     },

//     endCall: async (
//       options = {
//         isCancel: false,
//         isRejected: false,
//         isTimeout: false,
//       }
//     ) => {
//       const { chatId, id, error } = get();

//       let finalStatus: CallStatus;
//       if (options.isRejected) finalStatus = CallStatus.DECLINED;
//       else if (options.isTimeout) finalStatus = CallStatus.MISSED;
//       else if (error) finalStatus = CallStatus.FAILED;
//       else finalStatus = CallStatus.COMPLETED;

//       const endedAt = new Date().toISOString();

//       if (id) {
//         try {
//           await callService.updateCall(id, {
//             status: finalStatus,
//             endedAt,
//           });
//         } catch (err) {
//           console.error("Failed to update call on server:", err);
//         }
//       }

//       if (chatId && id) {
//         useMessageStore
//           .getState()
//           .updateMessageCallStatus(chatId, id, finalStatus);
//       }

//       useSFUCallStore.getState().disconnectFromSFU();

//       const localStatus = options.isRejected
//         ? LocalCallStatus.REJECTED
//         : options.isCancel
//         ? LocalCallStatus.CANCELED
//         : LocalCallStatus.ENDED;

//       set({
//         localCallStatus: localStatus,
//         endedAt: new Date(),
//       });

//       console.log("call ended with status:", finalStatus);
//     },

//     toggleLocalVoice: () => {
//       useSFUCallStore.getState().toggleAudio();
//     },

//     toggleLocalVideo: async () => {
//       await useSFUCallStore.getState().toggleVideo();
//     },

//     toggleLocalScreenShare: async () => {
//       await useSFUCallStore.getState().toggleScreenShare();
//     },

//     setIsMuted: (isMuted: boolean) => set({ isMuted }),
//     setIsVideoEnable: (isVideoEnabled: boolean) => set({ isVideoEnabled }),
//     setIsScreenSharing: (isScreenSharing: boolean) => set({ isScreenSharing }),

//     // ========== UTILITIES ==========
//     setLocalCallStatus: (status: LocalCallStatus) => {
//       set({ localCallStatus: status });
//     },

//     getCallDuration: () => {
//       const { startedAt, endedAt } = get();
//       if (!startedAt) return 0;
//       const end = endedAt ? endedAt.getTime() : Date.now();
//       return Math.floor((end - startedAt.getTime()) / 1000); // in seconds
//     },

//     closeCallModal: () => {
//       const { clearSFUState } = useSFUCallStore.getState();

//       useModalStore.getState().closeModal();
//       clearSFUState();

//       set({
//         chatId: null,
//         localCallStatus: null,
//         isGroupCall: false,
//         error: null,
//       });
//     },
//   }))
// );
