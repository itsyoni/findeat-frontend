import { Menu } from "./menu";
import { UserRestaurant, UserSummary } from "./user";

export type RestaurantStatus =
  | "PENDING"
  | "VERIFIED"
  | "CLAIMED"
  | "REJECTED"
  | "MERGED";

export type RestaurantSource = "USER" | "MAPBOX" | "GOOGLE" | "OSM" | "ADMIN";

export type RestaurantPostPreview = {
  id: string;
  type: "CONTENT" | "REVIEW";
  description?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  author: UserSummary;
  _count: {
    likes: number;
    comments: number;
  };
};

export type RestaurantMembership = {
  role: "OWNER" | "MANAGER" | "STAFF";
  restaurant: {
    id: string;
    name: string;
    logoUrl: string | null;
    city: string | null;
    status: string;
  };
};

export type ManagedRestaurant = Restaurant;

export type Restaurant = {
  id: string;
  name: string;
  bio?: string | null;
  logoUrl?: string | null;
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

  status?: RestaurantStatus;
  source?: RestaurantSource;

  followersCount: number;
  isFollowing: boolean;

  userSaves?: UserRestaurant[];
  userRestaurant?: UserRestaurant | null;

  menus: Menu[];
  posts: RestaurantPostPreview[];
};

export type GoogleRestaurantSuggestion = {
  source: "GOOGLE";
  googlePlaceId: string;
  name: string;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type SelectedRestaurant =
  | {
      source: "FINDEAT";
      restaurant: Restaurant;
    }
  | GoogleRestaurantSuggestion;

export type RestaurantSearchResponse = {
  findeat: Restaurant[];
  google: GoogleRestaurantSuggestion[];
};
