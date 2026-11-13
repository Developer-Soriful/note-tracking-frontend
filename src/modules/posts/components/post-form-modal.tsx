"use client";

import React, { useState } from "react";
import { AlertCircle, Send } from "lucide-react";
import type { CreatePostInput } from "../types";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/lib/api/client";

export interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreatePostInput) => Promise<unknown>;
}

interface PostFormInnerProps {
  onClose: () => void;
  onSubmit: (input: CreatePostInput) => Promise<unknown>;
}

function PostFormInner({ onClose, onSubmit }: PostFormInnerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    let isValid = true;
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    // Title validation (1-200 chars)
    if (!trimmedTitle) {
      setTitleError("Title is required");
      isValid = false;
    } else if (trimmedTitle.length > 200) {
      setTitleError("Title must be at most 200 characters");
      isValid = false;
    } else {
      setTitleError(null);
    }

    // Content validation (1-20,000 chars)
    if (!trimmedContent) {
      setContentError("Content is required");
      isValid = false;
    } else if (trimmedContent.length > 20_000) {
      setContentError("Content must be at most 20,000 characters");
      isValid = false;
    } else {
      setContentError(null);
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
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred while publishing the post";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleLength = title.trim().length;
  const contentLength = content.trim().length;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* API Error Alert Banner */}
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-danger-border/40 bg-danger-surface/30 p-3 text-xs text-danger"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Publishing Error</p>
            <p className="text-foreground-muted mt-0.5">{apiError}</p>
          </div>
        </div>
      )}

      {/* Post Title Field */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="post-title"
            className="text-xs font-medium text-foreground"
          >
            Title <span className="text-danger">*</span>
          </label>
          <span className="text-[11px] text-foreground-subtle tabular-nums">
            {titleLength}/200
          </span>
        </div>
        <Input
          id="post-title"
          type="text"
          placeholder="Give your post a concise title..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError(null);
            if (apiError) setApiError(null);
          }}
          disabled={isSubmitting}
          error={titleError || undefined}
          autoFocus
          maxLength={200}
        />
      </div>

      {/* Post Content Field */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="post-content"
            className="text-xs font-medium text-foreground"
          >
            Content <span className="text-danger">*</span>
          </label>
          <span className="text-[11px] text-foreground-subtle tabular-nums">
            {contentLength.toLocaleString()}/20,000
          </span>
        </div>
        <Textarea
          id="post-content"
          placeholder="Write your article or announcement here..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (contentError) setContentError(null);
            if (apiError) setApiError(null);
          }}
          disabled={isSubmitting}
          error={contentError || undefined}
          rows={7}
          maxLength={20_000}
        />
      </div>

      {/* Modal Actions */}
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
          isLoading={isSubmitting}
          leftIcon={<Send className="h-3.5 w-3.5" />}
        >
          Publish Post
        </Button>
      </div>
    </form>
  );
}

export function PostFormModal({
  isOpen,
  onClose,
  onSubmit,
}: PostFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Post"
      description="Write and publish a new post to your public profile feed."
      maxWidth="lg"
    >
      {isOpen && (
        <PostFormInner
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}
