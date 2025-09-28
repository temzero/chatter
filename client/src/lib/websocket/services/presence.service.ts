import { webSocketService } from "./websocket.service";
import { PresenceEvent } from "../constants/websocket-event.type";
import {
  PresenceInitEvent,
  PresenceUpdateEvent,
} from "../constants/present-payload.type";

export const presenceWebSocketService = {
  subscribe(userIds: string[]) {
    const socket = webSocketService.getSocket();
    socket?.emit(PresenceEvent.SUBSCRIBE, userIds);
  },

  unsubscribe(userIds: string[]) {
    const socket = webSocketService.getSocket();
    socket?.emit(PresenceEvent.UNSUBSCRIBE, userIds);
  },

  onInit(callback: (event: PresenceInitEvent) => void) {
    const handler = (event: PresenceInitEvent) => callback(event);
    webSocketService.on(PresenceEvent.INIT, handler);
    return () => webSocketService.off(PresenceEvent.INIT, handler);
  },

  onUpdate(callback: (event: PresenceUpdateEvent) => void) {
    const handler = (event: PresenceUpdateEvent) => callback(event);
    webSocketService.on(PresenceEvent.UPDATE, handler);
    return () => webSocketService.off(PresenceEvent.UPDATE, handler);
  },

  removeAllListeners() {
    const events = [PresenceEvent.INIT, PresenceEvent.UPDATE];
    events.forEach((event) => webSocketService.off(event));
  },
};
