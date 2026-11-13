/**
 * Application environment configuration.
 * Client-accessible variables must begin with NEXT_PUBLIC_.
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
} as const;

export type EnvConfig = typeof env;

