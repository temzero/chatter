import { webSocketService } from "./websocket.service";
import { CallEvent } from "../constants/websocket-event.type";
import {
  InitiateCallRequest,
  CallActionRequest,
  RtcOfferRequest,
  IncomingCallResponse,
  CallActionResponse,
  RtcAnswerResponse,
  IceCandidateRequest,
  IceCandidateResponse,
  RtcOfferResponse,
  RtcAnswerRequest,
  updateCallPayload,
  callMemberPayload,
} from "@/types/callPayload";

/**
 * Service for handling call-related WebSocket communications
 */
export const callWebSocketService = {
  // ========================
  // 📞 Call Lifecycle Methods (USED BY BOTH P2P & SFU)
  // ========================

  /**
   * Initiate a new call (BOTH)
   */
  initiateCall(payload: InitiateCallRequest) {
    webSocketService.emit(CallEvent.INITIATE_CALL, payload);
  },

  requestPendingCalls() {
    webSocketService.emit(CallEvent.PENDING_CALLS);
  },

  onPendingCalls(callback: (data: IncomingCallResponse[]) => void): void {
    webSocketService.on(CallEvent.PENDING_CALLS, callback);
  },

  /**
   * Listen for incoming calls (BOTH)
   */
  onIncomingCall(callback: (data: IncomingCallResponse) => void) {
    webSocketService.on(CallEvent.INCOMING_CALL, callback);
  },

  /**
   * Remove incoming call listener (BOTH)
   */
  offIncomingCall(callback: (data: IncomingCallResponse) => void) {
    webSocketService.off(CallEvent.INCOMING_CALL, callback);
  },

  // Update call (BOTH)
  updateCall(payload: updateCallPayload) {
    webSocketService.emit(CallEvent.UPDATE_CALL, payload);
  },

  onCallUpdated(callback: (data: updateCallPayload) => void) {
    webSocketService.on(CallEvent.UPDATE_CALL, callback);
  },

  offCallUpdated(callback: (data: updateCallPayload) => void) {
    webSocketService.off(CallEvent.UPDATE_CALL, callback);
  },

  // Update call member (BOTH)
  updateCallMember(payload: callMemberPayload) {
    webSocketService.emit(CallEvent.UPDATE_CALL_MEMBER, payload);
  },

  onCallMemberUpdated(callback: (data: callMemberPayload) => void) {
    webSocketService.on(CallEvent.UPDATE_CALL_MEMBER, callback);
  },

  offCallMemberUpdated(callback: (data: callMemberPayload) => void) {
    webSocketService.off(CallEvent.UPDATE_CALL_MEMBER, callback);
  },

  /**
   * Accept an incoming call (BOTH)
   */
  acceptCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.ACCEPT_CALL, payload);
  },

  /**
   * Listen for call accept events (BOTH)
   */
  onCallAccepted(callback: (data: CallActionResponse) => void) {
    webSocketService.on(CallEvent.ACCEPT_CALL, callback);
  },

  /**
   * Remove call accept listener (BOTH)
   */
  offCallAccepted(callback: (data: CallActionResponse) => void) {
    webSocketService.off(CallEvent.ACCEPT_CALL, callback);
  },

  // Join call (PRIMARILY SFU, but technically BOTH)
  joinCall(payload: { chatId: string }) {
    webSocketService.emit(CallEvent.JOIN_CALL, payload);
  },

  /**
   * Listen for member join events (PRIMARILY SFU)
   */
  onMemberJoined(
    callback: (data: { chatId: string; memberId: string }) => void
  ) {
    webSocketService.on(CallEvent.JOIN_CALL, callback);
  },

  /**
   * Remove member join listener (PRIMARILY SFU)
   */
  offMemberJoined(
    callback: (data: { chatId: string; memberId: string }) => void
  ) {
    webSocketService.off(CallEvent.JOIN_CALL, callback);
  },

  /**
   * Reject an incoming call (BOTH)
   */
  rejectCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.REJECT_CALL, payload);
  },

  /**
   * Cancel an outgoing call before it's accepted (BOTH)
   * (sent as a reject event with `isCallerCancel: true`)
   */
  cancelCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.REJECT_CALL, {
      ...payload,
      isCallerCancel: true,
    });
  },

  /**
   * Listen for call reject events (BOTH)
   */
  onCallRejected(
    callback: (data: CallActionResponse & { isCallerCancel?: boolean }) => void
  ) {
    webSocketService.on(CallEvent.REJECT_CALL, callback);
  },

  /**
   * Remove call reject listener (BOTH)
   */
  offCallRejected(
    callback: (data: CallActionResponse & { isCallerCancel?: boolean }) => void
  ) {
    webSocketService.off(CallEvent.REJECT_CALL, callback);
  },

  /**
   * Hang up from an ongoing call (BOTH)
   */
  hangup(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.HANG_UP, payload);
  },

  /**
   * Listen for hangup events (BOTH)
   */
  onHangup(callback: (data: CallActionResponse) => void) {
    webSocketService.on(CallEvent.HANG_UP, callback);
  },

  /**
   * Remove hangup listener (BOTH)
   */
  offHangup(callback: (data: CallActionResponse) => void) {
    webSocketService.off(CallEvent.HANG_UP, callback);
  },

  // ============================
  // 📶 WebRTC Signaling Methods (PRIMARILY P2P)
  // ============================

  /**
   * Send WebRTC offer (P2P)
   */
  sendP2POffer(payload: RtcOfferRequest) {
    webSocketService.emit(CallEvent.P2P_OFFER_SDP, payload);
  },

  /**
   * Listen for WebRTC offers (P2P)
   */
  onP2POffer(callback: (data: RtcOfferResponse) => void) {
    webSocketService.on(CallEvent.P2P_OFFER_SDP, callback);
  },

  /**
   * Remove offer listener (P2P)
   */
  offP2POffer(callback: (data: RtcOfferResponse) => void) {
    webSocketService.off(CallEvent.P2P_OFFER_SDP, callback);
  },

  /**
   * Send WebRTC answer (P2P)
   */
  sendP2PAnswer(payload: RtcAnswerRequest) {
    webSocketService.emit(CallEvent.P2P_ANSWER_SDP, payload);
  },

  /**
   * Listen for WebRTC answers (P2P)
   */
  onP2PAnswer(callback: (data: RtcAnswerResponse) => void) {
    webSocketService.on(CallEvent.P2P_ANSWER_SDP, callback);
  },

  /**
   * Remove answer listener (P2P)
   */
  offP2PAnswer(callback: (data: RtcAnswerResponse) => void) {
    webSocketService.off(CallEvent.P2P_ANSWER_SDP, callback);
  },

  /**
   * Send ICE candidate (P2P)
   */
  sendIceCandidate(payload: IceCandidateRequest) {
    webSocketService.emit(CallEvent.ICE_CANDIDATE, payload);
  },

  /**
   * Listen for ICE candidates (P2P)
   */
  onIceCandidate(callback: (data: IceCandidateResponse) => void) {
    webSocketService.on(CallEvent.ICE_CANDIDATE, callback);
  },

  /**
   * Remove ICE candidate listener (P2P)
   */
  offIceCandidate(callback: (data: IceCandidateResponse) => void) {
    webSocketService.off(CallEvent.ICE_CANDIDATE, callback);
  },

  // ========================
  // 🛠️ Utility Methods
  // ========================

  /**
   * Remove all call listeners
   */
  removeAllListeners() {
    // Call lifecycle events (BOTH)
    webSocketService.off(CallEvent.INCOMING_CALL);
    webSocketService.off(CallEvent.PENDING_CALLS);
    webSocketService.off(CallEvent.UPDATE_CALL);
    webSocketService.off(CallEvent.UPDATE_CALL_MEMBER);
    webSocketService.off(CallEvent.ACCEPT_CALL);
    webSocketService.off(CallEvent.JOIN_CALL);
    webSocketService.off(CallEvent.REJECT_CALL);
    webSocketService.off(CallEvent.HANG_UP);

    // WebRTC signaling events (P2P + SFU)
    webSocketService.off(CallEvent.P2P_OFFER_SDP); // P2P
    webSocketService.off(CallEvent.P2P_ANSWER_SDP); // P2P
    webSocketService.off(CallEvent.ICE_CANDIDATE); // P2P
    webSocketService.off(CallEvent.SFU_ICE_CANDIDATE); // SFU
  },
};
