export interface PaginationResponse<T> {
  data: T[];
  hasMore: boolean;
}
