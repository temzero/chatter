import { webSocketService } from "./websocket.service";
import { CallEvent } from "../constants/websocket-event.type";
import {
  // InitiateCallRequest,
  CallActionRequest,
  CallActionResponse,
  UpdateCallPayload,
  IncomingCallResponse,
  CallErrorResponse,
} from "@/types/callPayload";

export const callWebSocketService = {
  // INCOMING CALL
  onIncomingCall(callback: (data: IncomingCallResponse) => void) {
    webSocketService.on(CallEvent.INCOMING_CALL, callback);
  },
  offIncomingCall(callback: (data: CallActionResponse) => void) {
    webSocketService.off(CallEvent.INCOMING_CALL, callback);
  },

  // START CALL
  onStartCall(callback: (data: UpdateCallPayload) => void) {
    webSocketService.on(CallEvent.START_CALL, callback);
  },
  offStartCall(callback: (data: UpdateCallPayload) => void) {
    webSocketService.off(CallEvent.START_CALL, callback);
  },

  // UPDATE CALL
  onCallUpdated(callback: (data: UpdateCallPayload) => void) {
    webSocketService.on(CallEvent.UPDATE_CALL, callback);
  },
  offCallUpdated(callback: (data: UpdateCallPayload) => void) {
    webSocketService.off(CallEvent.UPDATE_CALL, callback);
  },

  // CANCEL CALL
  cancelCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.DECLINE_CALL, {
      ...payload,
      isCallerCancel: true,
    });
  },

  // REJECT CALL
  declineCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.DECLINE_CALL, payload);
  },
  onCallDeclined(
    callback: (data: CallActionResponse & { isCallerCancel?: boolean }) => void
  ) {
    webSocketService.on(CallEvent.DECLINE_CALL, callback);
  },
  offCallDeclined(
    callback: (data: CallActionResponse & { isCallerCancel?: boolean }) => void
  ) {
    webSocketService.off(CallEvent.DECLINE_CALL, callback);
  },

  // END CALL
  onCallEnded(callback: (data: UpdateCallPayload) => void) {
    webSocketService.on(CallEvent.CALL_ENDED, callback);
  },
  offCallEnded(callback: (data: UpdateCallPayload) => void) {
    webSocketService.off(CallEvent.CALL_ENDED, callback);
  },

  // ERROR
  onCallError(callback: (data: CallErrorResponse) => void) {
    webSocketService.on(CallEvent.CALL_ERROR, callback);
  },
  offCallError(callback: (data: CallErrorResponse) => void) {
    webSocketService.off(CallEvent.CALL_ERROR, callback);
  },

  removeAllListeners() {
    webSocketService.off(CallEvent.INCOMING_CALL);
    webSocketService.off(CallEvent.START_CALL);
    webSocketService.off(CallEvent.UPDATE_CALL);
    webSocketService.off(CallEvent.JOIN_CALL);
    webSocketService.off(CallEvent.DECLINE_CALL);
    webSocketService.off(CallEvent.HANG_UP);
    webSocketService.off(CallEvent.CALL_ENDED);
    webSocketService.off(CallEvent.CALL_ERROR);
  },
};
