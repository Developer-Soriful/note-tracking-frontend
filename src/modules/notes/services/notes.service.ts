import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiMessageResponse } from "@/types/api";
import type {
  CreateNoteInput,
  NotesListResponse,
  NotesQueryParams,
  PublicNote,
  UpdateNoteInput,
} from "../types";

export interface GetNotesOptions {
  params?: NotesQueryParams;
  signal?: AbortSignal;
}

export interface GetNoteByIdOptions {
  signal?: AbortSignal;
}

/**
 * Service responsible for all Notes API operations.
 */
export const notesService = {
  /**
   * Retrieves a paginated list of notes.
   * Standard users receive only their own notes; administrators receive all notes.
   */
  async getNotes(options: GetNotesOptions = {}): Promise<NotesListResponse> {
    const { params, signal } = options;
    return apiClient.get<NotesListResponse>(API_ENDPOINTS.NOTES.LIST, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
      signal,
    });
  },

  /**
   * Retrieves a single note by ID.
   * Admins can read any note; standard users can read only their own note.
   */
  async getNoteById(
    noteId: string,
    options: GetNoteByIdOptions = {},
  ): Promise<PublicNote> {
    return apiClient.get<PublicNote>(API_ENDPOINTS.NOTES.BY_ID(noteId), {
      signal: options.signal,
    });
  },

  /**
   * Creates a new note. Ownership is derived from the authenticated token on the backend.
   */
  async createNote(input: CreateNoteInput): Promise<PublicNote> {
    return apiClient.post<PublicNote>(API_ENDPOINTS.NOTES.CREATE, input);
  },

  /**
   * Updates an existing note.
   * Only the note owner can update their note (even for admins).
   */
  async updateNote(
    noteId: string,
    input: UpdateNoteInput,
  ): Promise<PublicNote> {
    return apiClient.patch<PublicNote>(API_ENDPOINTS.NOTES.BY_ID(noteId), input);
  },

  /**
   * Deletes an existing note.
   * Only the note owner can delete their note (even for admins).
   */
  async deleteNote(noteId: string): Promise<ApiMessageResponse> {
    return apiClient.delete<ApiMessageResponse>(API_ENDPOINTS.NOTES.BY_ID(noteId));
  },
};

