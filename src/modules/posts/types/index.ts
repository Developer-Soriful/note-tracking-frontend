/**
 * Posts module domain and DTO types matching Express backend contracts.
 */

export interface PublicPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
}

export interface PostsPagination {
  page: number;
  limit: number;
  totalPosts: number;
  totalPages: number;
}

export interface UserPostsResponse {
  user: {
    id: string;
    name: string;
  };
  posts: PublicPost[];
  pagination: PostsPagination;
}

// Retain UserPostsRawResponse for backwards compatibility
export type UserPostsRawResponse = UserPostsResponse;

export interface PostsQueryParams {
  page?: number;
  limit?: number;
}
