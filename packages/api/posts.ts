import type { Comment, FeedPage, Post, PostType, PostVisibility } from "@findeat/types";
import type { AxiosInstance } from "axios";

export function createPostsApi(api: AxiosInstance) {
  const commentsCache = new Map<
    string,
    { comments: Comment[]; expiresAt: number }
  >();
  const commentsCacheTtlMs = 5_000;

  return {
    async createContent(payload: {
      description: string;
      imageUrl?: string;
      restaurantId?: string;
      visibility?: PostVisibility;
    }) {
      const { data } = await api.post<Post>("/posts/content", payload);

      return data;
    },

    async createReview(payload: {
      restaurantId: string;
      visibility?: PostVisibility;
      coverImageUrl?: string;
      summary?: string;
      overallRating?: number;
      atmosphereRating?: number;
      serviceRating?: number;
      valueRating?: number;
      totalPrice?: number;
      items: Array<{
        menuItemId?: string | null;
        customDishName?: string | null;
        customPrice?: number | null;
        imageUrl?: string | null;
        rating?: number | null;
        text?: string | null;
        order: number;
      }>;
    }) {
      const { data } = await api.post<Post>("/posts/review", payload);

      return data;
    },

    async all() {
      const { data } = await api.get<Post[]>("/posts");
      return data;
    },

    async mine() {
      const { data } = await api.get<Post[]>("/posts/me");
      return data;
    },

    async createRestaurantPost(
      restaurantId: string,
      payload: {
        description: string;
        imageUrl?: string;
      },
    ) {
      const { data } = await api.post<Post>(
        `/posts/restaurants/${restaurantId}/posts`,
        payload,
      );

      return data;
    },

    async feed(
      type?: PostType,
      options?: { cursor?: string; limit?: number },
    ) {
      const { data } = await api.get<FeedPage>("/posts/feed", {
        params: {
          ...(type ? { type } : {}),
          ...(options?.cursor ? { cursor: options.cursor } : {}),
          ...(options?.limit ? { limit: options.limit } : {}),
        },
      });

      return data;
    },

    async get(id: string) {
      const { data } = await api.get<Post>(`/posts/${id}`);
      return data;
    },

    async updateContent(id: string, payload: { description: string }) {
      const { data } = await api.patch<Post>(`/posts/${id}/content`, payload);
      return data;
    },

    async updateReview(
      id: string,
      payload: {
        summary: string;
        items: Array<{ id: string; text: string }>;
        removedItemIds: string[];
      },
    ) {
      const { data } = await api.patch<Post>(`/posts/${id}/review`, payload);
      return data;
    },

    async like(id: string) {
      const { data } = await api.post<{
        ok: boolean;
        isLiked: boolean;
        likesCount: number;
      }>(`/posts/${id}/like`);
      return data;
    },

    async unlike(id: string) {
      const { data } = await api.delete<{
        ok: boolean;
        isLiked: boolean;
        likesCount: number;
      }>(`/posts/${id}/like`);
      return data;
    },

    async addComment(id: string, content: string, replyToId?: string) {
      const { data } = await api.post<Comment>(`/posts/${id}/comments`, {
        content,
        replyToId,
      });

      commentsCache.delete(id);

      return data;
    },

    async comments(id: string) {
      const cached = commentsCache.get(id);

      if (cached && cached.expiresAt > Date.now()) {
        return cached.comments;
      }

      const { data } = await api.get<Comment[]>(`/posts/${id}/comments`);

      commentsCache.set(id, {
        comments: data,
        expiresAt: Date.now() + commentsCacheTtlMs,
      });

      return data;
    },

    async likeComment(id: string, commentId: string) {
      const { data } = await api.post<{
        isLiked: boolean;
        likesCount: number;
        likedByAuthor: boolean;
      }>(`/posts/${id}/comments/${commentId}/like`);
      commentsCache.delete(id);
      return data;
    },

    async unlikeComment(id: string, commentId: string) {
      const { data } = await api.delete<{
        isLiked: boolean;
        likesCount: number;
        likedByAuthor: boolean;
      }>(`/posts/${id}/comments/${commentId}/like`);
      commentsCache.delete(id);
      return data;
    },

    async toggleLike(id: string, isLiked: boolean) {
      return isLiked ? this.unlike(id) : this.like(id);
    },

    async delete(id: string) {
      const { data } = await api.delete(`/posts/${id}`);
      return data;
    },
  };
}
