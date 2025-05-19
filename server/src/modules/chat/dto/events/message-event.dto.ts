import { MessageType } from 'src/modules/message/constants/message-type.constants';
import { MessageStatus } from 'src/modules/message/constants/message-status.constants';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/modules/user/dto/responses/user-response.dto';

export class MessageEventDto {
  @Expose()
  eventType: 'created' | 'updated' | 'deleted';

  @Expose()
  id: string;

  @Expose()
  chatId: string;

  @Expose()
  @Type(() => UserResponseDto)
  sender: UserResponseDto;

  @Expose()
  type: MessageType;

  @Expose()
  content?: string;

  @Expose()
  status: MessageStatus;

  @Expose()
  isPinned: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
