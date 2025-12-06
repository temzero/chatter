// hooks/useCallSocketListeners.ts
import { useEffect } from "react";
import { toast } from "react-toastify";
import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { useCallStore } from "@/stores/callStore";
import { useCallSounds } from "@/common/hooks/useCallSound";
import { getCurrentUserId } from "@/stores/authStore";
import { webSocketService } from "@/services/websocket/websocketService";
import { callWebSocketService } from "@/services/websocket/callWebsocketService";
import {
  CallActionResponse,
  UpdateCallPayload,
  IncomingCallResponse,
  CallError,
  CallErrorResponse,
} from "@shared/types/call";
import { useTranslation } from "react-i18next";
import { WsNotificationResponse } from "@/shared/types/responses/ws-emit-chat-member.response";

export function useCallSocketListeners() {
  const { t } = useTranslation();
  const currentUserId = getCurrentUserId();
  useCallSounds();

  useEffect(() => {
    if (!currentUserId) return; // guard inside
    // const fetchPendingCalls = async () => {
    //   try {
    //     const pendingCalls: IncomingCallResponse[] =
    //       await callService.fetchPendingCalls();

    //     if (pendingCalls?.length > 0) {
    //       const data: WsNotificationResponse<IncomingCallResponse> = {
    //         payload: pendingCalls[0],
    //       };
    //       handleIncomingCall(data);

    //       if (pendingCalls.length > 1) {
    //         toast.info(
    //           t("toast.call.missed", { count: pendingCalls.length - 1 })
    //         );
    //       }
    //     }
    //   } catch (error) {
    //     console.error("FETCH", error);
    //   }
    // };

    const handleIncomingCall = (
      data: WsNotificationResponse<IncomingCallResponse>
    ) => {
      useCallStore.getState().setIncomingCall(data.payload);
    };

    // const handleIncomingCall = (
    //   data: WsNotificationResponse<IncomingCallResponse>
    // ) => {
    //   console.log("[INCOMING_CALL]", data);
    //   const {
    //     callId,
    //     chatId,
    //     isVideoCall,
    //     initiatorUserId,
    //     initiatorMemberId,
    //     status,
    //     isBroadcast,
    //   } = data.payload;

    //   const currentUserId = useAuthStore.getState().currentUser?.id;
    //   const isCaller = initiatorUserId === currentUserId;

    //   if (!isCaller && useCallStore.getState().callId) {
    //     console.warn(
    //       "Already have an incoming call, ignoring new incoming call"
    //     );
    //     return;
    //   }

    //   useCallStore.setState({
    //     callId,
    //     chatId,
    //     isCaller,
    //     isVideoCall: isBroadcast ? false : isVideoCall,
    //     initiatorUserId,
    //     initiatorMemberId,
    //     ...(isBroadcast
    //       ? {}
    //       : {
    //           localCallStatus: isCaller
    //             ? LocalCallStatus.OUTGOING
    //             : LocalCallStatus.INCOMING,
    //         }),
    //     callStatus: isBroadcast ? CallStatus.IN_PROGRESS : status,
    //   });

    //   if (!isCaller && !isBroadcast) {
    //     useModalStore.getState().openModal(ModalType.CALL);
    //   }
    // };

    const handleStartCall = (
      data: WsNotificationResponse<UpdateCallPayload>
    ) => {
      console.log("[EVENT]", "CALL_START", data);
      const { callId, chatId, initiatorUserId } = data.payload;
      const callStore = useCallStore.getState();

      // ✅ Match on chatId instead of callId
      if (callStore.chatId !== chatId) {
        console.error("chatId mismatch");
        return;
      }

      // Save callId if missing (broadcast scenario)
      if (!callStore.callId) {
        useCallStore.setState({ callId });
      }

      if (initiatorUserId === currentUserId) {
        useCallStore.setState({
          localCallStatus: LocalCallStatus.CONNECTED,
          callStatus: CallStatus.IN_PROGRESS,
          startedAt: new Date(),
        });
      } else {
        useCallStore.setState({
          callStatus: CallStatus.IN_PROGRESS,
          startedAt: new Date(),
        });
      }
    };

    const handleUpdateCall = (
      updatedCall: WsNotificationResponse<UpdateCallPayload>
    ) => {
      console.log("[EVENT]", "UPDATE_CALL", updatedCall);
      const { chatId, isVideoCall, callStatus } = updatedCall.payload;
      const callStore = useCallStore.getState();

      if (callStore.chatId !== chatId) {
        console.log("chatId miss match");
        return;
      }

      useCallStore.setState({
        isVideoCall: isVideoCall ?? callStore.isVideoCall,
        callStatus: callStatus ?? callStore.callStatus,
      });

      if (isVideoCall && !callStore.isVideoCall) {
        console.warn("SFU call - video will be handled by LiveKit");
      }

      if (!isVideoCall && callStore.isVideoCall) {
        callStore
          .toggleLocalVideo()
          .catch((err) => console.error("Failed to disable SFU video:", err));
      }
    };

    const handleCallDeclined = (
      data: WsNotificationResponse<CallActionResponse>
    ) => {
      console.log("[EVENT]", "CALL_DECLINED", data);
      const { chatId, isCallerCancel } = data.payload;
      const callStore = useCallStore.getState();

      if (callStore.chatId !== chatId) {
        console.error("chatId mismatch");
        return;
      }

      if (isCallerCancel) {
        callStore.endCall({ isCancel: true });
      } else {
        callStore.endCall({ isDeclined: true });
      }
    };

    const handleCallEnded = (
      data: WsNotificationResponse<UpdateCallPayload>
    ) => {
      console.log("[EVENT]", "CALL_ENDED", data);
      const { chatId } = data.payload;
      const callStore = useCallStore.getState();

      if (callStore.chatId !== chatId) {
        console.log("chatId miss match");
        return;
      }

      callStore.disconnectFromLiveKit();
      useCallStore.setState({
        callStatus: CallStatus.COMPLETED,
        localCallStatus: LocalCallStatus.ENDED,
        endedAt: new Date(),
      });
      callStore.closeCallModal();
    };

    const handleCallError = (
      data: WsNotificationResponse<CallErrorResponse>
    ) => {
      console.error("[EVENT]", "Call error:", data);
      const { reason, chatId } = data.payload;

      if (reason === CallError.LINE_BUSY) {
        toast.error(t("toast.call.cannot_start"));
        const callStore = useCallStore.getState();

        if (callStore.chatId !== chatId) {
          console.log("chatId miss match");
          return;
        }

        callStore.endCall();
        useCallStore.setState({
          callStatus: CallStatus.FAILED,
          localCallStatus: LocalCallStatus.ERROR,
          error: CallError.LINE_BUSY,
        });
      }
    };

    const socket = webSocketService.getSocket();
    if (!socket) return;
    // Subscribe to events
    callWebSocketService.removeAllListeners();
    callWebSocketService.onIncomingCall(handleIncomingCall);
    callWebSocketService.onStartCall(handleStartCall);
    callWebSocketService.onCallUpdated(handleUpdateCall);
    callWebSocketService.onCallDeclined(handleCallDeclined);
    callWebSocketService.onCallEnded(handleCallEnded);
    callWebSocketService.onCallError(handleCallError);

    // fetchPendingCalls();

    return () => {
      const socket = webSocketService.getSocket();
      if (!socket) return;
      callWebSocketService.removeAllListeners();
    };
  }, [currentUserId, t]);
}
