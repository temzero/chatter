import { Expose, Type } from 'class-transformer';
import { ChatMemberResponseDto } from './chat-member-response.dto';
import { ChatResponseDto } from 'src/modules/chat/dto/responses/chat-response.dto';

export class ChatMemberDetailsDto extends ChatMemberResponseDto {
  @Expose()
  @Type(() => ChatResponseDto)
  chat: ChatResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
