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
  // INITIATE NEW CALL
  // initiateCall(payload: InitiateCallRequest): Promise<CallErrorResponse> {
  //   return new Promise((resolve) => {
  //     webSocketService.emit(
  //       CallEvent.INITIATE_CALL,
  //       payload,
  //       (response: unknown) => {
  //         resolve(response as CallErrorResponse);
  //       }
  //     );
  //   });
  // },

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

  // JOIN CALL
  joinCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.JOIN_CALL, payload);
  },
  onJoinCall(callback: (data: CallActionResponse) => void) {
    webSocketService.on(CallEvent.JOIN_CALL, callback);
  },
  offJoinCall(callback: (data: CallActionResponse) => void) {
    webSocketService.off(CallEvent.JOIN_CALL, callback);
  },

  // CANCEL CALL
  cancelCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.DECLINE_CALL, {
      ...payload,
      isCallerCancel: true,
    });
  },

  // REJECT CALL
  rejectCall(payload: CallActionRequest) {
    webSocketService.emit(CallEvent.DECLINE_CALL, payload);
  },
  onCallRejected(
    callback: (data: CallActionResponse & { isCallerCancel?: boolean }) => void
  ) {
    webSocketService.on(CallEvent.DECLINE_CALL, callback);
  },
  offCallRejected(
    callback: (data: CallActionResponse & { isCallerCancel?: boolean }) => void
  ) {
    webSocketService.off(CallEvent.DECLINE_CALL, callback);
  },

  // HANGUP
  // hangup(payload: CallActionRequest) {
  //   webSocketService.emit(CallEvent.HANG_UP, payload);
  // },
  onHangup(callback: (data: CallActionResponse) => void) {
    webSocketService.on(CallEvent.HANG_UP, callback);
  },
  offHangup(callback: (data: CallActionResponse) => void) {
    webSocketService.off(CallEvent.HANG_UP, callback);
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
