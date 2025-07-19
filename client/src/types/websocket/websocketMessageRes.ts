import { MessageResponse } from "../responses/message.response";

export interface WsMessageResponse extends MessageResponse {
  meta?: {
    isMuted?: boolean;
    isOwnMessage?: boolean;
  };
}
