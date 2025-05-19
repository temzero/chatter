import { Expose, Type } from 'class-transformer';
import { MessageType, MessageStatus } from '../../message/constants';
import { UserResponseDto } from '../../user/dto/responses/user-response.dto';
import { AttachmentResponseDto } from './attachment-response.dto';
import { ReactionResponseDto } from './reaction-response.dto';

export class MessageResponseDto {
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
  @Type(() => AttachmentResponseDto)
  attachments: AttachmentResponseDto[];

  @Expose()
  @Type(() => ReactionResponseDto)
  reactions: ReactionResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
