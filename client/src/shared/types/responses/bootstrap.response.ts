import { PaginationResponse } from "@/shared/types/responses/pagination.response";
import { ChatWithMessagesResponse } from "./chat.response";
import { FriendRequestResponse } from "./friendship.response";
import { FolderResponse } from "./folder.response";

export interface BootstrapResponse {
  userId: string;
  chatData: PaginationResponse<ChatWithMessagesResponse>;
  folders: PaginationResponse<FolderResponse>;
  friendRequests: PaginationResponse<FriendRequestResponse>;
}
