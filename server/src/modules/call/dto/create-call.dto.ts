import { CallStatus } from '../type/callStatus';

export class CreateCallDto {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
  initiatorUserId: string;
  status: CallStatus;
}
