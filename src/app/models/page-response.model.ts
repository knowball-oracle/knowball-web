export interface PageResponse<T> {
  context: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
