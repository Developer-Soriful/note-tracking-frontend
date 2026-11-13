import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiMessageResponse } from "@/types/api";
import type {
  CreateUserInput,
  PublicUser,
  UpdateUserInput,
  UsersListResponse,
  UsersQueryParams,
} from "../types";

export interface GetUsersOptions {
  params?: UsersQueryParams;
  signal?: AbortSignal;
}

/**
 * Service responsible for all Admin User Management API operations.
 */
export const usersService = {
  /**
   * Retrieves a paginated list of registered users. Admin-only.
   */
  async getUsers(options: GetUsersOptions = {}): Promise<UsersListResponse> {
    const { params, signal } = options;
    return apiClient.get<UsersListResponse>(API_ENDPOINTS.USERS.LIST, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
      signal,
    });
  },

  /**
   * Retrieves an individual user's profile.
   */
  async getUserById(
    userId: string,
    options: { signal?: AbortSignal } = {},
  ): Promise<PublicUser> {
    return apiClient.get<PublicUser>(API_ENDPOINTS.USERS.BY_ID(userId), {
      signal: options.signal,
    });
  },

  /**
   * Creates a new user account. Admin-only.
   */
  async createUser(input: CreateUserInput): Promise<PublicUser> {
    return apiClient.post<PublicUser>(API_ENDPOINTS.USERS.CREATE, input);
  },

  /**
   * Updates an existing user account. Admin-only.
   */
  async updateUser(
    userId: string,
    input: UpdateUserInput,
  ): Promise<PublicUser> {
    return apiClient.patch<PublicUser>(API_ENDPOINTS.USERS.BY_ID(userId), input);
  },

  /**
   * Deletes a user account. Admin-only. (Cannot delete self).
   */
  async deleteUser(userId: string): Promise<ApiMessageResponse> {
    return apiClient.delete<ApiMessageResponse>(API_ENDPOINTS.USERS.BY_ID(userId));
  },
};

