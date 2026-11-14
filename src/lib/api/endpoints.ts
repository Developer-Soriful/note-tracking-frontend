/**
 * Centralized API endpoints matching backend routes.
 */
export const API_ENDPOINTS = {
  HEALTH: "/health",
  READY: "/ready",
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
  },
  USERS: {
    ME: "/users/me",
    LIST: "/users",
    CREATE: "/users",
    BY_ID: (userId: string) => `/users/${userId}`,
  },
  NOTES: {
    LIST: "/notes",
    CREATE: "/notes",
    BY_ID: (noteId: string) => `/notes/${noteId}`,
  },
  POSTS: {
    LIST: "/posts",
    CREATE: "/posts",
    BY_USER: (userId: string) => `/posts/user/${userId}`,
  },
  REPORTS: {
    USERS_BY_INTEREST: "/reports/users-by-interest",
  },
} as const;

