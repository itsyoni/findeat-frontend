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
  descriptionEditedAt?: string | null;
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
    dishTags?: string[];
  } | null;

  customDishName?: string | null;
  customPrice?: number | null;

  imageUrl?: string | null;
  rating?: number | null;
  text?: string | null;
  textEditedAt?: string | null;
  tagSnapshot?: string[];
  order: number;

  createdAt: string;
  updatedAt: string;
};

export type ReviewPost = {
  postId: string;

  coverImageUrl?: string | null;
  title?: string | null;
  summary?: string | null;
  summaryEditedAt?: string | null;
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

export type LinkedPost = {
  id: string;
  type: PostType;
  visibility: PostVisibility;
  authorId?: string | null;
  restaurantId?: string | null;
  createdAt: string;
  contentPost?: Pick<
    ContentPost,
    "imageUrl" | "videoUrl" | "description"
  > | null;
  reviewPost?: Pick<
    ReviewPost,
    "coverImageUrl" | "summary" | "overallRating"
  > | null;
};

type PostAuthorRestaurant = {
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
  experienceId?: string | null;
  linkedPosts?: LinkedPost[];

  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;

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
