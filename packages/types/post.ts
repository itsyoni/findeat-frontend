import type { Restaurant } from "./restaurant";
import type { UserSummary } from "./user";

export type PostType = "CONTENT" | "REVIEW";
export type PostVisibility = "PUBLIC" | "FRIENDS" | "PRIVATE";

export type ReviewRecommendedFor =
  | "DATE"
  | "FRIENDS"
  | "FAMILY"
  | "SOLO"
  | "BUSINESS"
  | "QUICK_BITE";

export type ContentPost = {
  postId: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
};

export type ReviewItem = {
  id: string;
  reviewPostId: string;

  menuItemId?: string | null;
  menuItem?: {
    id: string;
    name: string;
    description?: string | null;
    price?: number | null;
    imageUrl?: string | null;
    category?: string | null;
  } | null;

  customDishName?: string | null;
  customPrice?: number | null;

  imageUrl?: string | null;
  rating?: number | null;
  text?: string | null;
  order: number;

  createdAt: string;
  updatedAt: string;
};

export type ReviewPost = {
  postId: string;

  coverImageUrl?: string | null;
  title?: string | null;
  summary?: string | null;
  visitDate?: string | null;

  overallRating?: number | null;
  atmosphereRating?: number | null;
  serviceRating?: number | null;
  valueRating?: number | null;

  totalPrice?: number | null;
  currency: string;

  wouldReturn?: boolean | null;
  recommendedFor?: ReviewRecommendedFor | null;

  items: ReviewItem[];
};

export type PostAuthorRestaurant = {
  id: string;
  name: string;
  logoUrl?: string | null;
};

export type Post = {
  id: string;
  type: PostType;
  visibility: PostVisibility;

  authorId?: string | null;
  author?: UserSummary | null;

  authorRestaurantId?: string | null;
  authorRestaurant?: PostAuthorRestaurant | null;

  restaurantId?: string | null;
  restaurant?: Restaurant | null;

  contentPost?: ContentPost | null;
  reviewPost?: ReviewPost | null;

  createdAt: string;
  updatedAt: string;

  likesCount: number;
  restaurantSavesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  canDelete: boolean;
};

export type FeedPage = {
  items: Post[];
  nextCursor: string | null;
};
