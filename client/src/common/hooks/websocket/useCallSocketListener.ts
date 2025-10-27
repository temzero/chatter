// hooks/useCallSocketListeners.ts
import { useEffect } from "react";
import { toast } from "react-toastify";
import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { handleError } from "@/common/utils/handleError";
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

export function useCallSocketListeners() {
  const currentUserId = getCurrentUserId();
  useCallSounds();

  useEffect(() => {
    if (!currentUserId) return; // guard inside
    const fetchPendingCalls = async () => {
      try {
        const pendingCalls: IncomingCallResponse[] =
          await callService.fetchPendingCalls();

        if (pendingCalls?.length > 0) {
          const mostRecentCall = pendingCalls[0];
          handleIncomingCall(mostRecentCall);

          if (pendingCalls.length > 1) {
            toast.info(`You have ${pendingCalls.length - 1} more missed calls`);
          }
        }
      } catch (error) {
        console.error("Failed to fetch pending calls:", error);
        handleError(error, "Failed to load pending calls");
      }
    };

    const handleIncomingCall = (callResponse: IncomingCallResponse) => {
      // console.log("[INCOMING_CALL]");
      const {
        callId,
        chatId,
        isVideoCall,
        initiatorUserId,
        initiatorMemberId,
        status,
        isBroadcast,
      } = callResponse;

      const currentUserId = useAuthStore.getState().currentUser?.id;
      const isCaller = initiatorUserId === currentUserId;

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

    const handleStartCall = (data: UpdateCallPayload) => {
      // console.log("[CALL_START]");
      const { callId, chatId } = data;
      const callStore = useCallStore.getState();

      // ✅ Match on chatId instead of callId
      if (callStore.chatId !== chatId) {
        console.log("chatId mismatch");
        return;
      }

      // Save callId if missing (broadcast scenario)
      if (!callStore.callId) {
        useCallStore.setState({ callId });
      }

      if (data.initiatorUserId === currentUserId) {
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

    const handleUpdateCall = (updatedCall: UpdateCallPayload) => {
      // console.log("[UPDATE_CALL]");
      const { callId, isVideoCall, callStatus } = updatedCall;
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

    const handleCallDeclined = (data: CallActionResponse) => {
      // console.log("[CALL_DECLINED]");
      const { callId, isCallerCancel } = data;
      const callStore = useCallStore.getState();

      if (callStore.callId !== callId) {
        console.error("callId mismatch");
        return;
      }

      if (isCallerCancel) {
        callStore.endCall({ isCancel: true });
      } else {
        callStore.endCall({ isDeclined: true });
      }
    };

    const handleCallEnded = (data: UpdateCallPayload) => {
      // console.log("CALL_ENDED");
      const { callId } = data;
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
        toast.error("Cannot start call: line is busy");
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
  }, [currentUserId]);
}
