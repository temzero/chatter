import { PaginationResponse } from './pagination.response';
import { FriendRequestResponse } from './friendship.response';
import { FolderResponse } from './folder.response';
import { ChatDataResponseDto } from '@/modules/bootstrap/dto/chat-data-response.dto';
import { IncomingCallResponse } from './call-incoming.response';

export interface BootstrapResponse {
  userId: string;
  chatData: PaginationResponse<ChatDataResponseDto>;
  folderData: PaginationResponse<FolderResponse>;
  friendRequestData: PaginationResponse<FriendRequestResponse>;
  pendingCall: IncomingCallResponse | null;
}
