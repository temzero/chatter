import { useEffect } from "react";
import { callWebSocketService } from "../services/call.websocket.service";
import { toast } from "react-toastify";
import { useCallStore } from "@/stores/callStore";
import { CallStatus } from "@/types/enums/modalType";
import {
  IncomingCallPayload,
  CallUserActionPayload,
  RtcOfferPayload,
  RtcAnswerPayload,
  IceCandidatePayload,
} from "@/types/responses/callPayload.response";
import { useCurrentUserId } from "@/stores/authStore";

export function useCallSocketListeners() {
  const currentUserId = useCurrentUserId();

  useEffect(() => {
    const handleIncomingCall = (data: IncomingCallPayload) => {
      if (data.callerId === currentUserId) return;
      toast.info(
        `Incoming ${data.isVideoCall ? "video" : "voice"} call from ${
          data.chat.name || "Unknown"
        }`
      );
      useCallStore.getState().setIncomingCall({
        fromUserId: data.callerId,
        callId: data.chat.id,
      });

      // **JOIN the call, instead of starting it**
      useCallStore
        .getState()
        .openCall(data.chat, data.isVideoCall, data.isGroupCall);

      toast.info(
        `Incoming ${data.isVideoCall ? "video" : "voice"} call from ${
          data.chat.name || "Unknown"
        }`
      );
    };

    const handleCallAccepted = (data: CallUserActionPayload) => {
      console.log("Call accepted", data);
      useCallStore.getState().setCallStatus(CallStatus.IN_CALL);
      toast.success("Call accepted");
    };

    const handleCallRejected = (data: CallUserActionPayload) => {
      console.log("Call rejected", data);
      useCallStore.getState().endCall(data.chatId);
      toast.error("Call rejected");
    };

    const handleCallEnded = (data: CallUserActionPayload) => {
      console.log("Call ended", data);
      useCallStore.getState().endCall(data.chatId);
      toast.info("Call ended");
    };

    const handleRtcOffer = (data: RtcOfferPayload) => {
      console.log("RTC offer received", data.offer);
      useCallStore.getState().setRemoteOffer(data.offer);
    };

    const handleRtcAnswer = (data: RtcAnswerPayload) => {
      console.log("RTC answer received", data.answer);
      useCallStore.getState().setRemoteAnswer(data.answer);
    };

    const handleIceCandidate = (data: IceCandidatePayload) => {
      console.log("ICE candidate received", data.candidate);
      useCallStore.getState().addIceCandidate(data.candidate);
    };

    // Subscribe to call events
    callWebSocketService.onIncomingCall(handleIncomingCall);
    callWebSocketService.onCallAccepted(handleCallAccepted);
    callWebSocketService.onCallRejected(handleCallRejected);
    callWebSocketService.onCallEnded(handleCallEnded);
    callWebSocketService.onRtcOffer(handleRtcOffer);
    callWebSocketService.onRtcAnswer(handleRtcAnswer);
    callWebSocketService.onIceCandidate(handleIceCandidate);

    return () => {
      // Cleanup listeners
      callWebSocketService.removeAllListeners();
    };
  }, []);
}
