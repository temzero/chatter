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
      useCallStore.setState({
        callId: callResponse.callId,
        chatId: callResponse.chatId,
        isVideoCall: callResponse.isVideoCall ?? false,
        initiatorMemberId: callResponse.initiatorMemberId,
        localCallStatus: LocalCallStatus.INCOMING,
        callStatus: callResponse.status, // 🔹 sync server status
      });

      useModalStore.getState().openModal(ModalType.CALL);

      if (callResponse.startedAt) {
        toast.info(
          `Incoming ${
            callResponse.isVideoCall ? "video" : "voice"
          } call started at ${new Date(
            callResponse.startedAt
          ).toLocaleTimeString()}`
        );
      }
    };

    const handleUpdateCall = (updatedCall: UpdateCallPayload) => {
      console.log("handleUpdateCall");
      const { callId, isVideoCall, callStatus } = updatedCall;
      const callStore = useCallStore.getState();

      if (callStore.callId === callId) {
        useCallStore.setState({
          isVideoCall: isVideoCall ?? callStore.isVideoCall,
          callStatus: callStatus ?? callStore.callStatus, // 🔹 sync server status
        });

        if (isVideoCall && !callStore.isVideoCall) {
          console.log("SFU call - video will be handled by LiveKit");
        }

        if (!isVideoCall && callStore.isVideoCall) {
          callStore
            .toggleLocalVideo()
            .catch((err) => console.error("Failed to disable SFU video:", err));
        }
      }
    };

    const handleJoinCall = async (callResponse: CallActionResponse) => {
      console.log("handleJoinCall");
      const callStore = useCallStore.getState();

      if (callStore.callId !== callResponse.callId) {
        console.warn("Accepted call does not match current call");
        return;
      }

      useCallStore.setState({
        localCallStatus: LocalCallStatus.CONNECTED,
        callStatus: callResponse.status ?? CallStatus.IN_PROGRESS, // 🔹 sync server status
      });
    };

    const handleCallRejected = async (data: CallActionResponse) => {
      console.log("handleCallRejected");
      const callStore = useCallStore.getState();

      if (callStore.callId === data.callId) {
        if (data.isCallerCancel) {
          callStore.endCall({ isCancel: true });
          useCallStore.setState({ callStatus: CallStatus.FAILED }); // 🔹 sync server
          toast.info("Call canceled by caller");
        } else {
          callStore.endCall({ isRejected: true });
          useCallStore.setState({ callStatus: CallStatus.FAILED }); // 🔹 sync server
          toast.info("Call rejected");
        }
      }
    };

    const handleHangUp = async (data: CallActionResponse) => {
      console.log("User hangup", data);
      const callStore = useCallStore.getState();

      if (callStore.callId === data.callId) {
        toast.info(`${data.memberId} has left the call`);
        const room = callStore.getLiveKitRoom();
        if (room && room.remoteParticipants.size === 0) {
          callStore.endCall();
          useCallStore.setState({
            callStatus: data.status ?? CallStatus.COMPLETED, // 🔹 sync server
          });
        }
      }
    };

    const handleCallEnded = (data: UpdateCallPayload) => {
      const callStore = useCallStore.getState();

      if (callStore.callId === data.callId) {
        toast.info("Call ended");
        callStore.endCall();
        useCallStore.setState({
          callStatus: data.callStatus ?? CallStatus.COMPLETED,
        });
      }
    };

    const handleCallError = (data: CallErrorResponse) => {
      console.warn("Call error:", data);

      if (data.reason === CallError.LINE_BUSY) {
        toast.error("Cannot start call: line is busy");
        const callStore = useCallStore.getState();
        if (callStore.callId === data.callId) {
          callStore.endCall();
          useCallStore.setState({
            callStatus: CallStatus.FAILED,
            localCallStatus: LocalCallStatus.ERROR,
            error: CallError.LINE_BUSY,
          });
        }
      }
    };

    // Subscribe to events
    callWebSocketService.removeAllListeners();
    callWebSocketService.onIncomingCall(handleIncomingCall);
    callWebSocketService.onCallUpdated(handleUpdateCall);
    callWebSocketService.onJoinCall(handleJoinCall);
    callWebSocketService.onCallRejected(handleCallRejected);
    callWebSocketService.onHangup(handleHangUp);
    callWebSocketService.onCallEnded(handleCallEnded);
    callWebSocketService.onCallError(handleCallError);

    fetchPendingCalls();

    return () => {
      callWebSocketService.removeAllListeners();
    };
  }, []);
}
