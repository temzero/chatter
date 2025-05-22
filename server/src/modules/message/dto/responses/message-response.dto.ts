import { Expose, Type } from 'class-transformer';
import { MessageStatus } from '../../constants/message-status.constants';
import { MessageType } from '../../constants/message-type.constants';
import { AttachmentResponseDto } from './attachment-response.dto';
import { ReactionResponseDto } from './reaction-response.dto';
import { UserResponseDto } from 'src/modules/user/dto/responses/user-response.dto';

export class MessageResponseDto {
  id: string;
  chatId: string;

  @Expose()
  @Type(() => UserResponseDto)
  sender: UserResponseDto;

  type: MessageType;
  content: string | null;
  status: MessageStatus;
  isPinned: boolean;
  pinnedAt: Date | null;
  replyToMessageId: string | null;
  replyCount: number;
  editedAt: Date | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  reactions?: ReactionResponseDto[];
  attachments?: AttachmentResponseDto[];
}
