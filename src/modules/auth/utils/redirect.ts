/**
 * Sanitizes and validates internal redirect target paths.
 * Prevents open redirects, protocol-relative attacks, and authentication redirect loops.
 */
export function getSafeRedirectUrl(
  target: string | null | undefined,
  fallback = "/notes",
): string {
  if (!target) return fallback;

  // Trim and ensure the path starts with exactly one slash
  const cleanTarget = target.trim();

  // Reject empty, protocol-relative (//evil.com), external urls (https://), or auth self-loops
  if (
    !cleanTarget.startsWith("/") ||
    cleanTarget.startsWith("//") ||
    cleanTarget.startsWith("/login") ||
    cleanTarget.startsWith("/register")
  ) {
    return fallback;
  }

  return cleanTarget;
}

