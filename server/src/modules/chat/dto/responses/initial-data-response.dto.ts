import { ChatWithMessagesResponseDto } from './chat-response.dto';

export default class InitialDataResponse {
  chats: ChatWithMessagesResponseDto[];
  hasMoreChats: boolean;
}
