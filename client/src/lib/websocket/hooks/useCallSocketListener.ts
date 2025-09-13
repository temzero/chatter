// hooks/useCallSocketListeners.ts
import { useEffect } from "react";
import { callWebSocketService } from "../services/call.websocket.service";
import { toast } from "react-toastify";
import { LocalCallStatus } from "@/types/enums/LocalCallStatus";
import { handleError } from "@/utils/handleError";
import { useChatStore } from "@/stores/chatStore";
import { ChatType } from "@/types/enums/ChatType";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { getMyChatMemberId } from "@/stores/chatMemberStore";
import { useCallStore } from "@/stores/callStore/callStore";
import { useP2PCallStore } from "@/stores/callStore/p2pCallStore";
import { useSFUCallStore } from "@/stores/callStore/sfuCallStore";
import { P2PCallMember, SFUCallMember } from "@/types/store/callMember.type";
import { useCallSounds } from "@/hooks/useCallSound";
import {
  CallResponse,
  CallActionResponse,
  RtcOfferResponse,
  RtcAnswerResponse,
  IceCandidateResponse,
  UpdateCallPayload,
  CallMemberPayload,
} from "@/types/callPayload";
import { callService } from "@/services/callService";

export function useCallSocketListeners() {
  useCallSounds();
  useEffect(() => {
    const fetchPendingCalls = async () => {
      try {
        const pendingCalls = await callService.getPendingCalls();

        if (pendingCalls?.length > 0) {
          // ✅ Sort using createdAt instead of old timestamp
          const sortedCalls = [...pendingCalls].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          const mostRecentCall = sortedCalls[0];
          handleIncomingCall(mostRecentCall);

          if (sortedCalls.length > 1) {
            toast.info(`You have ${sortedCalls.length - 1} more missed calls`);
          }
        }
      } catch (error) {
        console.error("Failed to fetch pending calls:", error);
        handleError(error, "Failed to load pending calls");
      }
    };

    const handleIncomingCall = (data: CallResponse) => {
      useCallStore.setState({
        callId: data.callId,
        chatId: data.chatId,
        localCallStatus: LocalCallStatus.INCOMING,
        isVideoCall: data.isVideoCall,
        callerMemberId: data.initiatorId,
        isGroupCall: data.isGroupCall || false,
      });

      useModalStore.getState().openModal(ModalType.CALL);

      if (data.startedAt) {
        toast.info(
          `Incoming ${
            data.isVideoCall ? "video" : "voice"
          } call started at ${new Date(data.startedAt).toLocaleTimeString()}`
        );
      }
    };

    const handleUpdateCall = (data: UpdateCallPayload) => {
      console.log("handleUpdateCall");
      const { callId, isVideoCall } = data;
      const callStore = useCallStore.getState();

      if (callStore.callId === callId) {
        // Update call type and handle stream changes
        useCallStore.setState({ isVideoCall });

        if (isVideoCall && !callStore.isVideoCall) {
          // Use P2P if not group call, SFU if group call
          if (callStore.isGroupCall) {
            // For SFU group calls, video is handled by LiveKit internally
            console.log("SFU call - video will be handled by LiveKit");
          } else {
            // For P2P calls, setup local stream
            callStore
              .setupLocalStream()
              .catch((err) =>
                console.error("Failed to setup video stream:", err)
              );
          }
        }

        if (!isVideoCall && callStore.isVideoCall) {
          // Stop video tracks but keep audio
          if (callStore.isGroupCall) {
            // For SFU calls, toggle video off through LiveKit
            useSFUCallStore
              .getState()
              .toggleVideo()
              .catch((err) =>
                console.error("Failed to disable SFU video:", err)
              );
          } else {
            // For P2P calls, stop video tracks
            useP2PCallStore
              .getState()
              .localVideoStream?.getVideoTracks()
              .forEach((t) => t.stop());
            useP2PCallStore.setState({
              localVideoStream: null,
            });
            useCallStore.setState({
              isVideoEnabled: false,
            });
          }
        }
      }
    };

    const handleCallMemberUpdated = (data: CallMemberPayload) => {
      console.log("handleCallMemberUpdated");
      const callStore = useCallStore.getState();

      if (callStore.callId === data.callId) {
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

    // CALLEE -> CALLER
    const handleCallAccepted = async (data: CallResponse) => {
      console.log("handleCallAccepted");

      const callStore = useCallStore.getState();
      callStore.setCallStatus(LocalCallStatus.CONNECTING);

      if (callStore.chatId !== data.chatId) {
        console.warn("Accepted call does not match current call");
        return;
      }

      // Update call info in store
      useCallStore.setState({
        callId: data.callId,
        chatId: data.chatId,
        isVideoCall: data.isVideoCall,
        isGroupCall: data.isGroupCall,
        callerMemberId: data.initiatorId,
        localCallStatus: LocalCallStatus.CONNECTED,
      });

      if (!data.isGroupCall) {
        try {
          const p2pStore = useP2PCallStore.getState();
          const member = p2pStore.addP2PMember({
            memberId: data.initiatorId,
            peerConnection: p2pStore.createPeerConnection(data.initiatorId),
          });
          if (!member) throw new Error("Failed to register P2P member");
          await p2pStore.sendP2POffer(member.memberId);
        } catch (err) {
          console.error("Failed to handle call acceptance:", err);
          toast.error(`Failed to add ${data.initiatorId} to call`);
        }
      }
    };

    const handleCallRejected = async (data: CallActionResponse) => {
      console.log("handleCallRejected");
      const callStore = useCallStore.getState();

      if (callStore.callId === data.callId) {
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

      if (callStore.callId === data.callId) {
        callStore.removeCallMember(data.memberId);
        toast.info(`${data.memberId} has left the call`);
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

    // CALLER -> CALLEE
    const handleP2PWebRtcOffer = async ({
      callId,
      memberId,
      offer,
    }: RtcOfferResponse) => {
      console.log("CALLEE handleP2PWebRtcOffer");

      const callStore = useCallStore.getState();
      const chatType = useChatStore.getState().getChatType(callId);

      if (callStore.callId !== callId) return;

      try {
        if (chatType === ChatType.DIRECT && !callStore.isGroupCall) {
          const p2pStore = useP2PCallStore.getState();
          const pc = p2pStore.createPeerConnection(memberId);
          p2pStore.addP2PMember({
            memberId: memberId,
            peerConnection: pc,
          });

          // ✅ Now update the connection with the offer
          await p2pStore.updatePeerConnection(memberId, offer);
        }

        callStore.setCallStatus(LocalCallStatus.CONNECTED);
      } catch (err) {
        handleError(err, "Call offer handling failed");
        callStore.endCall();
      }
    };

    // CALLEE -> CALLER
    const handleP2PWebRtcAnswer = async (data: RtcAnswerResponse) => {
      console.log("CALLER handleP2PWebRtcAnswer");

      const callStore = useCallStore.getState();

      if (callStore.callId !== data.callId) return;
      if (callStore.isGroupCall) {
        console.error("Group call is handle via SFU-livekit");
        return;
      }

      try {
        const p2pStore = useP2PCallStore.getState();

        // ✅ Member should already exist (added when offer/accept was processed)
        const member = p2pStore.p2pMembers.find(
          (m: P2PCallMember) => m.memberId === data.memberId
        );

        // ❌ CRITICAL: Member should already exist!
        if (!member) {
          throw new Error(
            `No member found for ${data.memberId} - call flow broken!`
          );
        }

        if (!member.peerConnection) {
          throw new Error(
            `No peer connection for ${data.memberId} - call flow broken!`
          );
        }

        // ✅ USE EXISTING PEER CONNECTION (not a new one!)
        await member.peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        callStore.setCallStatus(LocalCallStatus.CONNECTED);
      } catch (err) {
        console.error("Answer handling failed:", err);
        callStore.endCall();
      }
    };

    const handleIceCandidate = (data: IceCandidateResponse) => {
      console.log("handleIceCandidate");

      const callStore = useCallStore.getState();

      // Only handle ICE candidates for the current call
      if (callStore.callId === data.callId) {
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

    const handleMemberJoined = async (data: {
      chatId: string;
      memberId: string;
    }) => {
      console.log("handleMemberJoined");

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
        const currentMemberId = await getMyChatMemberId(data.chatId);
        if (
          data.memberId === currentMemberId &&
          callStore.localCallStatus === LocalCallStatus.CONNECTING
        ) {
          callStore.setCallStatus(LocalCallStatus.CONNECTED);
        }
      }
    };

    // Subscribe to all events (remove onPendingCalls)
    callWebSocketService.removeAllListeners();
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

    // Fetch pending calls from database on mount
    fetchPendingCalls();

    return () => {
      callWebSocketService.removeAllListeners();
    };
  }, []);
}
