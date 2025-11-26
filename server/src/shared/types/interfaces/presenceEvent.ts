// shared/presence.types.ts
export interface PresenceStatusMap {
  [key: string]: boolean;
}

export interface PresenceInitEvent {
  statuses: PresenceStatusMap;
  subscribedCount: number;
  serverTime: string;
}

export interface PresenceUpdateEvent {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

export type PresenceEvent = PresenceInitEvent | PresenceUpdateEvent;
