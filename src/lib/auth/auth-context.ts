import { createContext } from "react";
import type {
  AuthResponseData,
  LoginInput,
  PublicUser,
  RegisterInput,
} from "@/modules/auth/types";

export interface AuthContextType {
  user: PublicUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSessionExpired: boolean;
  initializationError: string | null;
  login: (input: LoginInput) => Promise<AuthResponseData>;
  register: (input: RegisterInput) => Promise<AuthResponseData>;
  logout: () => void;
  clearSessionExpired: () => void;
  clearInitializationError: () => void;
  retryBootstrap: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
