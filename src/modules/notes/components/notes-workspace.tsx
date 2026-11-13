"use client";

import React, { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { useNotes } from "../hooks/use-notes";
import type { CreateNoteInput, PublicNote, UpdateNoteInput } from "../types";
import { NoteCard } from "./note-card";
import { NoteFormModal } from "./note-form-modal";
import { DeleteNoteModal } from "./delete-note-modal";
import { NoteViewModal } from "./note-view-modal";
import { NotesSkeleton } from "./notes-skeleton";
import { NotesEmptyState } from "./notes-empty-state";
import { NotesErrorState } from "./notes-error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

export function NotesWorkspace() {
  const { user, isAdmin } = useAuth();
  const {
    notes,
    rawNotes,
    pagination,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    isClientFiltered,
    changePage,
    refetch,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes({ initialPage: 1, limit: 10 });

  // Modal control states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PublicNote | null>(null);
  const [viewingNote, setViewingNote] = useState<PublicNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<PublicNote | null>(null);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (note: PublicNote) => {
    setEditingNote(note);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (note: PublicNote) => {
    setDeletingNote(note);
  };

  const handleOpenView = (note: PublicNote) => {
    setViewingNote(note);
  };

  const handleFormSubmit = async (
    data: CreateNoteInput | UpdateNoteInput,
  ) => {
    if (editingNote) {
      await updateNote(editingNote.id, data);
    } else {
      await createNote(data as CreateNoteInput);
    }
  };

  const handleDeleteConfirm = async (noteId: string) => {
    await deleteNote(noteId);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Notes
            </h1>
            {isAdmin && (
              <Badge variant="admin" className="text-[10px] py-0 px-1.5">
                All Workspace Notes
              </Badge>
            )}
          </div>
          <p className="text-xs text-foreground-muted mt-1">
            {isAdmin
              ? "System administrator overview of workspace notes. You can view all notes and edit or delete your own."
              : "Capture, organize, and structure your personal notes."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New note
          </Button>
        </div>
      </div>

      {/* Control Bar: Search & Filtering */}
      {!isLoading && !error && rawNotes.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Input
              id="notes-search-filter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter notes on this page..."
              leftIcon={<Search className="h-4 w-4" />}
              rightIcon={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear filter"
                    className="p-1 hover:text-foreground text-foreground-subtle cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : undefined
              }
            />
          </div>

          {/* Explicit client-filter indicator ensuring pagination counts are never misrepresented */}
          {isClientFiltered && (
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <span>
                Filtered: <strong className="text-foreground">{notes.length}</strong> of{" "}
                <strong className="text-foreground">{rawNotes.length}</strong> on this page
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-primary hover:underline cursor-pointer text-xs"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Workspace Area */}
      {isLoading ? (
        <NotesSkeleton count={6} />
      ) : error ? (
        <NotesErrorState error={error} onRetry={refetch} />
      ) : rawNotes.length === 0 ? (
        <NotesEmptyState onCreateNote={handleOpenCreate} />
      ) : notes.length === 0 ? (
        <NotesEmptyState
          isSearchFiltered
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && pagination.totalNotes > 0 && (
        <div className="pt-4 border-t border-border-subtle">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalNotes}
            itemLabel="notes"
            onPageChange={changePage}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Note Creation / Editing Modal */}
      <NoteFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialNote={editingNote}
        onSubmit={handleFormSubmit}
      />

      {/* Note Viewing Modal */}
      <NoteViewModal
        isOpen={Boolean(viewingNote)}
        onClose={() => setViewingNote(null)}
        note={viewingNote}
        currentUserId={user?.id}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Note Deletion Confirmation Modal */}
      <DeleteNoteModal
        isOpen={Boolean(deletingNote)}
        onClose={() => setDeletingNote(null)}
        note={deletingNote}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
