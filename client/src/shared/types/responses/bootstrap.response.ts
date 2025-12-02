import { PaginationResponse } from "@/shared/types/responses/pagination.response";
import { ChatDataResponse } from "./chat.response";
import { FriendRequestResponse } from "./friendship.response";
import { FolderResponse } from "./folder.response";
import { IncomingCallResponse } from "./call-incoming.response";

export interface BootstrapResponse {
  userId: string;
  chatData: PaginationResponse<ChatDataResponse>;
  folderData: PaginationResponse<FolderResponse>;
  friendRequestData: PaginationResponse<FriendRequestResponse>;
  pendingCall: IncomingCallResponse | null;
}
