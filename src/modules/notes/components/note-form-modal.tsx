"use client";

import React, { useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import type { CreateNoteInput, PublicNote, UpdateNoteInput } from "../types";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/lib/api/client";

export interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNote?: PublicNote | null;
  onSubmit: (input: CreateNoteInput | UpdateNoteInput) => Promise<unknown>;
}

interface NoteFormInnerProps {
  initialNote?: PublicNote | null;
  onClose: () => void;
  onSubmit: (input: CreateNoteInput | UpdateNoteInput) => Promise<unknown>;
}

function NoteFormInner({
  initialNote,
  onClose,
  onSubmit,
}: NoteFormInnerProps) {
  const isEditing = Boolean(initialNote);

  const [title, setTitle] = useState(initialNote?.title ?? "");
  const [content, setContent] = useState(initialNote?.content ?? "");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    let isValid = true;
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    // Title validation
    if (!trimmedTitle) {
      setTitleError("Title is required");
      isValid = false;
    } else if (trimmedTitle.length > 200) {
      setTitleError("Title must be at most 200 characters");
      isValid = false;
    } else {
      setTitleError(null);
    }

    // Content validation
    if (!trimmedContent) {
      setContentError("Content is required");
      isValid = false;
    } else if (trimmedContent.length > 20000) {
      setContentError("Content must be at most 20,000 characters");
      isValid = false;
    } else {
      setContentError(null);
    }

    // Edit mode: require at least one field to be present/changed
    if (isEditing && initialNote) {
      if (
        trimmedTitle === initialNote.title.trim() &&
        trimmedContent === initialNote.content.trim()
      ) {
        setApiError("No changes detected. Update either title or content.");
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
      const payload: CreateNoteInput = {
        title: title.trim(),
        content: content.trim(),
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred while saving the note";
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

      {/* Title Input */}
      <div>
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-medium text-foreground">Title</span>
          <span
            className={`text-[11px] ${
              title.length > 200 ? "text-danger font-medium" : "text-foreground-subtle"
            }`}
          >
            {title.length} / 200
          </span>
        </div>
        <Input
          id="note-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError(null);
            if (apiError) setApiError(null);
          }}
          placeholder="e.g. Architecture decision records..."
          disabled={isSubmitting}
          error={titleError || undefined}
          autoFocus
        />
      </div>

      {/* Content Textarea */}
      <div>
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-medium text-foreground">Content</span>
          <span
            className={`text-[11px] ${
              content.length > 20000
                ? "text-danger font-medium"
                : "text-foreground-subtle"
            }`}
          >
            {content.length} / 20,000
          </span>
        </div>
        <Textarea
          id="note-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (contentError) setContentError(null);
            if (apiError) setApiError(null);
          }}
          placeholder="Write your note markdown or thoughts here..."
          disabled={isSubmitting}
          rows={8}
          error={contentError || undefined}
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
              : "Create Note"}
        </Button>
      </div>
    </form>
  );
}

export function NoteFormModal({
  isOpen,
  onClose,
  initialNote,
  onSubmit,
}: NoteFormModalProps) {
  const isEditing = Boolean(initialNote);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Note" : "Create Note"}
      description={
        isEditing
          ? "Update the title or content of your note."
          : "Draft a new personal note for your workspace."
      }
      maxWidth="lg"
    >
      {isOpen && (
        <NoteFormInner
          key={initialNote ? initialNote.id : "new-note"}
          initialNote={initialNote}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}
