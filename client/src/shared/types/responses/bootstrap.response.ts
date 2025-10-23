import { PaginationResponse } from "@/shared/types/responses/pagination.response";
import { ChatWithMessagesResponse } from "./chat.response";
import { FriendRequestResponse } from "./friendship.response";
import { FolderResponse } from "./folder.response";

export interface BootstrapResponse {
  userId: string;
  chatData: PaginationResponse<ChatWithMessagesResponse>;
  folderData: PaginationResponse<FolderResponse>;
  friendRequestData: PaginationResponse<FriendRequestResponse>;
}
