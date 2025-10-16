export interface PaginationResponse<T> {
  items: T[];
  hasMore: boolean;
}
