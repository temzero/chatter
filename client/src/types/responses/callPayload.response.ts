export interface InitiateCallPayload {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
}

export interface IncomingCallPayload {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
  callerId: string;
  timestamp: number;
}

export interface CallActionPayload {
  chatId: string;
  isCallerCancel?: boolean; // Optional, true if the caller cancels the call
}

export interface CallUserActionPayload {
  chatId: string;
  userId: string;
  timestamp: number;
  isCallerCancel?: boolean;
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
