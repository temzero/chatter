export type ApiSuccessResponse<T> = {
  payload: T;
  message?: string;
};

// Specialized response for direct chats
export type DirectChatApiResponse<T> = {
  payload: T;
  wasExisting: boolean; // Only added for direct chat responses
  message?: string;
};
