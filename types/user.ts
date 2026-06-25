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
  account?: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
  menus: {
    id: string;
    title: string;
    items: {
      id: string;
      name: string;
      description?: string | null;
      price?: number | null;
      imageUrl?: string | null;
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
    };
    _count: {
      likes: number;
      comments: number;
    };
  }[];
};
