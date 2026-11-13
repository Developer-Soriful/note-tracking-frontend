"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AuthContext, type AuthContextType } from "./auth-context";
import { tokenStorage } from "./token-storage";
import { apiClient, ApiClientError } from "../api/client";
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
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  // Tracks asynchronous action sequence to prevent race conditions across bootstrap, login, register, and logout
  const actionCounterRef = useRef<number>(0);

  const handleUnauthorized = useCallback(() => {
    tokenStorage.clearAccessToken();
    setUser(null);
    setToken(null);
    setIsSessionExpired(true);
    setInitializationError(null);
  }, []);

  // Initialize session on mount with AbortController, mount guard, and action sequencing
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    // Capture the current action sequence at bootstrap dispatch time without incrementing it
    const bootstrapActionId = actionCounterRef.current;

    const unauthorizedHandler = () => {
      if (isMounted) {
        handleUnauthorized();
      }
    };

    apiClient.setOnUnauthorized(unauthorizedHandler);

    const initializeSession = async () => {
      const storedToken = tokenStorage.getAccessToken();

      if (!storedToken) {
        if (isMounted && actionCounterRef.current === bootstrapActionId) {
          setIsLoading(false);
        }
        return;
      }

      if (isMounted && actionCounterRef.current === bootstrapActionId) {
        setToken(storedToken);
      }

      try {
        const currentUser = await authService.getCurrentUser({
          signal: abortController.signal,
        });

        // Only update if no newer user action (login, register, logout) occurred in the meantime
        if (isMounted && actionCounterRef.current === bootstrapActionId) {
          setUser(currentUser);
          setInitializationError(null);
          setIsSessionExpired(false);
        }
      } catch (error) {
        // If aborted during unmount or StrictMode re-render, safely ignore
        if (
          !isMounted ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          return;
        }

        // Only handle errors if no newer user action took place
        if (actionCounterRef.current === bootstrapActionId) {
          if (error instanceof ApiClientError && error.status === 401) {
            tokenStorage.clearAccessToken();
            if (isMounted) {
              setUser(null);
              setToken(null);
              setIsSessionExpired(true);
              setInitializationError(null);
            }
          } else {
            // HTTP 500/502/503 or Network failures: RETAIN stored token and do not mark expired
            if (isMounted) {
              const message =
                error instanceof ApiClientError
                  ? error.message
                  : "Unable to verify session with the server";
              setInitializationError(message);
            }
          }
        }
      } finally {
        if (isMounted && actionCounterRef.current === bootstrapActionId) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
      abortController.abort();
      apiClient.clearOnUnauthorized(unauthorizedHandler);
    };
  }, [handleUnauthorized]);

  const login = useCallback(
    async (input: LoginInput): Promise<AuthResponseData> => {
      const currentAction = ++actionCounterRef.current;
      setIsLoading(true);

      try {
        const result = await authService.login(input);

        // Discard result if logout or another action occurred while request was in flight
        if (actionCounterRef.current === currentAction) {
          tokenStorage.setAccessToken(result.accessToken);
          setToken(result.accessToken);
          setUser(result.user);
          setIsSessionExpired(false);
          setInitializationError(null);
        }

        return result;
      } finally {
        if (actionCounterRef.current === currentAction) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<AuthResponseData> => {
      const currentAction = ++actionCounterRef.current;
      setIsLoading(true);

      try {
        const result = await authService.register(input);

        // Discard result if logout or another action occurred while request was in flight
        if (actionCounterRef.current === currentAction) {
          tokenStorage.setAccessToken(result.accessToken);
          setToken(result.accessToken);
          setUser(result.user);
          setIsSessionExpired(false);
          setInitializationError(null);
        }

        return result;
      } finally {
        if (actionCounterRef.current === currentAction) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const logout = useCallback(() => {
    // Invalidate any pending in-flight login, register, or bootstrap actions
    actionCounterRef.current++;

    authService.logout();
    setUser(null);
    setToken(null);
    setIsSessionExpired(false);
    setInitializationError(null);
    setIsLoading(false);
  }, []);

  const clearSessionExpired = useCallback(() => {
    setIsSessionExpired(false);
  }, []);

  const clearInitializationError = useCallback(() => {
    setInitializationError(null);
  }, []);

  const retryBootstrap = useCallback(async (): Promise<void> => {
    const currentAction = ++actionCounterRef.current;
    const storedToken = tokenStorage.getAccessToken();

    if (!storedToken) {
      if (actionCounterRef.current === currentAction) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setInitializationError(null);

    try {
      const currentUser = await authService.getCurrentUser();
      if (actionCounterRef.current === currentAction) {
        setUser(currentUser);
        setToken(storedToken);
        setInitializationError(null);
        setIsSessionExpired(false);
      }
    } catch (error) {
      if (actionCounterRef.current === currentAction) {
        if (error instanceof ApiClientError && error.status === 401) {
          tokenStorage.clearAccessToken();
          setUser(null);
          setToken(null);
          setIsSessionExpired(true);
          setInitializationError(null);
        } else {
          const message =
            error instanceof ApiClientError
              ? error.message
              : "Unable to verify session with the server";
          setInitializationError(message);
        }
      }
    } finally {
      if (actionCounterRef.current === currentAction) {
        setIsLoading(false);
      }
    }
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === "admin",
      isSessionExpired,
      initializationError,
      login,
      register,
      logout,
      clearSessionExpired,
      clearInitializationError,
      retryBootstrap,
    }),
    [
      user,
      token,
      isLoading,
      isSessionExpired,
      initializationError,
      login,
      register,
      logout,
      clearSessionExpired,
      clearInitializationError,
      retryBootstrap,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
