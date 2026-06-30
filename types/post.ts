import { Restaurant } from "./restaurant";
import { UserSummary } from "./user";

export type PostType = "CONTENT" | "REVIEW";

export type Post = {
  id: string;
  type: PostType;

  title?: string | null;
  description?: string | null;

  imageUrl?: string | null;
  videoUrl?: string | null;

  rating?: number | null;
  visitDate?: string | null;

  restaurantId?: string | null;
  restaurant?: Restaurant | null;

  createdAt: string;
  updatedAt: string;
  isOfficial: boolean;
  author: UserSummary;

  likesCount: number;
  restaurantSavesCount: number;
  commentsCount: number;
  isLiked: boolean;
};
