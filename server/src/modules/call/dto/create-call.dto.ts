import { CallStatus } from '../type/callStatus';

export class CreateCallDto {
  chatId: string;
  initiatorUserId: string;
  status: CallStatus;
  maxParticipants?: number;
}
