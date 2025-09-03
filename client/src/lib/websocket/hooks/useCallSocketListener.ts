// hooks/useCallSocketListeners.ts
import { useEffect } from "react";
import { callWebSocketService } from "../services/call.websocket.service";
import { toast } from "react-toastify";
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
import { useCallStore } from "@/stores/callStore/callStore";
import { useP2PCallStore } from "@/stores/callStore/p2pCallStore";
import { useSFUCallStore } from "@/stores/callStore/sfuCallStore";
import { P2PCallMember, SFUCallMember } from "@/types/store/callMember.type";
import { useCallSounds } from "@/hooks/useCallSound";

export function useCallSocketListeners() {
  useCallSounds();

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

      // Add the caller as a member using the abstracted method
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
        // Delegate to appropriate store based on call type
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

    // In your useCallSocketListeners - enhance member handling
    const handleCallAccepted = async (data: CallActionResponse) => {
      const callStore = useCallStore.getState();

      if (callStore.chatId !== data.chatId) return;

      try {
        // Add the accepted member to the call
        callStore.addCallMember({
          memberId: data.fromMemberId,
          // You might want to fetch member details from your backend
        });

        toast.info(`${data.fromMemberId} joined the call`);

        // If this is the first participant joining, update UI state
        callStore.setCallStatus(CallStatus.CONNECTED);
      } catch (err) {
        console.error("Failed to handle call acceptance:", err);
        // Don't end the call entirely for one member failure
        toast.error(`Failed to add ${data.fromMemberId} to call`);
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
      console.log("User hangup", data);
      const callStore = useCallStore.getState();

      if (callStore.chatId === data.chatId) {
        callStore.removeCallMember(data.fromMemberId);
        toast.info(`${data.fromMemberId} has left the call`);
        // If no members left, end the call
        if (callStore.isGroupCall) {
          const sfuMembers = useSFUCallStore.getState().sfuMembers;
          if (sfuMembers.length === 0) {
            callStore.endCall();
          }
        } else {
          const p2pMembers = useP2PCallStore.getState().p2pMembers;
          if (p2pMembers.length === 0) {
            callStore.endCall();
          }
        }
      }
    };

    const handleP2PWebRtcOffer = async ({
      chatId,
      fromMemberId,
      offer,
    }: RtcOfferResponse) => {
      const callStore = useCallStore.getState();
      const chatType = useChatStore.getState().getChatType(chatId);

      if (callStore.chatId !== chatId) return;

      try {
        if (chatType === ChatType.DIRECT && !callStore.isGroupCall) {
          const p2pStore = useP2PCallStore.getState();
          const member = p2pStore.p2pMembers.find(
            (m: P2PCallMember) => m.memberId === fromMemberId
          );

          // ✅ If member doesn't exist OR has no connection, create one
          if (!member || !member.peerConnection) {
            const pc = p2pStore.createPeerConnection(fromMemberId);

            if (!member) {
              p2pStore.addP2PMember({
                memberId: fromMemberId,
                peerConnection: pc,
              });
            } else {
              // Update existing member with new connection
              p2pStore.updateP2PMember({
                memberId: fromMemberId,
                peerConnection: pc,
              });
            }
          }

          // ✅ Now update the connection with the offer
          await p2pStore.updatePeerConnection(fromMemberId, offer);
        }

        callStore.setCallStatus(CallStatus.CONNECTING);
      } catch (err) {
        handleError(err, "Call offer handling failed");
        callStore.endCall();
      }
    };

    const handleP2PWebRtcAnswer = async (data: RtcAnswerResponse) => {
      console.log("HandleAnswer");
      const callStore = useCallStore.getState();

      // Only handle answers for the current call
      if (callStore.chatId !== data.chatId) return;

      try {
        if (!callStore.isGroupCall) {
          // Direct call - handle P2P answer
          const p2pStore = useP2PCallStore.getState();
          const member = p2pStore.p2pMembers.find(
            (m: P2PCallMember) => m.memberId === data.fromMemberId
          );

          if (member?.peerConnection) {
            await member.peerConnection.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
          }
        } else {
          // Group call - SFU should handle answers through its own signaling
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

        if (callStore.isGroupCall) {
          // For SFU calls, handle through SFU store
          console.log("Incoming SFU call - members will be handled by LiveKit");
        } else {
          // For P2P calls, handle through P2P store
          useP2PCallStore.getState().addIceCandidate(data.candidate);
        }
      }
    };

    const handleMemberJoined = (data: { chatId: string; memberId: string }) => {
      const callStore = useCallStore.getState();

      if (callStore.chatId === data.chatId) {
        if (callStore.isGroupCall) {
          // Check if member already exists to avoid duplicates
          const sfuStore = useSFUCallStore.getState();
          const existingMember = sfuStore.sfuMembers.find(
            (m: SFUCallMember) => m.memberId === data.memberId
          );

          if (!existingMember) {
            // Add the new member to the SFU call
            callStore.addCallMember({
              memberId: data.memberId,
            });

            toast.info(`${data.memberId} joined the call`);
          }
        } else {
          // For P2P calls, this shouldn't normally happen
          console.warn("Member joined event received for P2P call");
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
    callWebSocketService.onP2POffer(handleP2PWebRtcOffer);
    callWebSocketService.onP2PAnswer(handleP2PWebRtcAnswer);
    callWebSocketService.onIceCandidate(handleIceCandidate);
    callWebSocketService.onMemberJoined(handleMemberJoined);

    // Request pending calls on mount
    callWebSocketService.requestPendingCalls();

    return () => {
      callWebSocketService.removeAllListeners();
    };
  }, []);
}
