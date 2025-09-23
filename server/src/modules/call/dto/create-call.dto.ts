import { CallStatus } from '../type/callStatus';

export class CreateCallDto {
  chatId: string;
  status: CallStatus;
  initiatorUserId: string;
}
