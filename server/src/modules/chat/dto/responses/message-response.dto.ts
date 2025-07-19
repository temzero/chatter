import { Expose, Type } from 'class-transformer';
import { MessageStatus } from 'src/modules/message/constants/message-status.constants';
import { UserResponseDto } from 'src/modules/user/dto/responses/user-response.dto';
import { AttachmentResponseDto } from 'src/modules/message/dto/responses/attachment-response.dto';
import { ReactionResponseDto } from 'src/modules/message/dto/responses/reaction-response.dto';

export class MessageResponseDto {
  @Expose()
  id: string;

  @Expose()
  chatId: string;

  @Expose()
  @Type(() => UserResponseDto)
  sender: UserResponseDto;

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

  @Expose()
  isMuted: boolean;
}
