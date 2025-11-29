import { Exclude, Expose } from 'class-transformer';
import { MessageResponseDto } from '@/modules/message/dto/responses/message-response.dto';
import { ChatResponseDto } from '@/modules/chat/dto/responses/chat-response.dto';
import { PaginationResponse } from '@shared/types/responses/pagination.response';
import { ChatMemberResponseDto } from '@/modules/chat-member/dto/responses/chat-member-response.dto';
import { ChatDataResponse } from '@shared/types/responses/chat.response';

@Exclude()
export class ChatDataResponseDto
  extends ChatResponseDto
  implements ChatDataResponse
{
  @Expose()
  messageData: PaginationResponse<MessageResponseDto>;

  @Expose()
  memberData: PaginationResponse<ChatMemberResponseDto>;
}
