import { webSocketService } from "./websocket.service";
import { CallEvent } from "@/shared/types/enums/websocket-events.enum";
import { WsNotificationResponse } from "@/shared/types/responses/ws-emit-chat-member.response";
import {
  CallActionRequest,
  CallActionResponse,
  UpdateCallPayload,
  IncomingCallResponse,
  CallErrorResponse,
} from "@shared/types/call";

export const callWebSocketService = {
  // INCOMING CALL
  onIncomingCall(
    callback: (data: WsNotificationResponse<IncomingCallResponse>) => void
  ) {
    webSocketService.on(CallEvent.INCOMING_CALL, callback);
  },
  offIncomingCall(
    callback: (data: WsNotificationResponse<CallActionResponse>) => void
  ) {
    webSocketService.off(CallEvent.INCOMING_CALL, callback);
  },

  // START CALL
  onStartCall(
    callback: (data: WsNotificationResponse<UpdateCallPayload>) => void
  ) {
    webSocketService.on(CallEvent.START_CALL, callback);
  },
  offStartCall(
    callback: (data: WsNotificationResponse<UpdateCallPayload>) => void
  ) {
    webSocketService.off(CallEvent.START_CALL, callback);
  },

  // UPDATE CALL
  emitUpdateCall(payload: UpdateCallPayload) {
    webSocketService.emit(CallEvent.UPDATE_CALL, payload);
  },
  onCallUpdated(
    callback: (data: WsNotificationResponse<UpdateCallPayload>) => void
  ) {
    webSocketService.on(CallEvent.UPDATE_CALL, callback);
  },
  offCallUpdated(
    callback: (data: WsNotificationResponse<UpdateCallPayload>) => void
  ) {
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
    callback: (data: WsNotificationResponse<CallActionResponse>) => void
  ) {
    webSocketService.on(CallEvent.DECLINE_CALL, callback);
  },
  offCallDeclined(
    callback: (data: WsNotificationResponse<CallActionResponse>) => void
  ) {
    webSocketService.off(CallEvent.DECLINE_CALL, callback);
  },

  // END CALL
  onCallEnded(
    callback: (data: WsNotificationResponse<UpdateCallPayload>) => void
  ) {
    webSocketService.on(CallEvent.CALL_ENDED, callback);
  },
  offCallEnded(
    callback: (data: WsNotificationResponse<UpdateCallPayload>) => void
  ) {
    webSocketService.off(CallEvent.CALL_ENDED, callback);
  },

  // ERROR
  onCallError(
    callback: (data: WsNotificationResponse<CallErrorResponse>) => void
  ) {
    webSocketService.on(CallEvent.CALL_ERROR, callback);
  },
  offCallError(
    callback: (data: WsNotificationResponse<CallErrorResponse>) => void
  ) {
    webSocketService.off(CallEvent.CALL_ERROR, callback);
  },

  removeAllListeners() {
    const events = [
      CallEvent.INCOMING_CALL,
      CallEvent.START_CALL,
      CallEvent.UPDATE_CALL,
      CallEvent.JOIN_CALL,
      CallEvent.DECLINE_CALL,
      CallEvent.HANG_UP,
      CallEvent.CALL_ENDED,
      CallEvent.CALL_ERROR,
    ];

    events.forEach((event) => webSocketService.off(event));
  },
};
