import { DirectChat } from "./chat";

export type ApiSuccessResponse<T> = {
  payload: T;
  statusCode: number;
  message: string;
};

// Specialized response for direct chats
export type DirectChatApiResponse = ApiSuccessResponse<DirectChat> & {
  wasExisting: boolean; // Only added for direct chat responses
};
