/**
 * Authentication module domain and DTO types.
 */

export type UserRole = "user" | "admin";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  interests: string[];
}

export interface AuthResponseData {
  user: PublicUser;
  accessToken: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  interests?: string[];
}

export interface LoginInput {
  email: string;
  password: string;
}

