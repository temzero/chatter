// Requests
export interface InitiateCallRequest {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
  toMemberId?: string; // Optional for 1:1 calls
}

export interface CallActionRequest {
  chatId: string;
  fromMemberId: string; // Who is performing the action
  isCallerCancel?: boolean;
}

export interface RtcOfferRequest {
  chatId: string;
  offer: RTCSessionDescriptionInit;
  fromMemberId: string; // Who is sending the offer
  toMemberId?: string; // Optional (group vs direct)
}

export interface RtcAnswerRequest {
  chatId: string;
  answer: RTCSessionDescriptionInit;
  fromMemberId: string; // Who is sending the answer
  toMemberId: string; // Who this answer is for
}

export interface IceCandidateRequest {
  chatId: string;
  candidate: RTCIceCandidateInit;
  fromMemberId: string; // Who is sending this candidate
  toMemberId: string; // Who this candidate is for
}

// Responses
export interface IncomingCallResponse {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
  fromMemberId: string; // Caller
  timestamp: number;
  toMemberId?: string; // For directed calls
}

export interface CallActionResponse {
  chatId: string;
  fromMemberId: string; // Who took the action
  timestamp: number;
  isCallerCancel?: boolean;
}

export interface RtcOfferResponse {
  chatId: string;
  offer: RTCSessionDescriptionInit;
  fromMemberId: string; // Sender of offer
  toMemberId?: string; // Undefined means broadcast
}

export interface RtcAnswerResponse {
  chatId: string;
  answer: RTCSessionDescriptionInit;
  fromMemberId: string; // Sender of answer
  toMemberId: string; // Always specific
}

export interface IceCandidateResponse {
  chatId: string;
  candidate: RTCIceCandidateInit;
  fromMemberId: string; // Sender of candidate
  toMemberId: string; // Always specific
}
