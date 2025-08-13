// src/calls/dto/call-payload.dto.ts
import { ChatResponseDto } from 'src/modules/chat/dto/responses/chat-response.dto';

export class InitiateCallPayload {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
}

export class IncomingCallPayload {
  chat: ChatResponseDto;
  isVideoCall: boolean;
  isGroupCall: boolean;
  callerId: string;
  timestamp: number;
}

export class CallActionPayload {
  chatId: string;
}

export class CallUserActionPayload {
  chatId: string;
  userId: string;
  timestamp: number;
}

export class RtcOfferPayload {
  chatId: string;
  offer: RTCSessionDescriptionInit;
  senderId: string;
}

export class RtcAnswerPayload {
  chatId: string;
  answer: RTCSessionDescriptionInit;
  senderId: string;
}

export class IceCandidatePayload {
  chatId: string;
  candidate: RTCIceCandidateInit;
  senderId: string;
}
