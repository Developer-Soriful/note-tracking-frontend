"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext, type AuthContextType } from "./auth-context";
import { tokenStorage } from "./token-storage";
import { apiClient } from "../api/client";
import { authService } from "@/modules/auth/services/auth.service";
import type {
  AuthResponseData,
  LoginInput,
  PublicUser,
  RegisterInput,
} from "@/modules/auth/types";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  const handleUnauthorized = useCallback(() => {
    tokenStorage.clearAccessToken();
    setUser(null);
    setToken(null);
    setIsSessionExpired(true);
  }, []);

  // Initialize session on mount & bind 401 interceptor
  useEffect(() => {
    apiClient.setOnUnauthorized(handleUnauthorized);

    const initializeSession = async () => {
      const storedToken = tokenStorage.getAccessToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        // If /users/me fails (e.g., token expired or revoked)
        tokenStorage.clearAccessToken();
        setUser(null);
        setToken(null);
        setIsSessionExpired(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    return () => {
      apiClient.setOnUnauthorized(null);
    };
  }, [handleUnauthorized]);

  const login = useCallback(async (input: LoginInput): Promise<AuthResponseData> => {
    setIsLoading(true);
    try {
      const result = await authService.login(input);
      tokenStorage.setAccessToken(result.accessToken);
      setToken(result.accessToken);
      setUser(result.user);
      setIsSessionExpired(false);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (input: RegisterInput): Promise<AuthResponseData> => {
      setIsLoading(true);
      try {
        const result = await authService.register(input);
        tokenStorage.setAccessToken(result.accessToken);
        setToken(result.accessToken);
        setUser(result.user);
        setIsSessionExpired(false);
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsSessionExpired(false);
  }, []);

  const clearSessionExpired = useCallback(() => {
    setIsSessionExpired(false);
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === "admin",
      isSessionExpired,
      login,
      register,
      logout,
      clearSessionExpired,
    }),
    [user, token, isLoading, isSessionExpired, login, register, logout, clearSessionExpired],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

