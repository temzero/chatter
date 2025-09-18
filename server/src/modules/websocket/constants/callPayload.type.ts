import { CallStatus } from 'src/modules/call/type/callStatus';

// -------------------- Shared --------------------

// Update call session
export interface UpdateCallPayload {
  callId: string;
  chatId: string;
  isVideoCall?: boolean;
  callStatus?: CallStatus;
}

// -------------------- Requests --------------------

export interface InitiateCallRequest {
  chatId: string;
  isVideoCall: boolean;
}

// Action-level requests (accept, reject, hang up, etc.)
export interface CallActionRequest {
  callId: string;
  chatId: string;
  isCallerCancel?: boolean;
}

// RTC / SFU signaling requests
export interface RtcOfferRequest {
  callId: string;
  chatId: string;
  offer: RTCSessionDescriptionInit;
}

export interface RtcAnswerRequest {
  callId: string;
  chatId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateRequest {
  callId: string;
  chatId: string;
  candidate: RTCIceCandidateInit;
}

// -------------------- Responses --------------------

// General per-member call action response
export interface CallActionResponse {
  callId?: string;
  chatId: string;
  memberId: string;
  status?: CallStatus;
  createdAt?: string;
  startedAt?: string;
  endedAt?: string;
  isCallerCancel?: boolean;
}

export interface IncomingCallResponse {
  callId?: string; // optional, if no call entity exists yet
  chatId: string; // room/chat identifier
  status: CallStatus; // DIALING or IN_PROGRESS
  participantsCount: number; // number of participants in the room
  initiatorMemberId?: string; // optional if known
  isVideoCall?: boolean; // optional if known
  startedAt?: Date; // optional if known
}

// RTC / SFU signaling responses
export interface RtcOfferResponse {
  callId: string;
  offer: RTCSessionDescriptionInit;
  memberId: string;
}

export interface RtcAnswerResponse {
  callId: string;
  answer: RTCSessionDescriptionInit;
  memberId: string;
}

export interface IceCandidateResponse {
  callId: string;
  candidate: RTCIceCandidateInit;
  memberId: string;
}
