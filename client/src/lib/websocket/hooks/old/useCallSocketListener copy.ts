// import { useEffect } from "react";
// import { callWebSocketService } from "../services/call.websocket.service";
// import { toast } from "react-toastify";
// import { useCallStore } from "@/stores/callStore";
// import { CallStatus } from "@/types/enums/CallStatus";
// import {
//   IncomingCallResponse,
//   CallActionResponse,
//   RtcOfferResponse,
//   RtcAnswerResponse,
//   IceCandidateResponse,
//   updateCallPayload,
// } from "@/types/callPayload";
// import { getMyChatMemberId } from "@/stores/chatMemberStore";
// import { handleError } from "@/utils/handleError";
// import { useChatStore } from "@/stores/chatStore";
// import { ChatType } from "@/types/enums/ChatType";

// export function useCallSocketListeners() {
//   useEffect(() => {
//     const handlePendingCalls = (data: {
//       pendingCalls: IncomingCallResponse[];
//     }) => {
//       if (data.pendingCalls && data.pendingCalls.length > 0) {
//         // Sort by timestamp to get the most recent call first
//         const sortedCalls = [...data.pendingCalls].sort(
//           (a, b) => b.timestamp - a.timestamp
//         );

//         // Handle the most recent call
//         const mostRecentCall = sortedCalls[0];
//         handleIncomingCall(mostRecentCall);

//         // Show notification for other missed calls
//         if (sortedCalls.length > 1) {
//           toast.info(`You have ${sortedCalls.length - 1} more missed calls`);
//         }
//       }
//     };

//     const handleIncomingCall = (data: IncomingCallResponse) => {
//       const myMemberId = getMyChatMemberId(data.chatId);

//       if (data.fromMemberId === myMemberId) return;
//       useCallStore.getState().setIncomingCall(data);

//       useCallStore
//         .getState()
//         .openCall(data.chatId, data.isVideoCall, CallStatus.INCOMING);

//       toast.info(`Incoming ${data.isVideoCall ? "video" : "voice"} call`);
//     };

//     const handleUpdateCall = (data: updateCallPayload) => {
//       const { chatId, isVideoCall } = data;
//       const currentState = useCallStore.getState();

//       // Only update if it's for the current active call
//       if (currentState.chatId === chatId) {
//         useCallStore.setState({
//           isVideoCall,
//           // Update any other relevant state here
//         });

//         // If switching to video, we might need to setup local stream
//         if (isVideoCall && !currentState.isVideoCall) {
//           currentState.setupLocalStream().catch((error) => {
//             console.error("Failed to setup video stream:", error);
//           });
//         }

//         // If switching to audio, stop video tracks
//         if (!isVideoCall && currentState.isVideoCall) {
//           currentState.localStream
//             ?.getVideoTracks()
//             .forEach((track) => track.stop());
//         }
//       }
//     };

//     const handleCallAccepted = async (data: CallActionResponse) => {
//       const myMemberId = getMyChatMemberId(data.chatId);

//       if (data.fromMemberId === myMemberId) return;

//       const store = useCallStore.getState();
//       store.setCallStatus(CallStatus.CONNECTING);

//       const currentStatus = store.callStatus;
//       if (currentStatus === CallStatus.OUTGOING) {
//         await store.sendOffer(data.fromMemberId);
//       }
//     };

//     const handleCallRejected = (data: CallActionResponse) => {
//       const myMemberId = getMyChatMemberId(data.chatId);

//       if (data.fromMemberId === myMemberId) return;
//       if (data.isCallerCancel) {
//         useCallStore.getState().endCall(true);
//         toast.info("Call canceled by caller");
//       } else {
//         useCallStore.getState().endCall(false, true);
//         toast.info("Call rejected");
//       }
//     };

//     const handleCallEnded = (data: CallActionResponse) => {
//       console.log("Call ended or member left", data);

//       // Check if this is a group call and the action is from another member
//       if (data.fromMemberId !== getMyChatMemberId(data.chatId)) {
//         // Just remove this member's connection
//         useCallStore.getState().removeParticipantFromCall(data.fromMemberId);
//         toast.info(`${data.fromMemberId} has left the call`);
//       } else {
//         // It's either a direct call or our own leave action - end the full call
//         useCallStore.getState().endCall();
//         toast.info("Call ended");
//       }
//     };

//     // In useCallSocketListeners.ts - Modified handlers
//     const handleOffer = async ({
//       chatId,
//       fromMemberId,
//       offer,
//     }: RtcOfferResponse) => {
//       const store = useCallStore.getState();
//       const chatType = useChatStore.getState().getChatType(chatId);

//       try {
//         if (chatType === ChatType.DIRECT) {
//           // P2P Call
//           const pc =
//             store.peerConnections[fromMemberId] ||
//             store.createPeerConnection(fromMemberId);

//           if (pc.signalingState === "closed")
//             throw new Error("PeerConnection closed");

//           await pc.setRemoteDescription(new RTCSessionDescription(offer));
//           const answer = await pc.createAnswer({
//             offerToReceiveAudio: true,
//             offerToReceiveVideo: store.isVideoCall,
//           });

//           await pc.setLocalDescription(answer);
//           callWebSocketService.sendAnswer({
//             chatId,
//             answer,
//           });
//         } else {
//           // SFU Call
//           if (!store.sfuConnection) {
//             store.sfuConnection = new RTCPeerConnection({
//               iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//             });
//             store.sfuConnection.onicecandidate = (e) =>
//               e.candidate &&
//               callWebSocketService.sendIceCandidate({
//                 chatId,
//                 candidate: e.candidate.toJSON(),
//               });
//           }

//           await store.sfuConnection.setRemoteDescription(offer);
//         }

//         store.setCallStatus(CallStatus.CONNECTING);
//       } catch (err) {
//         handleError(err, "Call offer handling failed");
//         store.endCall();
//       }
//     };

//     const handleAnswer = async (data: RtcAnswerResponse) => {
//       const store = useCallStore.getState();
//       const chatType = useChatStore.getState().getChatType(data.chatId);

//       try {
//         if (chatType === ChatType.DIRECT) {
//           const pc = store.peerConnections[data.fromMemberId];
//           if (pc) {
//             await pc.setRemoteDescription(
//               new RTCSessionDescription(data.answer)
//             );
//           }
//         } else {
//           await store.sfuConnection?.setRemoteDescription(
//             new RTCSessionDescription(data.answer)
//           );
//         }
//         store.setCallStatus(CallStatus.CONNECTED);
//       } catch (error) {
//         console.error("Answer handling failed:", error);
//         store.endCall();
//       }
//     };

//     const handleIceCandidate = (data: IceCandidateResponse) => {
//       console.log("ICE candidate received", data.candidate);
//       useCallStore.getState().addIceCandidate(data.candidate);
//     };

//     // Subscribe to call events
//     callWebSocketService.onIncomingCall(handleIncomingCall);
//     callWebSocketService.onCallTypeUpdated(handleUpdateCall);
//     callWebSocketService.onCallAccepted(handleCallAccepted);
//     callWebSocketService.onCallRejected(handleCallRejected);
//     callWebSocketService.onCallEnded(handleCallEnded);
//     callWebSocketService.onOffer(handleOffer);
//     callWebSocketService.onAnswer(handleAnswer);
//     callWebSocketService.onIceCandidate(handleIceCandidate);
//     callWebSocketService.onPendingCalls(handlePendingCalls);
//     // Check for pending calls when the component mounts
//     callWebSocketService.requestPendingCalls();

//     return () => {
//       callWebSocketService.removeAllListeners();
//     };
//   }, []);
// }
