/**
 * Shared API envelope and pagination types matching Express backend contracts.
 */

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiMessageResponse {
  success: true;
  message: string;
}

export interface ApiErrorIssue {
  field?: string | number;
  message: string;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: ApiErrorIssue[];
  debugMessage?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

