/**
 * Reports module domain and DTO types matching Express backend contracts.
 */

import type { UserRole } from "@/modules/auth/types";

export interface GroupedUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface InterestReportItem {
  interest: string;
  totalUsers: number;
  users: GroupedUserSummary[];
}

export interface ReportsPagination {
  page: number;
  limit: number;
  totalInterests: number;
  totalPages: number;
}

export interface ReportsResponse {
  reports: InterestReportItem[];
  pagination: ReportsPagination;
}

// Retain ReportsRawResponse for backwards compatibility
export type ReportsRawResponse = ReportsResponse;

export interface ReportsQueryParams {
  page?: number;
  limit?: number;
}
