import { BusinessRestaurant } from "./restaurant";

export type AccountType = "USER" | "BUSINESS";

export type User = {
  id: string;
  email: string;
  displayName: string;
  username: string;
  accountType: AccountType;
  createdAt: string;
  avatarUrl: string;
  coverUrl?: string | null;
  bio?: string | null;
  businessRestaurants?: BusinessRestaurant[];
};

export type UserSummary = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  accountType: AccountType;
  isOnline?: boolean;
  lastSeenAt?: string | null;
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
