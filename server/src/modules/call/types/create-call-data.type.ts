// types/create-call.type.ts
import { CallStatus } from '@shared/types/call';
import { User } from '@/modules/user/entities/user.entity';

export interface CreateCallData {
  chatId: string;
  status: CallStatus;
  initiatorUser: User;
  startedAt?: Date;
}
