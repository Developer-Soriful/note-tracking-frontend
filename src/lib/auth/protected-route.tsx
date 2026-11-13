"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/use-auth";

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Ensures that only authenticated users can access the wrapped content.
 * Redirects unauthenticated visitors to /login with a safe return path.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Build safe internal redirect target
      const query = searchParams?.toString();
      const target = pathname + (query ? `?${query}` : "");
      const isSafeTarget =
        target.startsWith("/") && !target.startsWith("//") && !target.startsWith("/login");
      const redirectUrl = isSafeTarget
        ? `/login?next=${encodeURIComponent(target)}`
        : "/login";

      router.replace(redirectUrl);
    }
  }, [isLoading, isAuthenticated, router, pathname, searchParams]);

  // Loading state while verifying session bootstrap
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 select-none">
        <Loader2 className="h-6 w-6 animate-spin text-foreground-subtle" />
        <p className="text-xs text-foreground-muted">Loading your workspace...</p>
      </div>
    );
  }

  // If unauthenticated, render nothing while redirect occurs
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

