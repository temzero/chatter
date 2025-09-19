import { webSocketService } from "./websocket.service";
import { CallEvent } from "../constants/websocket-event.type";
import {
  InitiateCallRequest,
  CallActionRequest,
  CallActionResponse,
  UpdateCallPayload,
  IncomingCallResponse,
  CallWebsocketResponse,
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
  // initiateCall(payload: InitiateCallRequest) {
  //   console.log("initiateCall");
  //   webSocketService.emit(CallEvent.INITIATE_CALL, payload);
  // },

  initiateCall(payload: InitiateCallRequest): Promise<CallWebsocketResponse> {
    return new Promise((resolve) => {
      webSocketService.emit(
        CallEvent.INITIATE_CALL,
        payload,
        (response: unknown) => {
          resolve(response as CallWebsocketResponse);
        }
      );
    });
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
  offIncomingCall(callback: (data: CallActionResponse) => void) {
    webSocketService.off(CallEvent.INCOMING_CALL, callback);
  },

  // Update call (BOTH)
  updateCall(payload: UpdateCallPayload) {
    webSocketService.emit(CallEvent.UPDATE_CALL, payload);
  },

  onCallUpdated(callback: (data: UpdateCallPayload) => void) {
    webSocketService.on(CallEvent.UPDATE_CALL, callback);
  },

  offCallUpdated(callback: (data: UpdateCallPayload) => void) {
    webSocketService.off(CallEvent.UPDATE_CALL, callback);
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
   * Reject an incoming call (BOTH)
   */
  rejectCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.DECLINE_CALL, payload);
  },

  /**
   * Cancel an outgoing call before it's accepted (BOTH)
   * (sent as a reject event with `isCallerCancel: true`)
   */
  cancelCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.DECLINE_CALL, {
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
    webSocketService.on(CallEvent.DECLINE_CALL, callback);
  },

  /**
   * Remove call reject listener (BOTH)
   */
  offCallRejected(
    callback: (data: CallActionResponse & { isCallerCancel?: boolean }) => void
  ) {
    webSocketService.off(CallEvent.DECLINE_CALL, callback);
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

  // ========================
  // 🛠️ Utility Methods
  // ========================

  /**
   * Remove all call listeners
   */
  removeAllListeners() {
    // Call lifecycle events (BOTH)
    webSocketService.off(CallEvent.INCOMING_CALL);
    webSocketService.off(CallEvent.UPDATE_CALL);
    webSocketService.off(CallEvent.ACCEPT_CALL);
    webSocketService.off(CallEvent.JOIN_CALL);
    webSocketService.off(CallEvent.DECLINE_CALL);
    webSocketService.off(CallEvent.HANG_UP);
  },
};
