import { apiClient } from "@/lib/api/client";
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
  async login(input: LoginInput): Promise<AuthResponseData> {
    return apiClient.post<AuthResponseData>(
      API_ENDPOINTS.AUTH.LOGIN,
      input,
      { skipAuth: true },
    );
  },

  /**
   * Registers a new user account and returns user profile & access token.
   */
  async register(input: RegisterInput): Promise<AuthResponseData> {
    return apiClient.post<AuthResponseData>(
      API_ENDPOINTS.AUTH.REGISTER,
      input,
      { skipAuth: true },
    );
  },

  /**
   * Fetches the currently authenticated user's profile from /users/me.
   */
  async getCurrentUser(): Promise<PublicUser> {
    return apiClient.get<PublicUser>(API_ENDPOINTS.USERS.ME);
  },

  /**
   * Clears the client-side session.
   */
  logout(): void {
    tokenStorage.clearAccessToken();
  },
};

