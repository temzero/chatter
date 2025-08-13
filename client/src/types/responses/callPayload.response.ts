import { ChatResponse } from "@/types/responses/chat.response";

export interface InitiateCallPayload {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
}

export interface IncomingCallPayload {
  chat: ChatResponse;
  isVideoCall: boolean;
  isGroupCall: boolean;
  callerId: string;
  timestamp: number;
}

export interface CallActionPayload {
  chatId: string;
}

export interface CallUserActionPayload {
  chatId: string;
  userId: string;
  timestamp: number;
}

export interface RtcOfferPayload {
  chatId: string;
  offer: RTCSessionDescriptionInit;
  senderId: string;
}

export interface RtcAnswerPayload {
  chatId: string;
  answer: RTCSessionDescriptionInit;
  senderId: string;
}

export interface IceCandidatePayload {
  chatId: string;
  candidate: RTCIceCandidateInit;
  senderId: string;
}
