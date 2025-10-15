import { ChatResponse } from './chat.response';

export type ApiSuccessResponse<T> = {
  payload: T;
  statusCode: number;
  message: string;
};

// Specialized response for direct chats
export type DirectChatApiResponse = ApiSuccessResponse<ChatResponse> & {
  wasExisting: boolean; // Only added for direct chat responses
};
