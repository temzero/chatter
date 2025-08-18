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
  updateCallPayload,
} from "@/types/callPayload";
import { getMyChatMemberId } from "@/stores/chatMemberStore";
import { handleError } from "@/utils/handleError";

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

    const handleUpdateCall = (data: updateCallPayload) => {
      const { chatId, isVideoCall, isGroupCall } = data;
      const currentState = useCallStore.getState();

      // Only update if it's for the current active call
      if (currentState.chatId === chatId) {
        useCallStore.setState({
          isVideoCall,
          isGroupCall,
          // Update any other relevant state here
        });

        // If switching to video, we might need to setup local stream
        if (isVideoCall && !currentState.isVideoCall) {
          currentState.setupLocalStream().catch((error) => {
            console.error("Failed to setup video stream:", error);
          });
        }

        // If switching to audio, stop video tracks
        if (!isVideoCall && currentState.isVideoCall) {
          currentState.localStream
            ?.getVideoTracks()
            .forEach((track) => track.stop());
        }
      }
    };

    const handleCallAccepted = async (data: CallActionResponse) => {
      const myMemberId = getMyChatMemberId(data.chatId);

      if (data.fromMemberId === myMemberId) return;

      const store = useCallStore.getState();
      store.setCallStatus(CallStatus.CONNECTING);

      const currentStatus = store.callStatus;
      if (currentStatus === CallStatus.OUTGOING) {
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

    // In useCallSocketListeners.ts - Modified handlers
    const handleOffer = async ({
      chatId,
      fromMemberId,
      offer,
    }: RtcOfferResponse) => {
      const store = useCallStore.getState();

      try {
        if (!store.isGroupCall) {
          // P2P Call
          const pc =
            store.peerConnections[fromMemberId] ||
            store.createPeerConnection(fromMemberId);

          if (pc.signalingState === "closed")
            throw new Error("PeerConnection closed");

          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: store.isVideoCall,
          });

          await pc.setLocalDescription(answer);
          callWebSocketService.sendAnswer({
            chatId,
            answer,
          });
        } else {
          // SFU Call
          if (!store.sfuConnection) {
            store.sfuConnection = new RTCPeerConnection({
              iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });
            store.sfuConnection.onicecandidate = (e) =>
              e.candidate &&
              callWebSocketService.sendIceCandidate({
                chatId,
                candidate: e.candidate.toJSON(),
              });
          }

          await store.sfuConnection.setRemoteDescription(offer);
        }

        store.setCallStatus(CallStatus.CONNECTING);
      } catch (err) {
        handleError(err, "Call offer handling failed");
        store.endCall();
      }
    };

    const handleAnswer = async (data: RtcAnswerResponse) => {
      const store = useCallStore.getState();
      try {
        if (store.isGroupCall) {
          await store.sfuConnection?.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
        } else {
          const pc = store.peerConnections[data.fromMemberId];
          if (pc) {
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
          }
        }
        store.setCallStatus(CallStatus.CONNECTED);
      } catch (error) {
        console.error("Answer handling failed:", error);
        store.endCall();
      }
    };

    const handleIceCandidate = (data: IceCandidateResponse) => {
      console.log("ICE candidate received", data.candidate);
      useCallStore.getState().addIceCandidate(data.candidate);
    };

    // Subscribe to call events
    callWebSocketService.onIncomingCall(handleIncomingCall);
    callWebSocketService.onCallTypeUpdated(handleUpdateCall);
    callWebSocketService.onCallAccepted(handleCallAccepted);
    callWebSocketService.onCallRejected(handleCallRejected);
    callWebSocketService.onCallEnded(handleCallEnded);
    callWebSocketService.onOffer(handleOffer);
    callWebSocketService.onAnswer(handleAnswer);
    callWebSocketService.onIceCandidate(handleIceCandidate);

    return () => {
      callWebSocketService.removeAllListeners();
    };
  }, []);
}
