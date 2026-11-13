import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ReportsQueryParams,
  ReportsResponse,
} from "../types";

export interface GetUsersByInterestOptions {
  params?: ReportsQueryParams;
  signal?: AbortSignal;
}

/**
 * Service responsible for all Admin Reports API operations.
 */
export const reportsService = {
  /**
   * Retrieves aggregated user interest reports with user lists. Admin-only.
   */
  async getUsersByInterest(
    options: GetUsersByInterestOptions = {},
  ): Promise<ReportsResponse> {
    const { params, signal } = options;
    return apiClient.get<ReportsResponse>(
      API_ENDPOINTS.REPORTS.USERS_BY_INTEREST,
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
        signal,
      },
    );
  },
};

