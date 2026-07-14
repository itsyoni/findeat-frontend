import type { User } from "./user";

export type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;

  signup: (
    email: string,
    username: string,
    password: string,
    displayName: string,
  ) => Promise<{ email: string; emailVerificationRequired: true }>;

  verifyEmail: (email: string, code: string) => Promise<void>;

  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};
