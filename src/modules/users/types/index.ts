/**
 * Users module domain and DTO types.
 */

import type { PublicUser, UserRole } from "../../auth/types";

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

export interface UsersListRawResponse {
  users: PublicUser[];
  pagination: {
    page: number;
    limit: number;
    totalUsers: number;
    totalPages: number;
  };
}

