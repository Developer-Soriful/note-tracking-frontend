import type { UserRole } from "../types";

/**
 * Default safe destination for authenticated sessions.
 */
export const DEFAULT_SAFE_DESTINATION = "/notes";

/**
 * Validates whether a given URL path is a safe, relative, internal application path.
 * Rejects protocol-relative URLs, external domains, backslashes, and authentication loop paths.
 */
export function isInternalSafePath(path: string): boolean {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\")
  ) {
    return false;
  }

  try {
    const dummyOrigin = "https://local.app";
    const parsed = new URL(path, dummyOrigin);

    if (parsed.origin !== dummyOrigin) {
      return false;
    }

    const pathname = parsed.pathname;

    // Reject exact auth paths and subpaths
    if (
      pathname === "/login" ||
      pathname.startsWith("/login/") ||
      pathname === "/register" ||
      pathname.startsWith("/register/")
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Checks whether a given path is an administrative destination restricted to admin users.
 * Matches /admin, /admin/, and any nested administrative routes.
 */
export function isAdminPath(path: string): boolean {
  if (!path || typeof path !== "string") {
    return false;
  }

  try {
    const dummyOrigin = "https://local.app";
    const parsed = new URL(path.startsWith("/") ? path : `/${path}`, dummyOrigin);
    const pathname = parsed.pathname.toLowerCase();

    return pathname === "/admin" || pathname.startsWith("/admin/");
  } catch {
    return false;
  }
}

/**
 * Sanitizes and validates internal redirect target paths.
 * Prevents open redirects, protocol-relative attacks, backslash path normalization exploits,
 * external destinations, and authentication redirect loops.
 *
 * Both the target and caller-provided fallback are sanitized so callers cannot
 * accidentally introduce an unsafe redirect via an invalid fallback.
 */
export function getSafeRedirectUrl(
  target: string | null | undefined,
  fallback = DEFAULT_SAFE_DESTINATION,
): string {
  // Ensure the fallback itself is completely safe; if invalid, default to /notes
  const sanitizedFallback =
    fallback && isInternalSafePath(fallback.trim())
      ? fallback.trim()
      : DEFAULT_SAFE_DESTINATION;

  if (!target) return sanitizedFallback;

  const cleanTarget = target.trim();

  if (!isInternalSafePath(cleanTarget)) {
    return sanitizedFallback;
  }

  try {
    const dummyOrigin = "https://local.app";
    const parsed = new URL(cleanTarget, dummyOrigin);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return sanitizedFallback;
  }
}

/**
 * Resolves a safe redirect destination tailored to the user's role and authorization.
 *
 * - Sanitizes the target path against open redirects, backslash normalization, and auth loops.
 * - Enforces role-based path safety: If the destination is an administrative path (e.g. /admin/*)
 *   and the authenticated user does not have the "admin" role (or role is unknown/user),
 *   it gracefully falls back to the safe user workspace (/notes).
 * - Preserves legitimate admin destinations when an administrator authenticates.
 */
export function getRoleAwareRedirectUrl(
  target: string | null | undefined,
  userRole?: UserRole | null,
  fallback = DEFAULT_SAFE_DESTINATION,
): string {
  const safeFallback =
    isAdminPath(fallback) && userRole !== "admin"
      ? DEFAULT_SAFE_DESTINATION
      : fallback;

  const safeUrl = getSafeRedirectUrl(target, safeFallback);

  if (isAdminPath(safeUrl) && userRole !== "admin") {
    return safeFallback;
  }

  return safeUrl;
}

