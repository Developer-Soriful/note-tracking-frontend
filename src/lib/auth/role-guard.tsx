"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import type { UserRole } from "@/modules/auth/types";
import { Button } from "@/components/ui/button";

export interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Restricts access to users holding specific roles (e.g. admin).
 * Prevents unauthorized privilege escalation and hides protected UI.
 */
export function RoleGuard({
  allowedRoles,
  children,
  fallback,
  redirectTo,
}: RoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isAuthorized = Boolean(user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAuthorized && redirectTo) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, isAuthorized, redirectTo, router]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (redirectTo) {
      return null;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center select-none">
        <div className="w-12 h-12 rounded-full bg-danger-surface border border-danger-border flex items-center justify-center text-danger mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Administrator Access Required
        </h2>
        <p className="text-xs text-foreground-muted max-w-sm mb-6 leading-relaxed">
          You do not have permission to access this administrative section. Please return
          to your notes or contact an administrator.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/notes")}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Return to Notes
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

