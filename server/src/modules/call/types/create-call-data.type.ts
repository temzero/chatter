// types/create-call.type.ts
import { CallStatus } from 'src/shared/types/call';
import { User } from 'src/modules/user/entities/user.entity';

export interface CreateCallData {
  chatId: string;
  status: CallStatus;
  initiatorUser: User;
  startedAt?: Date;
}
