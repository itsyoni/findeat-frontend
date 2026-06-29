import { Menu } from "./menu";
import { AccountType, UserRestaurant } from "./user";

export type RestaurantAccount = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  accountType?: AccountType;
};

export type BusinessRestaurant = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapboxId?: string | null;
  googlePlaceId?: string | null;
  placeName?: string | null;
  phone?: string | null;
  website?: string | null;
  instagram?: string | null;
  status?: "PENDING" | "VERIFIED" | "CLAIMED" | "REJECTED" | "MERGED";
  source?: "USER" | "MAPBOX" | "GOOGLE" | "OSM" | "ADMIN";
  menus?: Menu[];
};

export type RestaurantPostPreview = {
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
  mapboxId?: string | null;
  googlePlaceId?: string | null;
  placeName?: string | null;
  phone?: string | null;
  website?: string | null;
  instagram?: string | null;
  status?: "PENDING" | "VERIFIED" | "CLAIMED" | "REJECTED" | "MERGED";
  source?: "USER" | "MAPBOX" | "GOOGLE" | "OSM" | "ADMIN";

  followersCount: number;
  followingCount: number;
  isFollowing: boolean;

  userSaves?: UserRestaurant[];
  userRestaurant?: UserRestaurant | null;

  account?: RestaurantAccount | null;

  menus: Menu[];
  posts: RestaurantPostPreview[];
};
