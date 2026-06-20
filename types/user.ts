export type User = {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  avatarUrl?: string | null;
  bio?: string | null;
};

export type UserSummary = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
};
