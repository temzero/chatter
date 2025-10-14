export interface WsEmitChatMemberResponse<T = unknown> {
  payload: T;
  meta?: {
    isMuted?: boolean;
    isSender?: boolean;
  };
}
