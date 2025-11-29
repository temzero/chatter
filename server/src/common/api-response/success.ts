import {
  ApiSuccessResponse,
  DirectChatApiResponse,
} from '@shared/types/responses/api-success.response';

export class SuccessResponse<T> implements ApiSuccessResponse<T> {
  constructor(
    public readonly payload: T,
    public readonly message?: string,
  ) {}
}

export class GetOrCreateResponse<T> implements DirectChatApiResponse<T> {
  constructor(
    public readonly payload: T,
    public readonly wasExisting: boolean,
    public readonly message?: string,
  ) {}
}
