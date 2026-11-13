import { apiClient, type RequestOptions } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { tokenStorage } from "@/lib/auth/token-storage";
import type {
  AuthResponseData,
  LoginInput,
  PublicUser,
  RegisterInput,
} from "../types";

export const authService = {
  /**
   * Submits credentials to log in and receive user profile & access token.
   */
  async login(
    input: LoginInput,
    options?: RequestOptions,
  ): Promise<AuthResponseData> {
    return apiClient.post<AuthResponseData>(
      API_ENDPOINTS.AUTH.LOGIN,
      input,
      { ...options, skipAuth: true },
    );
  },

  /**
   * Registers a new user account and returns user profile & access token.
   */
  async register(
    input: RegisterInput,
    options?: RequestOptions,
  ): Promise<AuthResponseData> {
    return apiClient.post<AuthResponseData>(
      API_ENDPOINTS.AUTH.REGISTER,
      input,
      { ...options, skipAuth: true },
    );
  },

  /**
   * Fetches the currently authenticated user's profile from /users/me.
   */
  async getCurrentUser(options?: RequestOptions): Promise<PublicUser> {
    return apiClient.get<PublicUser>(API_ENDPOINTS.USERS.ME, options);
  },

  /**
   * Clears the client-side session.
   */
  logout(): void {
    tokenStorage.clearAccessToken();
  },
};
