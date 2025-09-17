// hooks/useCallSocketListeners.ts
import { useEffect } from "react";
import { callWebSocketService } from "../services/call.websocket.service";
import { toast } from "react-toastify";
import { LocalCallStatus } from "@/types/enums/CallStatus";
import { handleError } from "@/utils/handleError";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { useCallStore } from "@/stores/callStore/callStore";
import { useCallSounds } from "@/hooks/useCallSound";
import { callService } from "@/services/callService";
import {
  CallActionResponse,
  UpdateCallPayload,
  IncomingCallResponse,
} from "@/types/callPayload";

export function useCallSocketListeners() {
  useCallSounds();

  useEffect(() => {
    const fetchPendingCalls = async () => {
      try {
        const pendingCalls: IncomingCallResponse[] =
          await callService.getPendingCalls();
        console.log("Pending calls:", pendingCalls);

        if (pendingCalls?.length > 0) {
          // The server already returns newest first, so just take the first
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
      console.log("handleIncomingCall", callResponse);
      useCallStore.setState({
        id: callResponse.callId,
        chatId: callResponse.chatId,
        isVideoCall: callResponse.isVideoCall,
        isGroupCall: callResponse.isGroupCall || false,
        initiatorMemberId: callResponse.initiatorMemberId,
        localCallStatus: LocalCallStatus.INCOMING,
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
      const { callId, isVideoCall } = updatedCall;
      const callStore = useCallStore.getState();

      if (callStore.id === callId) {
        // Update call type and handle stream changes
        useCallStore.setState({ isVideoCall });

        if (isVideoCall && !callStore.isVideoCall) {
          // For SFU calls, video is handled by LiveKit internally
          console.log("SFU call - video will be handled by LiveKit");
        }

        if (!isVideoCall && callStore.isVideoCall) {
          // For SFU calls, toggle video off through LiveKit
          useCallStore
            .getState()
            .toggleLocalVideo()
            .catch((err) => console.error("Failed to disable SFU video:", err));
        }
      }
    };

    const handleCallAccepted = async (callResponse: CallActionResponse) => {
      console.log("handleCallAccepted");

      const callStore = useCallStore.getState();
      callStore.setLocalCallStatus(LocalCallStatus.CONNECTING);

      if (callStore.chatId !== callResponse.chatId) {
        console.warn("Accepted call does not match current call");
        return;
      }

      // Update call info in store
      useCallStore.setState({
        chatId: callResponse.chatId,
        localCallStatus: LocalCallStatus.CONNECTED,
      });
    };

    const handleCallRejected = async (data: CallActionResponse) => {
      console.log("handleCallRejected");
      const callStore = useCallStore.getState();

      if (callStore.id === data.callId) {
        if (data.isCallerCancel) {
          callStore.endCall({ isCancel: true });
          toast.info("Call canceled by caller");
        } else {
          callStore.endCall({ isRejected: true });
          toast.info("Call rejected");
        }
      }
    };

    const handleHangUp = async (data: CallActionResponse) => {
      console.log("User hangup", data);
      const callStore = useCallStore.getState();

      if (callStore.id === data.callId) {
        toast.info(`${data.memberId} has left the call`);
        const room = callStore.getLiveKitRoom();
        if (room && room.remoteParticipants.size === 0) {
          callStore.endCall();
        }
      }
    };

    // Subscribe to events
    callWebSocketService.removeAllListeners();
    callWebSocketService.onIncomingCall(handleIncomingCall);
    callWebSocketService.onCallUpdated(handleUpdateCall);
    callWebSocketService.onCallAccepted(handleCallAccepted);
    callWebSocketService.onCallRejected(handleCallRejected);
    callWebSocketService.onHangup(handleHangUp);

    // Fetch pending calls from database on mount
    fetchPendingCalls();

    return () => {
      callWebSocketService.removeAllListeners();
    };
  }, []);
}
