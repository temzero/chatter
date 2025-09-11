import { CallStatus } from '../type/callStatus';

export class CreateCallDto {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
  initiatorId: string;
  initiatorMemberId?: string;
  roomName?: string;
  status: CallStatus;
}
