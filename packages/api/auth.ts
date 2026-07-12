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
        email: string;
        emailVerificationRequired: true;
      }>("/auth/signup", payload);

      return data;
    },

    async verifyEmail(email: string, code: string) {
      const { data } = await api.post<{ user: Profile; accessToken: string }>(
        "/auth/email/verify",
        { email, code },
      );
      return data;
    },

    async resendVerification(email: string) {
      const { data } = await api.post<{ ok: boolean }>("/auth/email/resend", { email });
      return data;
    },

    async forgotPassword(email: string) {
      const { data } = await api.post<{ ok: boolean }>("/auth/password/forgot", { email });
      return data;
    },

    async resetPassword(email: string, code: string, password: string) {
      const { data } = await api.post<{ ok: boolean }>("/auth/password/reset", {
        email,
        code,
        password,
      });
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
