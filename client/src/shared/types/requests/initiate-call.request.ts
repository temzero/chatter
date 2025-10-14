// Starting a call
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
