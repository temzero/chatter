export type WebSocketEvent = 
  | "connect"
  | "disconnect"
  | "newMessage"
  | "joinChat"
  | "leaveChat"
  | "typingIndicator";

export interface WebSocketConfig {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface WebSocketMessage<T = unknown> {
  event: WebSocketEvent;
  data: T;
}