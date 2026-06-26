export type AccountType = "USER" | "BUSINESS";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  accountType: AccountType;
  createdAt: string;
  avatarUrl: string;
  bio?: string | null;
};

export type UserSummary = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  accountType: AccountType;
  isOnline?: boolean;
  lastSeenAt?: string | null;
};

export type Restaurant = {
  id: string;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  account?: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
  menus: {
    id: string;
    title: string;
    description?: string | null;
    items: {
      id: string;
      name: string;
      description?: string | null;
      price?: number | null;
      imageUrl?: string | null;
      category?: string | null;
      isAvailable: boolean;
      isFeatured: boolean;
    }[];
  }[];
  posts: {
    id: string;
    type: "CONTENT" | "REVIEW";
    description?: string | null;
    imageUrl?: string | null;
    rating?: number | null;
    user: {
      id: string;
      username: string;
      avatarUrl?: string | null;
      accountType: AccountType;
    };
    _count: {
      likes: number;
      comments: number;
    };
  }[];
};
