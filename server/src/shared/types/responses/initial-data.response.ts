import { ChatWithMessagesResponse } from "./chat.response";

export default interface InitialDataResponse {
  chats: ChatWithMessagesResponse[];
  hasMoreChats: boolean;
}
