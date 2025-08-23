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
        peerConnection: null,
        sfuConnection: null,
        voiceStream: null,
        videoStream: null,
        screenStream: null,
        isMuted: false,
        isVideoEnabled: false,
        isScreenSharing: false,
        joinedAt: Date.now(),
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
        // Update with all possible properties including screen sharing
        callStore.updateCallMember({
          ...data,
        });

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

      // Only proceed if this is for our current call
      if (callStore.chatId === data.chatId) {
        callStore.setStatus(CallStatus.CONNECTING);

        // ✅ ADD THE MEMBER IMMEDIATELY - This is the key fix!
        const existingMember = callStore.callMembers.find(
          (m) => m.memberId === data.fromMemberId
        );

        if (!existingMember) {
          callStore.addCallMember({
            memberId: data.fromMemberId,
            peerConnection: null,
            sfuConnection: null,
            voiceStream: null,
            videoStream: null,
            screenStream: null,
            isMuted: false,
            isVideoEnabled: false,
            isScreenSharing: false,
            joinedAt: Date.now(),
          });

          toast.info(`${data.fromMemberId} joined the call`);
        }

        // For direct calls, send offer to the accepting member
        if (
          callStore.callStatus === CallStatus.OUTGOING &&
          !callStore.isGroupCall
        ) {
          await callStore.sendOffer(data.fromMemberId);
        }

        // For group calls, the SFU connection is handled in acceptCall
        if (callStore.isGroupCall) {
          // Check if any member has an SFU connection
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

      // Only handle offers for the current call
      if (callStore.chatId !== chatId) return;

      try {
        if (chatType === ChatType.DIRECT && !callStore.isGroupCall) {
          // Check if member already exists, if not add them
          const existingMember = callStore.callMembers.find(
            (m) => m.memberId === fromMemberId
          );
          if (!existingMember) {
            callStore.addCallMember({
              memberId: fromMemberId,
              peerConnection: null,
              voiceStream: null,
              videoStream: null,
              screenStream: null,
              isMuted: false,
              isVideoEnabled: false,
              isScreenSharing: false,
            });
          }

          const pc = callStore.createPeerConnection(fromMemberId);

          if (pc.signalingState === "closed") {
            throw new Error("PeerConnection closed");
          }

          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: callStore.isVideoCall,
          });

          await pc.setLocalDescription(answer);
          callWebSocketService.sendAnswer({
            chatId,
            answer,
          });
        } else {
          // Group call with SFU - should not receive offers in group calls
          console.warn(
            "Received offer in group call mode - this should not happen"
          );
        }

        callStore.setStatus(CallStatus.CONNECTING);
      } catch (err) {
        handleError(err, "Call offer handling failed");
        callStore.endCall();
      }
    };

    const handleAnswer = async (data: RtcAnswerResponse) => {
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

        callStore.setStatus(CallStatus.CONNECTED);
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
            peerConnection: null,
            sfuConnection: null,
            voiceStream: null,
            videoStream: null,
            screenStream: null,
            isMuted: false,
            isVideoEnabled: false,
            isScreenSharing: false,
            joinedAt: Date.now(),
          });

          toast.info(`${data.memberId} joined the call`);
        }

        // If this is the current user joining, set appropriate status
        const currentMemberId = getMyChatMemberId(data.chatId);
        if (
          data.memberId === currentMemberId &&
          callStore.callStatus === CallStatus.CONNECTING
        ) {
          callStore.setStatus(CallStatus.CONNECTED);
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
