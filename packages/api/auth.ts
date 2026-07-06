import type { Profile } from "@findeat/types";
import type { AxiosInstance } from "axios";

export function createAuthApi(api: AxiosInstance) {
  return {
    async signup(payload: {
      email: string;
      username: string;
      password: string;
      displayName: string;
    }) {
      const { data } = await api.post<{
        user: Profile;
        accessToken: string;
      }>("/auth/signup", payload);

      return data;
    },

    async login(payload: { email: string; password: string }) {
      const { data } = await api.post<{
        user: Profile;
        accessToken: string;
      }>("/auth/login", payload);

      return data;
    },

    async checkAvailability(payload: { username?: string; email?: string }) {
      const { data } = await api.get("/auth/check-availability", {
        params: payload,
      });

      return data;
    },

    async me() {
      const { data } = await api.get<Profile>("/auth/me");
      return data;
    },
  };
}
