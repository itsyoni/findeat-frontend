import type { Menu } from "./menu";
import type { UserRestaurant, UserSummary } from "./user";

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
    status: RestaurantStatus;
  };
};

export type ManagedRestaurant = {
  id: string;
  name: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  website?: string | null;
  instagram?: string | null;
  bio?: string | null;
  categories: string[];
  setupComplete: boolean;
  missingSetupFields: string[];
  followersCount?: number;
  averageRating?: number | null;
  reviewsCount?: number;
};

export const RESTAURANT_CATEGORY_OPTIONS = [
  "Cafe",
  "Bakery",
  "Fast food",
  "Casual dining",
  "Fine dining",
  "Bar",
  "Desserts",
  "Italian",
  "Japanese",
  "Chinese",
  "Indian",
  "Thai",
  "Mexican",
  "Mediterranean",
  "Middle Eastern",
  "American",
  "Korean",
  "Greek",
  "Vegan",
  "Other",
] as const;

export type RestaurantPostSection = "OFFICIAL" | "COMMUNITY" | "REVIEWS";

export type RestaurantPostsPage = {
  items: RestaurantPostPreview[];
  nextCursor: string | null;
};

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
  averageRating?: number | null;
  reviewsCount?: number;
  distanceKm?: number;
  compatibility?: {
    allergenWarnings: Array<{ tag: string; dishCount: number }>;
    dietaryMatches: Array<{ tag: string; dishCount: number }>;
    cuisineMatches: Array<{ tag: string; dishCount: number }>;
  };
};

export type RestaurantMapFilter =
  | "ALL"
  | "SAVED"
  | "WANT_TO_TRY"
  | "VISITED"
  | "FAVORITE"
  | "CLAIMED";

export type RestaurantMapSort =
  | "BEST"
  | "DISTANCE"
  | "RATING"
  | "MOST_REVIEWED";

export type GoogleRestaurantSuggestion = {
  source: "GOOGLE";
  googlePlaceId: string;
  name: string;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number;
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
