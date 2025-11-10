// hooks/useCallSocketListeners.ts
import { useEffect } from "react";
import { toast } from "react-toastify";
import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { useCallStore } from "@/stores/callStore";
import { useCallSounds } from "@/common/hooks/useCallSound";
import { callService } from "@/services/http/callService";
import { getCurrentUserId, useAuthStore } from "@/stores/authStore";
import { webSocketService } from "@/services/websocket/websocket.service";
import { callWebSocketService } from "@/services/websocket/call.websocket.service";
import {
  CallActionResponse,
  UpdateCallPayload,
  IncomingCallResponse,
  CallError,
  CallErrorResponse,
} from "@shared/types/call";
import { useTranslation } from "react-i18next";
import { WsEmitChatMemberResponse } from "@/shared/types/responses/ws-emit-chat-member.response";

export function useCallSocketListeners() {
  const { t } = useTranslation();
  const currentUserId = getCurrentUserId();
  useCallSounds();

  useEffect(() => {
    if (!currentUserId) return; // guard inside
    const fetchPendingCalls = async () => {
      try {
        const pendingCalls: IncomingCallResponse[] =
          await callService.fetchPendingCalls();

        if (pendingCalls?.length > 0) {
          const data: WsEmitChatMemberResponse<IncomingCallResponse> = {
            payload: pendingCalls[0],
          };
          handleIncomingCall(data);

          if (pendingCalls.length > 1) {
            toast.info(
              t("toast.call.missed", { count: pendingCalls.length - 1 })
            );
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handleIncomingCall = (
      data: WsEmitChatMemberResponse<IncomingCallResponse>
    ) => {
      console.log("[INCOMING_CALL]", data);
      const {
        callId,
        chatId,
        isVideoCall,
        initiatorUserId,
        initiatorMemberId,
        status,
        isBroadcast,
      } = data.payload;

      const currentUserId = useAuthStore.getState().currentUser?.id;
      const isCaller = initiatorUserId === currentUserId;

      if (!isCaller && useCallStore.getState().callId) {
        console.log(
          "Already have an incoming call, ignoring new incoming call"
        );
        return;
      }

      useCallStore.setState({
        callId,
        chatId,
        isCaller,
        isVideoCall: isBroadcast ? false : isVideoCall,
        initiatorUserId,
        initiatorMemberId,
        ...(isBroadcast
          ? {}
          : {
              localCallStatus: isCaller
                ? LocalCallStatus.OUTGOING
                : LocalCallStatus.INCOMING,
            }),
        callStatus: isBroadcast ? CallStatus.IN_PROGRESS : status,
      });

      if (!isCaller && !isBroadcast) {
        useModalStore.getState().openModal(ModalType.CALL);
      }
    };

    const handleStartCall = (
      data: WsEmitChatMemberResponse<UpdateCallPayload>
    ) => {
      console.log("[CALL_START]", data);
      const { callId, chatId, initiatorUserId } = data.payload;
      const callStore = useCallStore.getState();

      // ✅ Match on chatId instead of callId
      if (callStore.chatId !== chatId) {
        console.log("callStore.chatId ", callStore.chatId);
        console.log("chatId ", chatId);
        console.warn("chatId mismatch");
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
      updatedCall: WsEmitChatMemberResponse<UpdateCallPayload>
    ) => {
      // console.log("[UPDATE_CALL]");
      const { callId, isVideoCall, callStatus } = updatedCall.payload;
      const callStore = useCallStore.getState();

      if (callStore.callId !== callId) {
        console.error("callId miss match");
        return;
      }

      useCallStore.setState({
        isVideoCall: isVideoCall ?? callStore.isVideoCall,
        callStatus: callStatus ?? callStore.callStatus,
      });

      if (isVideoCall && !callStore.isVideoCall) {
        console.log("SFU call - video will be handled by LiveKit");
      }

      if (!isVideoCall && callStore.isVideoCall) {
        callStore
          .toggleLocalVideo()
          .catch((err) => console.error("Failed to disable SFU video:", err));
      }
    };

    const handleCallDeclined = (
      data: WsEmitChatMemberResponse<CallActionResponse>
    ) => {
      // console.log("[CALL_DECLINED]");
      const { callId, isCallerCancel } = data.payload;
      const callStore = useCallStore.getState();

      if (callStore.callId !== callId) {
        console.log("callStore.callId", callStore.callId);
        console.log("callId", callId);
        console.error("callId mismatch");
        return;
      }

      if (isCallerCancel) {
        callStore.endCall({ isCancel: true });
      } else {
        callStore.endCall({ isDeclined: true });
      }
    };

    const handleCallEnded = (
      data: WsEmitChatMemberResponse<UpdateCallPayload>
    ) => {
      // console.log("CALL_ENDED");
      const { callId } = data.payload;
      const callStore = useCallStore.getState();

      if (callStore.callId !== callId) {
        console.error("callId miss match");
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

    const handleCallError = (data: CallErrorResponse) => {
      // console.warn("Call error:", data);
      const { reason, callId } = data;

      if (reason === CallError.LINE_BUSY) {
        toast.error(t("toast.call.cannot_start"));
        const callStore = useCallStore.getState();

        if (callStore.callId !== callId) {
          console.error("callId miss match");
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

    fetchPendingCalls();

    return () => {
      const socket = webSocketService.getSocket();
      if (!socket) return;
      callWebSocketService.removeAllListeners();
    };
  }, [currentUserId, t]);
}
