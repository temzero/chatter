// hooks/useCallSocketListeners.ts
import { useEffect } from "react";
import { callWebSocketService } from "../services/call.websocket.service";
import { toast } from "react-toastify";
import { useCallStore } from "@/stores/callStore/callStore";
import { CallStatus } from "@/types/enums/CallStatus";
import { handleError } from "@/utils/handleError";
import { useChatStore } from "@/stores/chatStore";
import { ChatType } from "@/types/enums/ChatType";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { getMyChatMemberId } from "@/stores/chatMemberStore";
import {
  IncomingCallResponse,
  CallActionResponse,
  RtcOfferResponse,
  RtcAnswerResponse,
  IceCandidateResponse,
  updateCallPayload,
  callMemberPayload,
} from "@/types/callPayload";
import { useP2PCallStore } from "@/stores/callStore/p2pCallStore";

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
        isGroupCall: data.isGroupCall || false,
      });

      useCallStore.getState().addCallMember({
        memberId: data.fromMemberId,
      });

      useModalStore.getState().openModal(ModalType.CALL);
      toast.info(`Incoming ${data.isVideoCall ? "video" : "voice"} call`);
    };

    const handleUpdateCall = (data: updateCallPayload) => {
      const { chatId, isVideoCall } = data;
      const callStore = useCallStore.getState();

      if (callStore.chatId === chatId) {
        // Update call type and handle stream changes
        useCallStore.setState({ isVideoCall });

        if (isVideoCall && !callStore.isVideoCall) {
          callStore
            .setupLocalStream()
            .catch((err) =>
              console.error("Failed to setup video stream:", err)
            );
        }

        if (!isVideoCall && callStore.isVideoCall) {
          // Stop video tracks but keep audio
          callStore.localVideoStream?.getVideoTracks().forEach((t) => t.stop());
          useCallStore.setState({
            localVideoStream: null,
            isVideoEnabled: false,
          });
        }
      }
    };

    const handleCallMemberUpdated = (data: callMemberPayload) => {
      const callStore = useCallStore.getState();

      if (callStore.chatId === data.chatId) {
        callStore.updateCallMember(data);

        // Optional: Show toast notification for state changes
        if (data.isVideoEnabled !== undefined) {
          const action = data.isVideoEnabled ? "enabled" : "disabled";
          toast.info(`Member ${data.memberId} ${action} video`);
        }
        if (data.isMuted !== undefined) {
          const action = data.isMuted ? "muted" : "unmuted";
          toast.info(`Member ${data.memberId} ${action} microphone`);
        }
        if (data.isScreenSharing !== undefined) {
          const action = data.isScreenSharing ? "started" : "stopped";
          toast.info(`Member ${data.memberId} ${action} screen sharing`);
        }
      }
    };

    const handleCallAccepted = async (data: CallActionResponse) => {
      const callStore = useCallStore.getState();

      if (callStore.chatId === data.chatId) {
        callStore.setCallStatus(CallStatus.CONNECTING);

        // Add the member if not already present
        const existingMember = callStore.callMembers.find(
          (m) => m.memberId === data.fromMemberId
        );

        if (!existingMember) {
          callStore.addCallMember({
            memberId: data.fromMemberId,
          });

          // Create peer connection for direct calls
          if (!callStore.isGroupCall) {
            useP2PCallStore.createPeerConnection(data.fromMemberId);
            console.log(`Created peer connection for ${data.fromMemberId}`);
          }

          toast.info(`${data.fromMemberId} joined the call`);
        }

        // For direct calls, send offer to the accepting member
        if (
          callStore.callStatus === CallStatus.OUTGOING &&
          !callStore.isGroupCall
        ) {
          const pc = useP2PCallStore.getPeerConnection(data.fromMemberId);
          if (!pc) {
            console.error(`No peer connection for ${data.fromMemberId}`);
            return;
          }
          await useP2PCallStore.sendOffer(data.fromMemberId);
        }

        // For group calls, ensure SFU connection
        if (callStore.isGroupCall) {
          const hasSfuConnection = callStore.callMembers.some(
            (member) => member.sfuConnection
          );
          if (!hasSfuConnection) {
            await callStore.createSfuConnection();
          }
        }
      }
    };

    const handleCallRejected = (data: CallActionResponse) => {
      const callStore = useCallStore.getState();

      if (callStore.chatId === data.chatId) {
        if (data.isCallerCancel) {
          callStore.endCall({ isCancel: true });
          toast.info("Call canceled by caller");
        } else {
          callStore.endCall({ isRejected: true });
          toast.info("Call rejected");
        }
      }
    };

    const handleHangUp = (data: CallActionResponse) => {
      const callStore = useCallStore.getState();

      if (callStore.chatId === data.chatId) {
        callStore.removeCallMember(data.fromMemberId);
        toast.info(`${data.fromMemberId} has left the call`);

        // If no members left, end the call
        if (callStore.callMembers.length === 0) {
          callStore.endCall();
        }
      }
    };

    const handleOffer = async ({
      chatId,
      fromMemberId,
      offer,
    }: RtcOfferResponse) => {
      const callStore = useCallStore.getState();
      const chatType = useChatStore.getState().getChatType(chatId);

      if (callStore.chatId !== chatId) return;

      try {
        if (chatType === ChatType.DIRECT && !callStore.isGroupCall) {
          const member = callStore.callMembers.find(
            (m) => m.memberId === fromMemberId
          );

          // ✅ If member doesn't exist OR has no connection, create one
          if (!member || !member.peerConnection) {
            const pc = useP2PCallStore.createPeerConnection(fromMemberId);

            if (!member) {
              callStore.addCallMember({
                memberId: fromMemberId,
                peerConnection: pc,
              });
            } else {
              // Update existing member with new connection
              callStore.updateCallMember({
                memberId: fromMemberId,
                peerConnection: pc,
              });
            }
          }

          // ✅ Now update the connection with the offer
          await useP2PCallStore.updatePeerConnection(fromMemberId, offer);
        }

        callStore.setCallStatus(CallStatus.CONNECTING);
      } catch (err) {
        handleError(err, "Call offer handling failed");
        callStore.endCall();
      }
    };

    const handleAnswer = async (data: RtcAnswerResponse) => {
      console.log("HandleAnswer");
      const callStore = useCallStore.getState();

      // Only handle answers for the current call
      if (callStore.chatId !== data.chatId) return;

      try {
        if (!callStore.isGroupCall) {
          // Direct call - find the peer connection for this member
          const member = callStore.callMembers.find(
            (m) => m.memberId === data.fromMemberId
          );
          if (member?.peerConnection) {
            await member.peerConnection.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
          }
        } else {
          // Group call - use SFU connection
          // Note: In SFU mode, answers should be handled by the SFU connection
          // This might indicate a protocol issue if we're receiving answers in group mode
          console.warn(
            "Received answer in group call mode - this should be handled by SFU"
          );
        }

        callStore.setCallStatus(CallStatus.CONNECTED);
      } catch (err) {
        console.error("Answer handling failed:", err);
        callStore.endCall();
      }
    };

    const handleIceCandidate = (data: IceCandidateResponse) => {
      const callStore = useCallStore.getState();

      // Only handle ICE candidates for the current call
      if (callStore.chatId === data.chatId) {
        console.log("ICE candidate received", data.candidate);
        callStore.addIceCandidate(data.candidate);
      }
    };

    const handleMemberJoined = (data: { chatId: string; memberId: string }) => {
      const callStore = useCallStore.getState();

      if (callStore.chatId === data.chatId) {
        // Check if member already exists to avoid duplicates
        const existingMember = callStore.callMembers.find(
          (m) => m.memberId === data.memberId
        );

        if (!existingMember) {
          // Add the new member to the call
          callStore.addCallMember({
            memberId: data.memberId,
          });

          toast.info(`${data.memberId} joined the call`);
        }

        // If this is the current user joining, set appropriate status
        const currentMemberId = getMyChatMemberId(data.chatId);
        if (
          data.memberId === currentMemberId &&
          callStore.callStatus === CallStatus.CONNECTING
        ) {
          callStore.setCallStatus(CallStatus.CONNECTED);
        }
      }
    };

    // Subscribe to all events
    callWebSocketService.onPendingCalls(handlePendingCalls);
    callWebSocketService.onIncomingCall(handleIncomingCall);
    callWebSocketService.onCallUpdated(handleUpdateCall);
    callWebSocketService.onCallMemberUpdated(handleCallMemberUpdated);
    callWebSocketService.onCallAccepted(handleCallAccepted);
    callWebSocketService.onCallRejected(handleCallRejected);
    callWebSocketService.onHangup(handleHangUp);
    callWebSocketService.onOffer(handleOffer);
    callWebSocketService.onAnswer(handleAnswer);
    callWebSocketService.onIceCandidate(handleIceCandidate);
    callWebSocketService.onMemberJoined(handleMemberJoined);

    // Request pending calls on mount
    callWebSocketService.requestPendingCalls();

    return () => {
      callWebSocketService.removeAllListeners();
    };
  }, []);
}
