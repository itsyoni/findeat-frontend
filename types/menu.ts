export type Menu = {
  id: string;
  title: string;
  description?: string | null;
  items: Dish[];
};

type Dish = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  category?: string | null;
};
