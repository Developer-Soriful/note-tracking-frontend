/**
 * Client-side token storage abstraction.
 *
 * SECURITY & XSS CONSIDERATIONS:
 * - The backend authenticates via Bearer tokens in the HTTP Authorization header.
 * - Because the backend does not issue HttpOnly session cookies, the client must store
 *   the JWT locally in order to preserve session state across page reloads.
 * - Web Storage (localStorage) is accessible to any script executing within this origin.
 *   Therefore, it IS NOT SECURE against Cross-Site Scripting (XSS). If malicious script
 *   runs in the application, the access token can be exfiltrated.
 * - Mitigations applied:
 *   1. Access token has a short lifetime of 15 minutes in the backend (reducing the theft window).
 *   2. No persistent refresh token exists to be compromised.
 *   3. Strict React JSX escaping and sanitized rendering must be enforced across all UI.
 *   4. Content Security Policy (CSP) should be configured in production.
 */

const TOKEN_STORAGE_KEY = "note_app_access_token";

let inMemoryToken: string | null = null;

export const tokenStorage = {
  /**
   * Retrieves the current access token.
   * SSR-safe: returns null when executing on the server.
   */
  getAccessToken(): string | null {
    if (inMemoryToken) {
      return inMemoryToken;
    }

    if (typeof window === "undefined") {
      return null;
    }

    try {
      const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      inMemoryToken = stored;
      return stored;
    } catch {
      return null;
    }
  },

  /**
   * Stores the access token in both memory and localStorage.
   */
  setAccessToken(token: string): void {
    inMemoryToken = token;

    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // Storage quota or restricted environment
    }
  },

  /**
   * Clears the access token from memory and localStorage.
   */
  clearAccessToken(): void {
    inMemoryToken = null;

    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Storage restricted environment
    }
  },
};

