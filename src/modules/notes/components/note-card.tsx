"use client";

import React from "react";
import { Edit3, Trash2, Calendar, ShieldCheck } from "lucide-react";
import type { PublicNote } from "../types";
import { formatDate } from "../utils/format-date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface NoteCardProps {
  note: PublicNote;
  currentUserId?: string;
  isAdmin?: boolean;
  onEdit?: (note: PublicNote) => void;
  onDelete?: (note: PublicNote) => void;
  onView?: (note: PublicNote) => void;
}

export function NoteCard({
  note,
  currentUserId,
  isAdmin = false,
  onEdit,
  onDelete,
  onView,
}: NoteCardProps) {
  const isOwner = Boolean(currentUserId && currentUserId === note.userId);
  const isEdited = note.updatedAt && note.updatedAt !== note.createdAt;

  return (
    <article
      tabIndex={onView ? 0 : undefined}
      onClick={() => onView?.(note)}
      onKeyDown={(e) => {
        if (onView && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onView(note);
        }
      }}
      className="group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-xs hover:border-foreground-subtle/40 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none text-left"
    >
      <div className="space-y-3">
        {/* Header & Badges */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground tracking-tight line-clamp-2 break-words">
            {note.title}
          </h3>

          {!isOwner && isAdmin && (
            <Badge variant="outline" className="text-[10px] shrink-0 gap-1 py-0 px-1.5 font-normal text-foreground-subtle">
              <ShieldCheck className="h-3 w-3" />
              <span>Admin view</span>
            </Badge>
          )}
        </div>

        {/* Content Preview (Safe plain text rendering, no HTML injection) */}
        <p className="text-xs text-foreground-muted leading-relaxed line-clamp-4 break-words whitespace-pre-wrap">
          {note.content}
        </p>
      </div>

      {/* Footer: Metadata & Actions */}
      <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-foreground-subtle truncate">
          <Calendar className="h-3 w-3 shrink-0" />
          <time dateTime={note.createdAt}>
            {formatDate(note.createdAt)}
          </time>
          {isEdited && (
            <span className="flex items-center gap-0.5 text-[10px] italic">
              (edited)
            </span>
          )}
        </div>

        {/* Ownership-sensitive Actions: Show ONLY when note.userId === currentUserId */}
        {isOwner && (
          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(note)}
                aria-label={`Edit note: ${note.title}`}
                className="h-7 w-7 p-0 text-foreground-muted hover:text-foreground"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(note)}
                aria-label={`Delete note: ${note.title}`}
                className="h-7 w-7 p-0 text-foreground-muted hover:text-danger hover:bg-danger-surface"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
