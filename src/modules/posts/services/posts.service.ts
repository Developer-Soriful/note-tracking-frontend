import { apiClient, type RequestOptions } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  CreatePostInput,
  PostsQueryParams,
  PublicPost,
  UserPostsResponse,
} from "../types";

export interface GetPostsByUserOptions {
  params?: PostsQueryParams;
  signal?: AbortSignal;
}

/**
 * Service responsible for all Posts API operations.
 */
export const postsService = {
  /**
   * Retrieves a paginated list of posts published by a specific user.
   */
  async getPostsByUser(
    userId: string,
    options: GetPostsByUserOptions = {},
  ): Promise<UserPostsResponse> {
    const { params, signal } = options;
    return apiClient.get<UserPostsResponse>(
      API_ENDPOINTS.POSTS.BY_USER(userId),
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
        signal,
      },
    );
  },

  /**
   * Creates a new post. Authenticated user identity is attached automatically by the backend.
   */
  async createPost(
    input: CreatePostInput,
    options?: RequestOptions,
  ): Promise<PublicPost> {
    return apiClient.post<PublicPost>(API_ENDPOINTS.POSTS.CREATE, input, options);
  },
};
