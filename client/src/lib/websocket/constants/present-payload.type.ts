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
