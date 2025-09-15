import { CallStatus } from "./enums/CallStatus";
import { ChatResponse } from "./responses/chat.response";
import { ChatMember } from "./responses/chatMember.response";
// -------------------- Requests --------------------

export interface InitiateCallRequest {
  chatId: string; // still needed: call always starts in a chat
  isVideoCall: boolean;
  isGroupCall: boolean;
}

export interface UpdateCallPayload {
  callId: string; // ✅ identify call session
  chatId: string;
  isVideoCall?: boolean;
  callStatus?: CallStatus;
}

export interface CallMemberPayload {
  callId: string;
  chatId: string;
  memberId: string;
  isVideoEnabled?: boolean;
  isMuted?: boolean;
  isScreenSharing?: boolean;
}

export interface CallActionRequest {
  callId: string; // ✅ session-level action
  chatId: string;
  memberId?: string; // who performs the action
  isCallerCancel?: boolean;
}

// RTC / SFU signaling
export interface RtcOfferRequest {
  callId: string; // ✅ scoped to call
  chatId: string;
  offer: RTCSessionDescriptionInit;
}

export interface RtcAnswerRequest {
  callId: string; // ✅ scoped to call
  chatId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateRequest {
  callId: string; // ✅ scoped to call
  chatId: string;
  candidate: RTCIceCandidateInit;
}

// -------------------- Responses --------------------

export interface CallResponse {
  id: string; // server sends "id"
  chat: ChatResponse;
  status: CallStatus;
  isVideoCall: boolean;
  isGroupCall: boolean;
  initiator: ChatMember;
  startedAt: string; // ISO string
  endedAt?: string | null;
  updatedAt?: string;
  createdAt: string;
  participants: ChatMember[];
}

export interface CallActionResponse {
  callId: string; // ✅ main key
  memberId: string;
  status?: CallStatus;
  createdAt?: string;
  startedAt?: string;
  endedAt?: string;
  isCallerCancel?: boolean;
}

// RTC / SFU signaling responses
export interface RtcOfferResponse {
  callId: string; // ✅ main key
  offer: RTCSessionDescriptionInit;
  memberId: string;
}

export interface RtcAnswerResponse {
  callId: string; // ✅ main key
  answer: RTCSessionDescriptionInit;
  memberId: string;
}

export interface IceCandidateResponse {
  callId: string; // ✅ main key
  candidate: RTCIceCandidateInit;
  memberId: string;
}
