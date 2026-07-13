export type Language = "EN" | "HE";

export type User = {
  id: string;
  email: string;
  displayName: string;
  username: string;
  createdAt: string;
  avatarUrl: string;
  coverUrl?: string | null;
  bio?: string | null;
  language: Language;
  showActivityStatus?: boolean;
};

export type UserSummary = {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
  showActivityStatus?: boolean;
};

export type UserRestaurant = {
  id: string;
  wantToTry: boolean;
  visited: boolean;
  favorite: boolean;
  savedFromPostId?: string | null;
  visitedAt?: string | null;
  favoritedAt?: string | null;
};
