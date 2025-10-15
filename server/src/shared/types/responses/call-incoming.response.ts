import { CallStatus } from 'src/shared/types/enums/call-status.enum';

export interface IncomingCallResponse {
  callId: string; // optional, if no call entity exists yet
  chatId: string; // room/chat identifier
  status: CallStatus; // DIALING or IN_PROGRESS
  participantsCount?: number; // number of participants in the room
  initiatorMemberId?: string; // optional if known
  initiatorUserId?: string;
  isVideoCall?: boolean; // optional if known
  isBroadcast?: boolean; // optional if known
  startedAt?: Date; // optional if known
}
