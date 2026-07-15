import type { UserSummary } from "./user";

export type Dish = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  category?: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt?: string;
  reviewsCount?: number;
  averageRating?: number | null;
  isNew?: boolean;
};

type DishReview = {
  id: string;
  imageUrl?: string | null;
  rating?: number | null;
  text?: string | null;
  reviewPost?: {
    post?: {
      author?: UserSummary;
    };
  };
};

export type DishDetails = Dish & {
  restaurant?: {
    id: string;
    name: string;
    logoUrl?: string | null;
    city?: string | null;
  };
  menu?: Pick<Menu, "id" | "title"> | null;
  reviewItems?: DishReview[];
};

export type Menu = {
  id: string;
  title: string;
  description?: string | null;
  items: Dish[];
};
