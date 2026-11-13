"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { isInternalSafePath } from "@/modules/auth/utils/redirect";
import { Button } from "@/components/ui/button";

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Ensures that only authenticated users can access the wrapped content.
 * Redirects unauthenticated visitors to /login with a safe return path.
 * When bootstrap fails due to server or network errors, preserves session
 * and provides a retry interface instead of an unwarranted redirect.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    initializationError,
    retryBootstrap,
    logout,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only redirect if auth bootstrap completed, the user is unauthenticated,
    // and there is no initialization error (i.e. genuinely unauthenticated, not an offline/server failure)
    if (!isLoading && !isAuthenticated && !initializationError) {
      // Build safe internal redirect target using centralized redirect security utility
      const query = searchParams?.toString();
      const target = pathname + (query ? `?${query}` : "");
      const isSafeTarget = isInternalSafePath(target);
      const redirectUrl = isSafeTarget
        ? `/login?next=${encodeURIComponent(target)}`
        : "/login";

      router.replace(redirectUrl);
    }
  }, [isLoading, isAuthenticated, initializationError, router, pathname, searchParams]);

  // Loading state while verifying session bootstrap
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-center min-h-[60vh] gap-3 select-none"
      >
        <Loader2 className="h-6 w-6 animate-spin text-foreground-subtle" />
        <p className="text-xs text-foreground-muted">Loading your workspace...</p>
      </div>
    );
  }

  // Connection or server failure during session bootstrap: preserve token and offer retry
  if (initializationError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center select-none">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Connection Error
          </h2>
          <p className="mt-2 text-xs text-foreground-muted leading-relaxed">
            {initializationError}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => void retryBootstrap()}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              className="w-full sm:w-auto"
            >
              Retry Connection
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              className="w-full sm:w-auto"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If genuinely unauthenticated, render nothing while redirect occurs
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

