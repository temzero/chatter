import { webSocketService } from "./websocket.service";

export type PresenceStatusMap = Record<string, boolean>;

export type PresenceInitEvent = {
  statuses: PresenceStatusMap;
  subscribedCount: number;
  serverTime: string;
};

export type PresenceUpdateEvent = {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
};

export const enum PresenceEvent {
  INIT = "presence:init",
  UPDATE = "presence:update",
  SUBSCRIBE = "presence:subscribe",
  UNSUBSCRIBE = "presence:unsubscribe"
}

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
};
