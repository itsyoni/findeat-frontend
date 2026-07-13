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

export type Menu = {
  id: string;
  title: string;
  description?: string | null;
  items: Dish[];
};
