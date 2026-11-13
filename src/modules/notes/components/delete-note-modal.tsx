"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { PublicNote } from "../types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/lib/api/client";

export interface DeleteNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: PublicNote | null;
  onConfirm: (noteId: string) => Promise<unknown>;
}

export function DeleteNoteModal({
  isOpen,
  onClose,
  note,
  onConfirm,
}: DeleteNoteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!note || isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm(note.id);
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to delete note";
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
      title="Delete Note"
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

        <div className="rounded-lg bg-surface-muted border border-border p-3.5 space-y-1">
          <p className="text-xs font-medium text-foreground line-clamp-2">
            &ldquo;{note?.title}&rdquo;
          </p>
          <p className="text-[11px] text-foreground-subtle leading-relaxed">
            Permanently removes this note from your workspace database.
          </p>
        </div>

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
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            isLoading={isDeleting}
            leftIcon={!isDeleting && <Trash2 className="h-4 w-4" />}
          >
            {isDeleting ? "Deleting..." : "Delete Note"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

