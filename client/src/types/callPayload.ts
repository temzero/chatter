// -------------------- Requests --------------------

// Call control (no from/to member IDs needed except optional toMemberId for 1:1)
export interface InitiateCallRequest {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
}

export interface updateCallPayload {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
}

export interface CallActionRequest {
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

// Call control responses (server injects fromMemberId for context)
export interface PendingCallsResponse {
  pendingCalls: IncomingCallResponse[];
}

export interface IncomingCallResponse {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
  fromMemberId: string; // Caller (added by server)
  timestamp: number;
}

export interface CallActionResponse {
  chatId: string;
  fromMemberId: string; // Who took the action
  timestamp: number;
  isCallerCancel?: boolean;
}

// RTC / SFU signaling responses (always include fromMemberId)
export interface RtcOfferResponse {
  chatId: string;
  offer: RTCSessionDescriptionInit;
  fromMemberId: string;
  toMemberId?: string; // Undefined means broadcast (SFU)
}

export interface RtcAnswerResponse {
  chatId: string;
  answer: RTCSessionDescriptionInit;
  fromMemberId: string;
  toMemberId: string; // Always directed
}

export interface IceCandidateResponse {
  chatId: string;
  candidate: RTCIceCandidateInit;
  fromMemberId: string;
  toMemberId?: string; // Empty = broadcast to all in chat
}
