"use client";

import React, { useState } from "react";
import { AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import type { CreateUserInput, PublicUser, UpdateUserInput, UserRole } from "../types";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/lib/api/client";

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUser?: PublicUser | null;
  currentUserId?: string;
  onSubmit: (input: CreateUserInput | UpdateUserInput) => Promise<unknown>;
}

interface UserFormInnerProps {
  initialUser?: PublicUser | null;
  currentUserId?: string;
  onClose: () => void;
  onSubmit: (input: CreateUserInput | UpdateUserInput) => Promise<unknown>;
}

function UserFormInner({
  initialUser,
  currentUserId,
  onClose,
  onSubmit,
}: UserFormInnerProps) {
  const isEditing = Boolean(initialUser);
  const isSelf = Boolean(initialUser && currentUserId && initialUser.id === currentUserId);

  const [name, setName] = useState(initialUser?.name ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(initialUser?.role ?? "user");
  const [interestsText, setInterestsText] = useState(
    initialUser?.interests ? initialUser.interests.join(", ") : "",
  );
  const [showPassword, setShowPassword] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    let isValid = true;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Name validation
    if (!trimmedName || trimmedName.length < 2) {
      setNameError("Name must be at least 2 characters");
      isValid = false;
    } else if (trimmedName.length > 100) {
      setNameError("Name must be at most 100 characters");
      isValid = false;
    } else {
      setNameError(null);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else if (trimmedEmail.length > 254) {
      setEmailError("Email must not exceed 254 characters");
      isValid = false;
    } else {
      setEmailError(null);
    }

    // Password validation
    if (!isEditing) {
      if (!password || password.length < 8) {
        setPasswordError("Password must be at least 8 characters");
        isValid = false;
      } else if (new TextEncoder().encode(password).length > 72) {
        setPasswordError("Password must not exceed 72 bytes");
        isValid = false;
      } else {
        setPasswordError(null);
      }
    } else {
      if (password && password.length < 8) {
        setPasswordError("Password must be at least 8 characters if provided");
        isValid = false;
      } else if (password && new TextEncoder().encode(password).length > 72) {
        setPasswordError("Password must not exceed 72 bytes");
        isValid = false;
      } else {
        setPasswordError(null);
      }
    }

    // Edit mode no-change check
    if (isEditing && initialUser) {
      const interestsArray = interestsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const originalInterests = initialUser.interests ?? [];
      const sameInterests =
        interestsArray.length === originalInterests.length &&
        interestsArray.every((val, index) => val === originalInterests[index]);

      if (
        trimmedName === initialUser.name &&
        trimmedEmail.toLowerCase() === initialUser.email.toLowerCase() &&
        !password &&
        role === initialUser.role &&
        sameInterests
      ) {
        setApiError("No changes detected. Update at least one field.");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedInterests = interestsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20);

      if (isEditing && initialUser) {
        const payload: UpdateUserInput = {};
        if (name.trim() !== initialUser.name) payload.name = name.trim();
        if (email.trim().toLowerCase() !== initialUser.email.toLowerCase()) {
          payload.email = email.trim().toLowerCase();
        }
        if (password) payload.password = password;
        if (!isSelf && role !== initialUser.role) payload.role = role;
        payload.interests = parsedInterests;

        await onSubmit(payload);
      } else {
        const payload: CreateUserInput = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          interests: parsedInterests,
        };

        await onSubmit(payload);
      }

      onClose();
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred while saving the user";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Backend API Error Banner */}
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-danger-border bg-danger-surface p-3 text-xs text-danger"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{apiError}</span>
        </div>
      )}

      {/* Name Field */}
      <div>
        <Input
          id="user-name"
          label="Full Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(null);
            if (apiError) setApiError(null);
          }}
          placeholder="e.g. Alex Morgan"
          disabled={isSubmitting}
          error={nameError || undefined}
          autoFocus
        />
      </div>

      {/* Email Field */}
      <div>
        <Input
          id="user-email"
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
            if (apiError) setApiError(null);
          }}
          placeholder="e.g. alex@example.com"
          disabled={isSubmitting}
          error={emailError || undefined}
        />
      </div>

      {/* Password Field */}
      <div>
        <div className="relative">
          <Input
            id="user-password"
            type={showPassword ? "text" : "password"}
            label={
              isEditing
                ? "Password (leave blank to keep current)"
                : "Initial Password"
            }
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
              if (apiError) setApiError(null);
            }}
            placeholder={isEditing ? "••••••••" : "Minimum 8 characters"}
            disabled={isSubmitting}
            error={passwordError || undefined}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="p-1 hover:text-foreground text-foreground-subtle cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />
        </div>
      </div>

      {/* Role Selector (Edit Mode Only, Disabled for Self) */}
      {isEditing && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="user-role-select"
            className="text-xs font-medium text-foreground select-none"
          >
            System Role
          </label>
          <select
            id="user-role-select"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={isSubmitting || isSelf}
            className="w-full h-9.5 px-3 rounded-lg border border-border bg-surface text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-foreground-muted"
          >
            <option value="user">User (Standard member)</option>
            <option value="admin">Admin (System administrator)</option>
          </select>
          {isSelf && (
            <p className="text-[11px] text-foreground-subtle italic">
              You cannot change your own administrative role.
            </p>
          )}
        </div>
      )}

      {/* Interests Field */}
      <div>
        <Input
          id="user-interests"
          label="Interests (comma-separated, max 20)"
          value={interestsText}
          onChange={(e) => setInterestsText(e.target.value)}
          placeholder="e.g. engineering, design, architecture"
          disabled={isSubmitting}
          helperText="Optional topic tags associated with this member."
        />
      </div>

      {/* Actions Footer */}
      <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          leftIcon={!isSubmitting && <Check className="h-4 w-4" />}
        >
          {isSubmitting
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Create User"}
        </Button>
      </div>
    </form>
  );
}

export function UserFormModal({
  isOpen,
  onClose,
  initialUser,
  currentUserId,
  onSubmit,
}: UserFormModalProps) {
  const isEditing = Boolean(initialUser);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Workspace User" : "Create Workspace User"}
      description={
        isEditing
          ? "Update account details, role permissions, and interest tags."
          : "Add a new registered member to the note-taking application."
      }
      maxWidth="md"
    >
      {isOpen && (
        <UserFormInner
          key={initialUser ? initialUser.id : "new-user"}
          initialUser={initialUser}
          currentUserId={currentUserId}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}

