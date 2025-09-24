// hooks/useCallSocketListeners.ts
import { useEffect } from "react";
import { callWebSocketService } from "../services/call.websocket.service";
import { toast } from "react-toastify";
import { LocalCallStatus, CallStatus } from "@/types/enums/CallStatus";
import { handleError } from "@/utils/handleError";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { useCallStore } from "@/stores/callStore/callStore";
import { useCallSounds } from "@/hooks/useCallSound";
import { callService } from "@/services/callService";
import {
  CallActionResponse,
  UpdateCallPayload,
  IncomingCallResponse,
  CallError,
  CallErrorResponse,
} from "@/types/callPayload";
import { useAuthStore } from "@/stores/authStore";

export function useCallSocketListeners() {
  useCallSounds();

  useEffect(() => {
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
      console.log("[INCOMING_CALL]", callResponse);

      const {
        callId,
        chatId,
        isVideoCall,
        initiatorUserId,
        initiatorMemberId,
        status,
        startedAt,
      } = callResponse;

      const currentUserId = useAuthStore.getState().currentUser?.id;
      const isCaller = initiatorUserId === currentUserId;

      useCallStore.setState({
        callId,
        chatId,
        isVideoCall: isVideoCall ?? false,
        initiatorMemberId,
        localCallStatus: isCaller
          ? LocalCallStatus.OUTGOING
          : LocalCallStatus.INCOMING,
        callStatus: status,
      });

      if (!isCaller) {
        useModalStore.getState().openModal(ModalType.CALL);
      }

      if (!isCaller && startedAt) {
        toast.info(
          `Incoming ${
            isVideoCall ? "video" : "voice"
          } call started at ${new Date(startedAt).toLocaleTimeString()}`
        );
      }
    };

    const handleStartCall = (data: UpdateCallPayload) => {
      console.log("[CALL_START]");
      const { callId } = data;
      const callStore = useCallStore.getState();

      if (callStore.callId !== callId) {
        console.log("callId miss match");
        return;
      }

      useCallStore.setState({
        localCallStatus: LocalCallStatus.CONNECTED,
        callStatus: CallStatus.IN_PROGRESS,
      });
    };

    const handleUpdateCall = (updatedCall: UpdateCallPayload) => {
      console.log("handleUpdateCall");
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
      console.log("[CALL_DECLINED]", data);
      const { callId, isCallerCancel } = data;
      const callStore = useCallStore.getState();

      if (callStore.callId !== callId) {
        console.error("callId mismatch");
        return;
      }

      if (isCallerCancel) {
        callStore.endCall({ isCancel: true });
      } else {
        console.log("callStore.endCall({ isDeclined: true });");
        callStore.endCall({ isDeclined: true });
      }
    };

    const handleCallEnded = (data: UpdateCallPayload) => {
      console.log("CALL_ENDED", data);
      const { callId, callStatus } = data;
      const callStore = useCallStore.getState();

      if (callStore.callId !== callId) {
        console.error("callId miss match");
        return;
      }

      callStore.endCall();
      useCallStore.setState({
        callStatus: callStatus ?? CallStatus.COMPLETED,
        localCallStatus: LocalCallStatus.ENDED,
      });
    };

    const handleCallError = (data: CallErrorResponse) => {
      console.warn("Call error:", data);
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
      callWebSocketService.removeAllListeners();
    };
  }, []);
}
