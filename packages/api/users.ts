import type {
  ConnectionItem,
  BlockedUser,
  Language,
  Profile,
  UserRelationship,
  UserSearchResult,
} from "@findeat/types";
import type { AxiosInstance } from "axios";

export function createUsersApi(api: AxiosInstance) {
  return {
    async search(query: string) {
      const { data } = await api.get<UserSearchResult[]>("/users/search", {
        params: { q: query },
      });

      return data;
    },

    async searchFriends(query: string) {
      const { data } = await api.get<UserSearchResult[]>(
        "/users/friends/search",
        {
          params: { q: query },
        },
      );

      return data;
    },

    async suggestedFriends() {
      const { data } = await api.get<UserSearchResult[]>(
        "/users/friends/suggested",
      );
      return data;
    },

    async me() {
      const { data } = await api.get<Profile>("/users/me");
      return data;
    },

    async updateMe(payload: {
      username?: string;
      bio?: string | null;
      avatarUrl?: string;
      displayName?: string;
      coverUrl?: string | null;
      email?: string;
      password?: string;
      language?: Language;
      showActivityStatus?: boolean;
    }) {
      const { data } = await api.patch<Profile>("/users/me", payload);
      return data;
    },

    async follow(id: string) {
      const { data } = await api.post<{
        ok: boolean;
        relationship: UserRelationship;
      }>(`/users/${id}/follow`);

      return data;
    },

    async unfollow(id: string) {
      const { data } = await api.delete<{
        ok: boolean;
        relationship: UserRelationship;
      }>(`/users/${id}/follow`);

      return data;
    },

    async followers(id: string) {
      const { data } = await api.get<ConnectionItem[]>(
        `/users/${id}/followers`,
      );

      return data;
    },

    async following(id: string) {
      const { data } = await api.get<ConnectionItem[]>(
        `/users/${id}/following`,
      );

      return data;
    },

    async friends(id: string) {
      const { data } = await api.get<ConnectionItem[]>(`/users/${id}/friends`);
      return data;
    },

    async get(id: string) {
      const { data } = await api.get<Profile>(`/users/${id}`);
      return data;
    },

    async block(id: string) {
      const { data } = await api.post<{ ok: true }>(`/users/${id}/block`);
      return data;
    },

    async unblock(id: string) {
      const { data } = await api.delete<{ ok: true }>(`/users/${id}/block`);
      return data;
    },

    async blockedUsers() {
      const { data } = await api.get<BlockedUser[]>("/users/me/blocked");
      return data;
    },

    async removeAvatar() {
      const { data } = await api.delete<{ id: string; avatarUrl: string }>(
        "/users/me/avatar",
      );

      return data;
    },

    async toggleFollow(id: string, isFollowing: boolean) {
      return isFollowing ? this.unfollow(id) : this.follow(id);
    },
  };
}
