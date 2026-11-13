/**
 * Reports module domain and DTO types.
 */

import type { UserRole } from "../../auth/types";

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

export interface ReportsRawResponse {
  reports: InterestReportItem[];
  pagination: {
    page: number;
    limit: number;
    totalInterests: number;
    totalPages: number;
  };
}

