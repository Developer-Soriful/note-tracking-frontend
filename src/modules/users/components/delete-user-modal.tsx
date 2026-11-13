"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { PublicUser } from "../types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/lib/api/client";

export interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: PublicUser | null;
  currentUserId?: string;
  onConfirm: (userId: string) => Promise<unknown>;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  user,
  currentUserId,
  onConfirm,
}: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = Boolean(user && currentUserId && user.id === currentUserId);

  const handleDelete = async () => {
    if (!user || isDeleting || isSelf) return;

    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm(user.id);
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to delete user";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) {
          setError(null);
          onClose();
        }
      }}
      title="Delete User Account"
      description="This action cannot be undone."
      maxWidth="sm"
    >
      <div className="space-y-4">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-danger-border bg-danger-surface p-3 text-xs text-danger"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {isSelf ? (
          <div className="rounded-lg bg-surface-muted border border-border p-3.5 space-y-1">
            <p className="text-xs font-semibold text-danger">
              Self-deletion is prohibited
            </p>
            <p className="text-[11px] text-foreground-subtle leading-relaxed">
              Administrators cannot delete their own active account. Another system
              administrator must perform account administrative actions.
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-surface-muted border border-border p-3.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground truncate">
                {user?.name}
              </span>
              <span className="text-[11px] text-foreground-subtle truncate">
                ({user?.email})
              </span>
            </div>
            <p className="text-[11px] text-foreground-muted leading-relaxed">
              Permanently removes this user account from the workspace database.
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          {!isSelf && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              isLoading={isDeleting}
              leftIcon={!isDeleting && <Trash2 className="h-4 w-4" />}
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

