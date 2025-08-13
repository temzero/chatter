import { webSocketService } from "./websocket.service";
import { CallEvent } from "../constants/websocket-event.type";
import {
  InitiateCallPayload,
  IncomingCallPayload,
  CallActionPayload,
  CallUserActionPayload,
  RtcOfferPayload,
  RtcAnswerPayload,
  IceCandidatePayload,
} from "@/types/responses/callPayload.response";
import { toast } from "react-toastify";

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
  initiateCall(payload: InitiateCallPayload) {
    toast.info(`Initiating ${payload.isVideoCall ? "video" : "voice"} call...`);
    webSocketService.emit(CallEvent.INITIATE_CALL, payload);
  },

  /**
   * Listen for incoming calls
   */
  onIncomingCall(callback: (data: IncomingCallPayload) => void) {
    webSocketService.on(CallEvent.INCOMING_CALL, callback);
  },

  /**
   * Remove incoming call listener
   */
  offIncomingCall(callback: (data: IncomingCallPayload) => void) {
    webSocketService.off(CallEvent.INCOMING_CALL, callback);
  },

  /**
   * Accept an incoming call
   */
  acceptCall(payload: CallActionPayload) {
    webSocketService.emit(CallEvent.ACCEPT_CALL, payload);
  },

  /**
   * Listen for call accept events
   */
  onCallAccepted(callback: (data: CallUserActionPayload) => void) {
    webSocketService.on(CallEvent.ACCEPT_CALL, callback);
  },

  /**
   * Remove call accept listener
   */
  offCallAccepted(callback: (data: CallUserActionPayload) => void) {
    webSocketService.off(CallEvent.ACCEPT_CALL, callback);
  },

  /**
   * Reject an incoming call
   */
  rejectCall(payload: CallActionPayload) {
    webSocketService.emit(CallEvent.REJECT_CALL, payload);
  },

  /**
   * Listen for call reject events
   */
  onCallRejected(callback: (data: CallUserActionPayload) => void) {
    webSocketService.on(CallEvent.REJECT_CALL, callback);
  },

  /**
   * Remove call reject listener
   */
  offCallRejected(callback: (data: CallUserActionPayload) => void) {
    webSocketService.off(CallEvent.REJECT_CALL, callback);
  },

  /**
   * End an ongoing call
   */
  endCall(payload: CallActionPayload) {
    webSocketService.emit(CallEvent.END_CALL, payload);
  },

  /**
   * Listen for call end events
   */
  onCallEnded(callback: (data: CallUserActionPayload) => void) {
    webSocketService.on(CallEvent.END_CALL, callback);
  },

  /**
   * Remove call end listener
   */
  offCallEnded(callback: (data: CallUserActionPayload) => void) {
    webSocketService.off(CallEvent.END_CALL, callback);
  },

  // ============================
  // 📶 WebRTC Signaling Methods
  // ============================

  /**
   * Send WebRTC offer
   */
  sendOffer(payload: RtcOfferPayload) {
    webSocketService.emit(CallEvent.OFFER_SDP, payload);
  },

  /**
   * Listen for WebRTC offers
   */
  onOffer(callback: (data: RtcOfferPayload) => void) {
    webSocketService.on(CallEvent.OFFER_SDP, callback);
  },

  /**
   * Remove offer listener
   */
  offOffer(callback: (data: RtcOfferPayload) => void) {
    webSocketService.off(CallEvent.OFFER_SDP, callback);
  },

  /**
   * Send WebRTC answer
   */
  sendAnswer(payload: RtcAnswerPayload) {
    webSocketService.emit(CallEvent.ANSWER_SDP, payload);
  },

  /**
   * Listen for WebRTC answers
   */
  onAnswer(callback: (data: RtcAnswerPayload) => void) {
    webSocketService.on(CallEvent.ANSWER_SDP, callback);
  },

  /**
   * Remove answer listener
   */
  offAnswer(callback: (data: RtcAnswerPayload) => void) {
    webSocketService.off(CallEvent.ANSWER_SDP, callback);
  },

  /**
   * Send ICE candidate
   */
  sendIceCandidate(payload: IceCandidatePayload) {
    webSocketService.emit(CallEvent.ICE_CANDIDATE, payload);
  },

  /**
   * Listen for ICE candidates
   */
  onIceCandidate(callback: (data: IceCandidatePayload) => void) {
    webSocketService.on(CallEvent.ICE_CANDIDATE, callback);
  },

  /**
   * Remove ICE candidate listener
   */
  offIceCandidate(callback: (data: IceCandidatePayload) => void) {
    webSocketService.off(CallEvent.ICE_CANDIDATE, callback);
  },

  /**
   * @deprecated Use onOffer instead
   * Listen for WebRTC offers (legacy method)
   */
  onRtcOffer(callback: (data: RtcOfferPayload) => void) {
    webSocketService.on(CallEvent.OFFER_SDP, callback);
  },

  /**
   * @deprecated Use offOffer instead
   * Remove RTC offer listener (legacy method)
   */
  offRtcOffer(callback: (data: RtcOfferPayload) => void) {
    webSocketService.off(CallEvent.OFFER_SDP, callback);
  },

  /**
   * @deprecated Use onAnswer instead
   * Listen for WebRTC answers (legacy method)
   */
  onRtcAnswer(callback: (data: RtcAnswerPayload) => void) {
    webSocketService.on(CallEvent.ANSWER_SDP, callback);
  },

  /**
   * @deprecated Use offAnswer instead
   * Remove RTC answer listener (legacy method)
   */
  offRtcAnswer(callback: (data: RtcAnswerPayload) => void) {
    webSocketService.off(CallEvent.ANSWER_SDP, callback);
  },

  // ========================
  // 🛠️ Utility Methods
  // ========================

  /**
   * Remove all call listeners
   */
  removeAllListeners() {
    webSocketService.off(CallEvent.INCOMING_CALL);
    webSocketService.off(CallEvent.ACCEPT_CALL);
    webSocketService.off(CallEvent.REJECT_CALL);
    webSocketService.off(CallEvent.END_CALL);
    webSocketService.off(CallEvent.OFFER_SDP);
    webSocketService.off(CallEvent.ANSWER_SDP);
    webSocketService.off(CallEvent.ICE_CANDIDATE);
  },
};
