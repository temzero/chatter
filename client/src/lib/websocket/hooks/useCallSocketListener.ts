import { useEffect } from "react";
import { callWebSocketService } from "../services/call.websocket.service";
import { toast } from "react-toastify";
import { useCallStore } from "@/stores/callStore";
import { CallStatus } from "@/types/enums/modalType";
import {
  IncomingCallResponse,
  CallActionResponse,
  RtcOfferResponse,
  RtcAnswerResponse,
  IceCandidateResponse,
} from "@/types/callPayload";
import { getMyChatMemberId } from "@/stores/chatMemberStore";

export function useCallSocketListeners() {
  useEffect(() => {
    const handleIncomingCall = (data: IncomingCallResponse) => {
      const myMemberId = getMyChatMemberId(data.chatId);

      if (data.fromMemberId === myMemberId) return;
      useCallStore.getState().setIncomingCall({
        fromMemberId: data.fromMemberId,
        callId: data.chatId,
      });

      useCallStore
        .getState()
        .openCall(
          data.chatId,
          data.isVideoCall,
          data.isGroupCall,
          CallStatus.INCOMING
        );

      toast.info(`Incoming ${data.isVideoCall ? "video" : "voice"} call`);
    };

    const handleCallAccepted = async (data: CallActionResponse) => {
      const myMemberId = getMyChatMemberId(data.chatId);

      if (data.fromMemberId === myMemberId) return;

      const store = useCallStore.getState();
      store.setCallStatus(CallStatus.CONNECTING);

      if (store.callStatus === CallStatus.OUTGOING) {
        await store.sendOffer(data.fromMemberId);
      }
    };

    const handleCallRejected = (data: CallActionResponse) => {
      const myMemberId = getMyChatMemberId(data.chatId);

      if (data.fromMemberId === myMemberId) return;
      if (data.isCallerCancel) {
        useCallStore.getState().endCall(true);
        toast.info("Call canceled by caller");
      } else {
        useCallStore.getState().endCall(false, true);
        toast.info("Call rejected");
      }
    };

    const handleCallEnded = (data: CallActionResponse) => {
      console.log("Call ended", data);
      useCallStore.getState().endCall();
      toast.info("Call ended");
    };

    const handleRtcOffer = (data: RtcOfferResponse) => {
      console.log("RTC offer received", data.offer);
      useCallStore.getState().setRemoteOffer(data.offer);
    };

    const handleRtcAnswer = (data: RtcAnswerResponse) => {
      console.log("RTC answer received", data.answer);
      useCallStore.getState().setRemoteAnswer(data.answer);
    };

    const handleIceCandidate = (data: IceCandidateResponse) => {
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
      callWebSocketService.removeAllListeners();
    };
  }, []);
}
