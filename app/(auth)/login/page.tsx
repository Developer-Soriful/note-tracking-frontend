import React, { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/modules/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in — Notes",
  description: "Sign in to access your personal note-taking workspace.",
};

function LoginFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground-subtle border-t-foreground" />
      <span className="text-xs text-foreground-muted">Loading sign in...</span>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

