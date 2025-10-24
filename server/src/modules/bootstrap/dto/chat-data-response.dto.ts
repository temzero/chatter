import { Exclude, Expose } from 'class-transformer';
import { MessageResponseDto } from 'src/modules/message/dto/responses/message-response.dto';
import { ChatResponseDto } from 'src/modules/chat/dto/responses/chat-response.dto';
import { PaginationResponse } from 'src/shared/types/responses/pagination.response';
import { ChatMemberResponseDto } from 'src/modules/chat-member/dto/responses/chat-member-response.dto';
import { ChatDataResponse } from 'src/shared/types/responses/chat.response';

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
