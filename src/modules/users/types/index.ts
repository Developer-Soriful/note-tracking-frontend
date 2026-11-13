/**
 * Users module domain and DTO types matching Express backend contracts.
 */

import type { PublicUser, UserRole } from "@/modules/auth/types";

export type { PublicUser, UserRole };

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  interests?: string[];
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  interests?: string[];
}

export interface UsersPagination {
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
}

export interface UsersListResponse {
  users: PublicUser[];
  pagination: UsersPagination;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
}
