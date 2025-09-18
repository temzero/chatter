import { CallStatus } from "../enums/CallStatus";
import { ChatResponse } from "./chat.response";
import { ChatMember } from "./chatMember.response";

export interface CallResponseDto {
  id: string;

  chat: ChatResponse;

  status: CallStatus;

  isVideoCall: boolean;

  initiator: ChatMember;

  startedAt: Date;
  endedAt?: Date | null;
  updatedAt?: Date | null;
  createdAt: Date;

  participants: ChatMember[];
}
