import { User } from 'src/modules/user/entities/user.entity';
import { CallStatus } from '../type/callStatus';

export class CreateCallDto {
  chatId: string;
  status: CallStatus;
  initiatorUser: User;
}
