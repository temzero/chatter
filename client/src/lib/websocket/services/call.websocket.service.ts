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
  // 📞 Call Lifecycle Methods
  // ========================

  /**
   * Initiate a new call
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
   * Listen for incoming calls
   */
  onIncomingCall(callback: (data: IncomingCallResponse) => void) {
    webSocketService.on(CallEvent.INCOMING_CALL, callback);
  },

  /**
   * Remove incoming call listener
   */
  offIncomingCall(callback: (data: IncomingCallResponse) => void) {
    webSocketService.off(CallEvent.INCOMING_CALL, callback);
  },

  // First, add to your callWebSocketService.ts
  updateCall(payload: updateCallPayload) {
    webSocketService.emit(CallEvent.UPDATE_CALL, payload);
  },

  onCallUpdated(callback: (data: updateCallPayload) => void) {
    webSocketService.on(CallEvent.UPDATE_CALL, callback);
  },

  offCallUpdated(callback: (data: updateCallPayload) => void) {
    webSocketService.off(CallEvent.UPDATE_CALL, callback);
  },

  // Update call member
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
   * Accept an incoming call
   */
  acceptCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.ACCEPT_CALL, payload);
  },

  /**
   * Listen for call accept events
   */
  onCallAccepted(callback: (data: CallActionResponse) => void) {
    webSocketService.on(CallEvent.ACCEPT_CALL, callback);
  },

  /**
   * Remove call accept listener
   */
  offCallAccepted(callback: (data: CallActionResponse) => void) {
    webSocketService.off(CallEvent.ACCEPT_CALL, callback);
  },

  joinCall(payload: { chatId: string }) {
    webSocketService.emit(CallEvent.JOIN_CALL, payload);
  },

  /**
   * Listen for member join events
   */
  onMemberJoined(
    callback: (data: { chatId: string; memberId: string }) => void
  ) {
    webSocketService.on(CallEvent.JOIN_CALL, callback);
  },

  /**
   * Remove member join listener
   */
  offMemberJoined(
    callback: (data: { chatId: string; memberId: string }) => void
  ) {
    webSocketService.off(CallEvent.JOIN_CALL, callback);
  },

  /**
   * Reject an incoming call
   */
  rejectCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.REJECT_CALL, payload);
  },

  /**
   * Cancel an outgoing call before it's accepted
   * (sent as a reject event with `isCallerCancel: true`)
   */
  cancelCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.REJECT_CALL, {
      ...payload,
      isCallerCancel: true,
    });
  },

  /**
   * Listen for call reject events
   */
  onCallRejected(
    callback: (data: CallActionResponse & { isCallerCancel?: boolean }) => void
  ) {
    webSocketService.on(CallEvent.REJECT_CALL, callback);
  },

  /**
   * Remove call reject listener
   */
  offCallRejected(
    callback: (data: CallActionResponse & { isCallerCancel?: boolean }) => void
  ) {
    webSocketService.off(CallEvent.REJECT_CALL, callback);
  },

  /**
   * Hang up from an ongoing call (one user leaves)
   */
  hangup(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.HANG_UP, payload);
  },

  /**
   * Listen for hangup events (when a participant leaves)
   */
  onHangup(callback: (data: CallActionResponse) => void) {
    webSocketService.on(CallEvent.HANG_UP, callback);
  },

  /**
   * Remove hangup listener
   */
  offHangup(callback: (data: CallActionResponse) => void) {
    webSocketService.off(CallEvent.HANG_UP, callback);
  },

  // ============================
  // 📶 WebRTC Signaling Methods
  // ============================

  /**
   * Send WebRTC offer
   */
  sendOffer(payload: RtcOfferRequest) {
    webSocketService.emit(CallEvent.OFFER_SDP, payload);
  },

  /**
   * Listen for WebRTC offers
   */
  onOffer(callback: (data: RtcOfferResponse) => void) {
    webSocketService.on(CallEvent.OFFER_SDP, callback);
  },

  /**
   * Remove offer listener
   */
  offOffer(callback: (data: RtcOfferResponse) => void) {
    webSocketService.off(CallEvent.OFFER_SDP, callback);
  },

  /**
   * Send WebRTC answer
   */
  sendAnswer(payload: RtcAnswerRequest) {
    webSocketService.emit(CallEvent.ANSWER_SDP, payload);
  },

  /**
   * Listen for WebRTC answers
   */
  onAnswer(callback: (data: RtcAnswerResponse) => void) {
    webSocketService.on(CallEvent.ANSWER_SDP, callback);
  },

  /**
   * Remove answer listener
   */
  offAnswer(callback: (data: RtcAnswerResponse) => void) {
    webSocketService.off(CallEvent.ANSWER_SDP, callback);
  },

  /**
   * Send ICE candidate
   */
  sendIceCandidate(payload: IceCandidateRequest) {
    webSocketService.emit(CallEvent.ICE_CANDIDATE, payload);
  },

  /**
   * Listen for ICE candidates
   */
  onIceCandidate(callback: (data: IceCandidateResponse) => void) {
    webSocketService.on(CallEvent.ICE_CANDIDATE, callback);
  },

  /**
   * Remove ICE candidate listener
   */
  offIceCandidate(callback: (data: IceCandidateResponse) => void) {
    webSocketService.off(CallEvent.ICE_CANDIDATE, callback);
  },

  /**
   * @deprecated Use onOffer instead
   * Listen for WebRTC offers (legacy method)
   */
  onRtcOffer(callback: (data: RtcOfferResponse) => void) {
    webSocketService.on(CallEvent.OFFER_SDP, callback);
  },

  /**
   * @deprecated Use offOffer instead
   * Remove RTC offer listener (legacy method)
   */
  offRtcOffer(callback: (data: RtcOfferResponse) => void) {
    webSocketService.off(CallEvent.OFFER_SDP, callback);
  },

  /**
   * @deprecated Use onAnswer instead
   * Listen for WebRTC answers (legacy method)
   */
  onRtcAnswer(callback: (data: RtcAnswerResponse) => void) {
    webSocketService.on(CallEvent.ANSWER_SDP, callback);
  },

  /**
   * @deprecated Use offAnswer instead
   * Remove RTC answer listener (legacy method)
   */
  offRtcAnswer(callback: (data: RtcAnswerResponse) => void) {
    webSocketService.off(CallEvent.ANSWER_SDP, callback);
  },

  // SFU ICE Candidate methods
  sendSfuIceCandidate(payload: IceCandidateRequest) {
    webSocketService.emit(CallEvent.SFU_ICE_CANDIDATE, payload);
  },

  onSfuIceCandidate(callback: (data: IceCandidateResponse) => void) {
    webSocketService.on(CallEvent.SFU_ICE_CANDIDATE, callback);
  },

  offSfuIceCandidate(callback: (data: IceCandidateResponse) => void) {
    webSocketService.off(CallEvent.SFU_ICE_CANDIDATE, callback);
  },

  // ========================
  // 🛠️ Utility Methods
  // ========================

  /**
   * Remove all call listeners
   */
  removeAllListeners() {
    // Call lifecycle events
    webSocketService.off(CallEvent.INCOMING_CALL);
    webSocketService.off(CallEvent.PENDING_CALLS);
    webSocketService.off(CallEvent.UPDATE_CALL);
    webSocketService.off(CallEvent.UPDATE_CALL_MEMBER);
    webSocketService.off(CallEvent.ACCEPT_CALL);
    webSocketService.off(CallEvent.JOIN_CALL);
    webSocketService.off(CallEvent.REJECT_CALL);
    webSocketService.off(CallEvent.HANG_UP);

    // WebRTC signaling events
    webSocketService.off(CallEvent.OFFER_SDP);
    webSocketService.off(CallEvent.ANSWER_SDP);
    webSocketService.off(CallEvent.ICE_CANDIDATE);
    webSocketService.off(CallEvent.SFU_ICE_CANDIDATE);
  },
};
