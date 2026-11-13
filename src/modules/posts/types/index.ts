/**
 * Posts module domain and DTO types.
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

export interface UserPostsRawResponse {
  user: {
    id: string;
    name: string;
  };
  posts: PublicPost[];
  pagination: {
    page: number;
    limit: number;
    totalPosts: number;
    totalPages: number;
  };
}

