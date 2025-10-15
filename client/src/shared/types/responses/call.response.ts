import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { ChatResponse } from "./chat.response";
import { ChatMember } from "./chat-member.response";

export interface CallResponse {
  id: string;
  chat: ChatResponse;
  status: CallStatus;
  isVideoCall: boolean;
  initiator: ChatMember;
  startedAt: Date;
  endedAt?: Date | null;
  updatedAt?: Date | null;
  createdAt: Date;
}
