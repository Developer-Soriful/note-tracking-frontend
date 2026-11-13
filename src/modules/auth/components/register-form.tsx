"use client";

import React, { useState, useEffect, useTransition } from "react";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Mail,
  Lock,
  User,
  Tag,
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { getRoleAwareRedirectUrl } from "../utils/redirect";
import { ApiClientError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  interests?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated, user, isLoading: isAuthLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [interestsInput, setInterestsInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const nextParam = searchParams.get("next");

  // Redirect authenticated users away immediately to a role-appropriate destination
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      const destination = getRoleAwareRedirectUrl(
        nextParam,
        user?.role,
        "/notes",
      );
      startTransition(() => {
        router.replace(destination);
      });
    }
  }, [isAuthLoading, isAuthenticated, user?.role, nextParam, router]);

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Name validation
    if (!trimmedName) {
      errors.name = "Full name is required";
    } else if (trimmedName.length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (trimmedName.length > 100) {
      errors.name = "Name must not exceed 100 characters";
    }

    // Email validation
    if (!trimmedEmail) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    } else if (trimmedEmail.length > 254) {
      errors.email = "Email must not exceed 254 characters";
    }

    // Password validation (min 8 chars, max 72 bytes per bcrypt limit)
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else {
      const byteLength = new TextEncoder().encode(password).length;
      if (byteLength > 72) {
        errors.password = "Password must not exceed 72 bytes";
      }
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Optional interests validation
    if (interestsInput.trim()) {
      const parsed = interestsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (parsed.length > 20) {
        errors.interests = "Maximum 20 interests allowed";
      } else if (parsed.some((tag) => tag.length > 50)) {
        errors.interests = "Each interest must be under 50 characters";
      }
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

    const parsedInterests = interestsInput.trim()
      ? interestsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    try {
      const authResponse = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        interests: parsedInterests,
      });

      // New accounts are always regular users; route safely to workspace
      const destination = getRoleAwareRedirectUrl(
        nextParam,
        authResponse.user.role,
        "/notes",
      );

      startTransition(() => {
        router.replace(destination);
      });
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409 || err.code === "EMAIL_ALREADY_EXISTS") {
          setFieldErrors((prev) => ({
            ...prev,
            email: "This email is already registered",
          }));
          setGeneralError(
            "An account with this email address already exists. Please sign in instead.",
          );
        } else if (err.status === 400 && err.details && err.details.length > 0) {
          const apiFieldErrors: FieldErrors = {};
          err.details.forEach((issue) => {
            const field = String(issue.field);
            if (field === "name") apiFieldErrors.name = issue.message;
            if (field === "email") apiFieldErrors.email = issue.message;
            if (field === "password") apiFieldErrors.password = issue.message;
            if (field.startsWith("interests"))
              apiFieldErrors.interests = issue.message;
          });
          setFieldErrors((prev) => ({ ...prev, ...apiFieldErrors }));
          setGeneralError(err.message || "Please correct the highlighted fields.");
        } else if (err.status === 0) {
          setGeneralError(
            "Unable to connect to the server. Please check your internet connection.",
          );
        } else if (err.status >= 500) {
          setGeneralError(
            "Server encountered an issue. Please try again in a few moments.",
          );
        } else {
          setGeneralError(err.message || "Registration failed. Please try again.");
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

  const loginHref = nextParam
    ? `/login?next=${encodeURIComponent(nextParam)}`
    : "/login";

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Create account
        </h1>
        <p className="mt-1 text-xs text-foreground-muted">
          Start capturing thoughts in your structured personal workspace.
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

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (fieldErrors.name) {
              setFieldErrors((prev) => ({ ...prev, name: undefined }));
            }
          }}
          error={fieldErrors.name}
          disabled={isSubmitting}
          leftIcon={<User className="h-4 w-4" />}
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="jane@example.com"
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
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
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="cursor-pointer text-foreground-subtle hover:text-foreground transition-colors p-0.5 rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        <Input
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: undefined,
              }));
            }
          }}
          error={fieldErrors.confirmPassword}
          disabled={isSubmitting}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              className="cursor-pointer text-foreground-subtle hover:text-foreground transition-colors p-0.5 rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        <Input
          label="Topics of interest (optional)"
          type="text"
          placeholder="e.g. Architecture, TypeScript, Design"
          helperText="Comma-separated topics for personalizing notes"
          value={interestsInput}
          onChange={(e) => {
            setInterestsInput(e.target.value);
            if (fieldErrors.interests) {
              setFieldErrors((prev) => ({ ...prev, interests: undefined }));
            }
          }}
          error={fieldErrors.interests}
          disabled={isSubmitting}
          leftIcon={<Tag className="h-4 w-4" />}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="w-full mt-3"
          rightIcon={!isSubmitting && <ArrowRight className="h-4 w-4" />}
        >
          Create account
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-border-subtle text-center">
        <p className="text-xs text-foreground-muted">
          Already have an account?{" "}
          <NextLink
            href={loginHref}
            className="font-medium text-foreground hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xs"
          >
            Sign in
          </NextLink>
        </p>
      </div>
    </div>
  );
}

