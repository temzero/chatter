import { Expose, Type } from 'class-transformer';
import { MessageType, MessageStatus } from '../constants';
import { UserResponseDto } from '../../user/dto/responses/user-response.dto';
import { ChatReferenceDto } from '../../chat/dto/responses/chat-reference.dto';
import { AttachmentResponseDto } from './attachment-response.dto';
import { ReactionResponseDto } from './reaction-response.dto';

export class MessageResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => ChatReferenceDto)
  chat: ChatReferenceDto;

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
  pinnedAt?: Date;

  @Expose()
  @Type(() => MessageReferenceDto)
  replyToMessage?: MessageReferenceDto;

  @Expose()
  replyCount: number;

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
  editedAt?: Date;
}

// For nested message references
export class MessageReferenceDto {
  @Expose()
  id: string;

  @Expose()
  content?: string;

  @Expose()
  @Type(() => UserResponseDto)
  sender: UserResponseDto;

  @Expose()
  createdAt: Date;
}
