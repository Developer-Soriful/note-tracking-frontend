import React, { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterForm } from "@/modules/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create an account — Notes",
  description: "Create your personal Notes workspace and start capturing structured thoughts.",
};

function RegisterFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground-subtle border-t-foreground" />
      <span className="text-xs text-foreground-muted">Loading registration...</span>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  );
}

