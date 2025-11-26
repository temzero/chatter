export interface WsNotificationResponse<T = unknown> {
  payload: T;
  meta?: {
    isMuted?: boolean;
    isSender?: boolean;
  };
}
