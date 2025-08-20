// hooks/useCallSocketListeners.ts
import { useEffect } from "react";
import { callWebSocketService } from "../services/call.websocket.service";
import { toast } from "react-toastify";
import { useCallStore } from "@/stores/callStore";
import { CallStatus } from "@/types/enums/CallStatus";
import { handleError } from "@/utils/handleError";
import { useChatStore } from "@/stores/chatStore";
import { ChatType } from "@/types/enums/ChatType";
import { ModalType, useModalStore } from "@/stores/modalStore";
import {
  IncomingCallResponse,
  CallActionResponse,
  RtcOfferResponse,
  RtcAnswerResponse,
  IceCandidateResponse,
  updateCallPayload,
} from "@/types/callPayload";

// callEvents exclude sender
export function useCallSocketListeners() {
  useEffect(() => {
    const handlePendingCalls = (calls: IncomingCallResponse[]) => {
      if (calls?.length > 0) {
        const sortedCalls = [...calls].sort(
          (a, b) => b.timestamp - a.timestamp
        );
        const mostRecentCall = sortedCalls[0];
        handleIncomingCall(mostRecentCall);

        if (sortedCalls.length > 1) {
          toast.info(`You have ${sortedCalls.length - 1} more missed calls`);
        }
      }
    };

    const handleIncomingCall = (data: IncomingCallResponse) => {
      useCallStore.setState({
        chatId: data.chatId,
        callStatus: CallStatus.INCOMING,
        isVideoCall: data.isVideoCall,
        callerMemberId: data.fromMemberId,
      });

      useModalStore.getState().openModal(ModalType.CALL);
      toast.info(`Incoming ${data.isVideoCall ? "video" : "voice"} call`);
    };

    const handleUpdateCall = (data: updateCallPayload) => {
      const { chatId, isVideoCall } = data;
      const callStore = useCallStore.getState();

      if (callStore.chatId === chatId) {
        // switchType already does full logic, but here we directly update
        useCallStore.setState({ isVideoCall });

        if (isVideoCall && !callStore.isVideoCall) {
          callStore
            .setupLocalStream()
            .catch((err) =>
              console.error("Failed to setup video stream:", err)
            );
        }

        if (!isVideoCall && callStore.isVideoCall) {
          callStore.localStream?.getVideoTracks().forEach((t) => t.stop());
        }
      }
    };

    const handleCallAccepted = async (data: CallActionResponse) => {
      const callStore = useCallStore.getState();
      callStore.setStatus(CallStatus.CONNECTING);

      if (callStore.callStatus === CallStatus.OUTGOING) {
        await callStore.sendOffer(data.fromMemberId);
      }
    };

    const handleCallRejected = (data: CallActionResponse) => {
      if (data.isCallerCancel) {
        useCallStore.getState().endCall({ isCancel: true });
        toast.info("Call canceled by caller");
      } else {
        useCallStore.getState().endCall({ isRejected: true });
        toast.info("Call rejected");
      }
    };

    const handleHangUp = (data: CallActionResponse) => {
      useCallStore.getState().removeCallMember(data.fromMemberId);
      toast.info(`${data.fromMemberId} has left the call`);
    };

    const handleOffer = async ({
      chatId,
      fromMemberId,
      offer,
    }: RtcOfferResponse) => {
      const callStore = useCallStore.getState();
      const chatType = useChatStore.getState().getChatType(chatId);

      try {
        if (chatType === ChatType.DIRECT) {
          const pc =
            callStore.peerConnections[fromMemberId] ||
            callStore.createPeerConnection(fromMemberId);

          if (pc.signalingState === "closed") {
            throw new Error("PeerConnection closed");
          }

          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: callStore.isVideoCall,
          });

          await pc.setLocalDescription(answer);
          callWebSocketService.sendAnswer({ chatId, answer });
        } else {
          if (!callStore.sfuConnection) {
            await callStore.createSfuConnection();
          }
          await callStore.sfuConnection?.setRemoteDescription(offer);
        }

        callStore.setStatus(CallStatus.CONNECTING);
      } catch (err) {
        handleError(err, "Call offer handling failed");
        callStore.endCall();
      }
    };

    const handleAnswer = async (data: RtcAnswerResponse) => {
      const callStore = useCallStore.getState();
      const chatType = useChatStore.getState().getChatType(data.chatId);

      try {
        if (chatType === ChatType.DIRECT) {
          const pc = callStore.peerConnections[data.fromMemberId];
          if (pc) {
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
          }
        } else {
          await callStore.sfuConnection?.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
        }
        callStore.setStatus(CallStatus.CONNECTED);
      } catch (err) {
        console.error("Answer handling failed:", err);
        callStore.endCall();
      }
    };

    const handleIceCandidate = (data: IceCandidateResponse) => {
      console.log("ICE candidate received", data.candidate);
      useCallStore.getState().addIceCandidate(data.candidate);
    };

    // Subscribe
    callWebSocketService.onPendingCalls(handlePendingCalls);
    callWebSocketService.onIncomingCall(handleIncomingCall);
    callWebSocketService.onCallTypeUpdated(handleUpdateCall);
    callWebSocketService.onCallAccepted(handleCallAccepted);
    callWebSocketService.onCallRejected(handleCallRejected);
    callWebSocketService.onHangup(handleHangUp);
    callWebSocketService.onOffer(handleOffer);
    callWebSocketService.onAnswer(handleAnswer);
    callWebSocketService.onIceCandidate(handleIceCandidate);

    callWebSocketService.requestPendingCalls();

    return () => {
      callWebSocketService.removeAllListeners();
    };
  }, []);
}
