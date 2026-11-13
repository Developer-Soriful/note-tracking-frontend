"use client";

import React from "react";
import { Calendar, Edit3, Trash2 } from "lucide-react";
import type { PublicNote } from "../types";
import { formatDate } from "../utils/format-date";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export interface NoteViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: PublicNote | null;
  currentUserId?: string;
  onEdit?: (note: PublicNote) => void;
  onDelete?: (note: PublicNote) => void;
}

export function NoteViewModal({
  isOpen,
  onClose,
  note,
  currentUserId,
  onEdit,
  onDelete,
}: NoteViewModalProps) {
  if (!note) return null;

  const isOwner = Boolean(currentUserId && currentUserId === note.userId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={note.title}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle text-xs text-foreground-subtle">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Created {formatDate(note.createdAt)}</span>
          </div>
          {note.updatedAt && note.updatedAt !== note.createdAt && (
            <span>Updated {formatDate(note.updatedAt)}</span>
          )}
        </div>

        {/* Note Content (Safe plain text rendering) */}
        <div className="max-h-[55vh] overflow-y-auto pr-1">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
            {note.content}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border-subtle flex items-center justify-between gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {isOwner && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEdit(note);
                  }}
                  leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                >
                  Edit Note
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onDelete(note);
                  }}
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
