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
  participants: CallParticipant[];
  incomingCall: IncomingCallData | null;
  remoteOffer: RTCSessionDescriptionInit | null;
  remoteAnswer: RTCSessionDescriptionInit | null;
  iceCandidates: RTCIceCandidateInit[];

  // Actions
  startCall: (chat: ChatResponse, isVideo: boolean, isGroup: boolean) => void;
  openCall: (chat: ChatResponse, isVideo: boolean, isGroup: boolean) => void;
  endCall: (callId?: string) => void;
  setStatus: (status: CallStatus) => void;
  switchType: () => void;

  // Extra for socket events
  setIncomingCall: (data: IncomingCallData) => void;
  setCallStatus: (status: CallStatus) => void;
  setRemoteOffer: (offer: RTCSessionDescriptionInit) => void;
  setRemoteAnswer: (answer: RTCSessionDescriptionInit) => void;
  addIceCandidate: (candidate: RTCIceCandidateInit) => void;
}

export const useCallStore = create<CallState>()(
  devtools((set, get) => ({
    chat: null,
    isVideoCall: false,
    isGroupCall: false,
    callStatus: null,
    participants: [],
    incomingCall: null,
    remoteOffer: null,
    remoteAnswer: null,
    iceCandidates: [],

    // 📞 Start Call + WebSocket
    startCall: (chat, isVideo, isGroup) => {
      // Update store and open modal using openCall
      get().openCall(chat, isVideo, isGroup);

      // Emit initiate call event only for the caller
      callWebSocketService.initiateCall({
        chatId: chat.id,
        isVideoCall: isVideo,
        isGroupCall: isGroup,
      });
    },

    openCall: (chat: ChatResponse, isVideo: boolean, isGroup: boolean) => {
      set({
        chat,
        isVideoCall: isVideo,
        isGroupCall: isGroup,
        callStatus: CallStatus.IN_CALL,
      });

      // Open call modal but DO NOT emit INITIATE_CALL
      useModalStore.getState().openModal(ModalType.CALL);
    },

    // 🛑 End Call + WebSocket
    endCall: () => {
      set({
        callStatus: CallStatus.ENDED,
        participants: [],
        incomingCall: null,
        remoteOffer: null,
        remoteAnswer: null,
        iceCandidates: [],
      });

      useModalStore.getState().closeModal();
    },

    // 🔄 Switch between video/voice + WebSocket
    switchType: () => {
      const { isVideoCall, chat, isGroupCall } = get();
      const newType = !isVideoCall;

      set({ isVideoCall: newType });

      // Optionally notify other users
      if (chat?.id) {
        callWebSocketService.initiateCall({
          chatId: chat.id,
          isVideoCall: newType,
          isGroupCall,
        });
      }
    },

    setStatus: (status) => set({ callStatus: status }),

    // 📥 Handle incoming call + auto-open modal
    setIncomingCall: (data) => {
      set({
        incomingCall: data,
        callStatus: CallStatus.INCOMING,
      });

      // Auto-open call modal
      useModalStore.getState().openModal(ModalType.CALL);
    },

    setCallStatus: (status) => set({ callStatus: status }),
    setRemoteOffer: (offer) => set({ remoteOffer: offer }),
    setRemoteAnswer: (answer) => set({ remoteAnswer: answer }),
    addIceCandidate: (candidate) =>
      set((state) => ({
        iceCandidates: [...state.iceCandidates, candidate],
      })),
  }))
);
