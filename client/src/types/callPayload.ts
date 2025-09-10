import { CallStatus } from "./enums/CallStatus";
// -------------------- Requests --------------------

// Call control (no from/to member IDs needed except optional toMemberId for 1:1)
export interface InitiateCallRequest {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
}

export interface updateCallPayload {
  callId: string;
  chatId: string;
  isVideoCall: boolean;
  callStatus: CallStatus;
}

export interface callMemberPayload {
  callId?: string;
  chatId: string;
  memberId: string; // The member whose state changed
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  isScreenSharing?: boolean;
}

export interface CallActionRequest {
  callId?: string;
  chatId: string;
  isCallerCancel?: boolean; // Action flags
}

// RTC / SFU signaling (client only specifies recipient if needed)
export interface RtcOfferRequest {
  chatId: string;
  offer: RTCSessionDescriptionInit;
}

export interface RtcAnswerRequest {
  chatId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateRequest {
  chatId: string;
  candidate: RTCIceCandidateInit;
}

// -------------------- Responses --------------------

// Call control responses (server injects memberId for context)
export interface IncomingCallResponse {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
  memberId: string; // Caller (added by server)
  timestamp: number;
}

export interface CallActionResponse {
  callId: string;
  chatId: string;
  memberId: string; // Who took the action
  timestamp: number;
  isCallerCancel?: boolean;
}

// RTC / SFU signaling responses (always include memberId)
export interface RtcOfferResponse {
  chatId: string;
  offer: RTCSessionDescriptionInit;
  memberId: string;
}

export interface RtcAnswerResponse {
  chatId: string;
  answer: RTCSessionDescriptionInit;
  memberId: string;
}

export interface IceCandidateResponse {
  chatId: string;
  candidate: RTCIceCandidateInit;
  memberId: string;
}
