import { Post } from "./post";
import { User } from "./user";

export type BusinessRestaurant = {
  id: string;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapboxId?: string | null;
  placeName?: string | null;
  phone?: string | null;
  website?: string | null;
  instagram?: string | null;
  menus: {
    id: string;
    title: string;
    description?: string | null;
    isActive: boolean;
    items: {
      id: string;
      name: string;
      description?: string | null;
      price?: number | null;
      imageUrl?: string | null;
      category?: string | null;
    }[];
  }[];
};

export type Profile = User & {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  posts: Post[];
  businessRestaurant?: BusinessRestaurant | null;
};
