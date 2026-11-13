"use client";

import React, { useState, useEffect, useTransition } from "react";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle, ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { getSafeRedirectUrl } from "../utils/redirect";
import { ApiClientError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const nextParam = searchParams.get("next");
  const targetDestination = getSafeRedirectUrl(nextParam, "/notes");

  // Redirect authenticated visitors away immediately
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      startTransition(() => {
        router.replace(targetDestination);
      });
    }
  }, [isAuthLoading, isAuthenticated, router, targetDestination]);

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    } else if (trimmedEmail.length > 254) {
      errors.email = "Email must not exceed 254 characters";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      // Navigate to destination on success
      startTransition(() => {
        router.replace(targetDestination);
      });
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setGeneralError(
            "Invalid email or password. Please verify your credentials and try again.",
          );
        } else if (err.status === 400 && err.details && err.details.length > 0) {
          const apiFieldErrors: FieldErrors = {};
          err.details.forEach((issue) => {
            if (issue.field === "email") apiFieldErrors.email = issue.message;
            if (issue.field === "password")
              apiFieldErrors.password = issue.message;
          });
          setFieldErrors((prev) => ({ ...prev, ...apiFieldErrors }));
          setGeneralError(err.message || "Please correct the highlighted fields.");
        } else if (err.status === 0) {
          setGeneralError(
            "Unable to connect to the server. Please check your internet connection.",
          );
        } else if (err.status >= 500) {
          setGeneralError(
            "Server encountered a temporary issue. Please try again in a few moments.",
          );
        } else {
          setGeneralError(err.message || "Authentication failed. Please try again.");
        }
      } else {
        setGeneralError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent form flicker while resolving initial session bootstrap or performing redirect
  if (isAuthLoading || isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground-subtle border-t-foreground" />
        <span className="text-xs text-foreground-muted">Checking session...</span>
      </div>
    );
  }

  const registerHref = nextParam
    ? `/register?next=${encodeURIComponent(nextParam)}`
    : "/register";

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="mt-1 text-xs text-foreground-muted">
          Welcome back. Enter your credentials to access your notes.
        </p>
      </div>

      {generalError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 flex items-start gap-2.5 rounded-lg border border-danger-border bg-danger-surface p-3 text-xs text-danger-foreground animate-in fade-in-0 duration-150"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-danger" />
          <div className="leading-relaxed font-medium">{generalError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          error={fieldErrors.email}
          disabled={isSubmitting}
          leftIcon={<Mail className="h-4 w-4" />}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          error={fieldErrors.password}
          disabled={isSubmitting}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="cursor-pointer text-foreground-subtle hover:text-foreground transition-colors p-0.5 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="w-full mt-2"
          rightIcon={!isSubmitting && <ArrowRight className="h-4 w-4" />}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-border-subtle text-center">
        <p className="text-xs text-foreground-muted">
          Don&apos;t have an account?{" "}
          <NextLink
            href={registerHref}
            className="font-medium text-foreground hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xs"
          >
            Create an account
          </NextLink>
        </p>
      </div>
    </div>
  );
}
