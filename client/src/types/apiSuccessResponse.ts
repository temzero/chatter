export type ApiSuccessResponse<T> = {
  payload: T;
  statusCode: number;
  message: string;
};
