import { CallStatus } from 'src/modules/call/type/callStatus';

// -------------------- Shared --------------------

// Update call session
export interface UpdateCallPayload {
  callId: string;
  chatId: string;
  isVideoCall?: boolean;
  callStatus?: CallStatus;
  endedAt?: string;
}

// -------------------- Requests --------------------

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
  callId: string; // optional, if no call entity exists yet
  chatId: string; // room/chat identifier
  status: CallStatus; // DIALING or IN_PROGRESS
  participantsCount: number; // number of participants in the room
  initiatorMemberId?: string; // optional if known
  initiatorUserId?: string; // optional if known
  isVideoCall?: boolean; // optional if known
  startedAt?: Date; // optional if known
}

export interface CallErrorResponse {
  reason: CallError;
  callId?: string;
  chatId?: string;
}

export enum CallError {
  PERMISSION_DENIED = 'permission_denied',
  DEVICE_UNAVAILABLE = 'device_unavailable',
  CONNECTION_FAILED = 'connection_failed',
  INITIATION_FAILED = 'initiation_failed',
  LINE_BUSY = 'line_busy',
  CALL_FAILED = 'call_failed',
}
