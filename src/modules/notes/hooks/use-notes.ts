"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notesService } from "../services/notes.service";
import { ApiClientError } from "@/lib/api/client";
import type {
  CreateNoteInput,
  NotesPagination,
  PublicNote,
  UpdateNoteInput,
} from "../types";

export interface UseNotesOptions {
  initialPage?: number;
  limit?: number;
  autoFetch?: boolean;
}

const DEFAULT_PAGINATION: NotesPagination = {
  page: 1,
  limit: 10,
  totalNotes: 0,
  totalPages: 0,
};

export function useNotes(options: UseNotesOptions = {}) {
  const { initialPage = 1, limit = 10, autoFetch = true } = options;

  const [notes, setNotes] = useState<PublicNote[]>([]);
  const [pagination, setPagination] =
    useState<NotesPagination>(DEFAULT_PAGINATION);
  const [page, setPage] = useState<number>(initialPage);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Prevents stale asynchronous responses from overwriting newer state
  const fetchSequenceRef = useRef<number>(0);

  // Synchronize notes data with page, limit, and reloadTrigger
  useEffect(() => {
    if (!autoFetch) return;

    let isMounted = true;
    const controller = new AbortController();
    const currentSequence = ++fetchSequenceRef.current;

    async function loadNotes() {
      try {
        const response = await notesService.getNotes({
          params: { page, limit },
          signal: controller.signal,
        });

        if (isMounted && currentSequence === fetchSequenceRef.current) {
          setNotes(response.notes);
          setPagination(response.pagination);
          setError(null);
        }
      } catch (err) {
        if (!isMounted || (err instanceof Error && err.name === "AbortError")) {
          return;
        }

        if (currentSequence === fetchSequenceRef.current) {
          const message =
            err instanceof ApiClientError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Failed to load notes";
          setError(message);
        }
      } finally {
        if (isMounted && currentSequence === fetchSequenceRef.current) {
          setIsLoading(false);
        }
      }
    }

    void loadNotes();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [page, limit, autoFetch, reloadTrigger]);

  /**
   * Refetches the current page with loading indicator.
   */
  const refetch = useCallback(() => {
    setIsLoading(true);
    setReloadTrigger((prev) => prev + 1);
  }, []);

  /**
   * Handles user-driven page navigation.
   */
  const changePage = useCallback((newPage: number) => {
    setIsLoading(true);
    setPage(Math.max(1, newPage));
  }, []);

  /**
   * Creates a note and resets page to 1 so the user sees their newest note at the top.
   */
  const createNote = useCallback(
    async (input: CreateNoteInput): Promise<PublicNote> => {
      const created = await notesService.createNote(input);
      setIsLoading(true);
      if (page === 1) {
        setReloadTrigger((prev) => prev + 1);
      } else {
        setPage(1);
      }
      return created;
    },
    [page],
  );

  /**
   * Updates an existing note and refreshes the current view.
   */
  const updateNote = useCallback(
    async (noteId: string, input: UpdateNoteInput): Promise<PublicNote> => {
      const updated = await notesService.updateNote(noteId, input);
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === noteId ? updated : note)),
      );
      setReloadTrigger((prev) => prev + 1);
      return updated;
    },
    [],
  );

  /**
   * Deletes an existing note.
   * If deleting the last item on page > 1, navigates to the previous page.
   */
  const deleteNote = useCallback(
    async (noteId: string): Promise<void> => {
      await notesService.deleteNote(noteId);

      setIsLoading(true);
      if (notes.length === 1 && page > 1) {
        setPage((prevPage) => prevPage - 1);
      } else {
        setReloadTrigger((prev) => prev + 1);
      }
    },
    [notes.length, page],
  );

  /**
   * Client-side filtered notes for the currently loaded page.
   * Genuinely distinguishes client filtering from server-side pagination.
   */
  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return notes;

    return notes.filter((note) => {
      return (
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    });
  }, [notes, searchQuery]);

  return {
    notes: filteredNotes,
    rawNotes: notes,
    pagination,
    page,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    isClientFiltered: searchQuery.trim().length > 0,
    changePage,
    refetch,
    createNote,
    updateNote,
    deleteNote,
    clearError: () => setError(null),
  };
}
