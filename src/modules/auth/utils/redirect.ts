/**
 * Default safe destination for authenticated sessions.
 */
const DEFAULT_SAFE_DESTINATION = "/notes";

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
