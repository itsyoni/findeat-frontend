import type {
  ProfileTagCollection,
  ProfileTagKey,
  ProfileTagStatus,
} from "@findeat/types";
import type { AxiosInstance } from "axios";

export function createProfileTagsApi(api: AxiosInstance) {
  return {
    async mine() {
      const { data } = await api.get<ProfileTagCollection>("/profile-tags/me");
      return data;
    },
    async status() {
      const { data } = await api.get<ProfileTagStatus>("/profile-tags/me/status");
      return data;
    },
    async markSeen() {
      const { data } = await api.patch<{ ok: true }>("/profile-tags/me/seen");
      return data;
    },
    async select(key: ProfileTagKey | null) {
      const { data } = await api.patch<{ selectedKey: ProfileTagKey | null }>(
        "/profile-tags/me/selected",
        { key },
      );
      return data;
    },
  };
}
