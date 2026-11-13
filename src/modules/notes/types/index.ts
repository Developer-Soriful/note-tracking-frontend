/**
 * Notes module domain and DTO types.
 */

export interface PublicNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}

export interface NotesListRawResponse {
  notes: PublicNote[];
  pagination: {
    page: number;
    limit: number;
    totalNotes: number;
    totalPages: number;
  };
}

