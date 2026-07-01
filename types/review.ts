import { SelectedRestaurant } from "./restaurant";

export type CreateReviewStep =
  | "RESTAURANT"
  | "COVER"
  | "DISHES"
  | "ADD_DISH"
  | "PREVIEW";

export type ReviewDishDraft = {
  id: string;
  menuItemId?: string;
  menuItemName?: string;
  menuItemPrice?: number | null;

  customDishName?: string;
  customPrice?: number;

  imageUri?: string;
  rating?: number;
  text?: string;
  order: number;
};

export type CreateReviewDraft = {
  restaurant: SelectedRestaurant | null;
  coverImageUri?: string;
  summary: string;
  overallRating?: number;
  atmosphereRating?: number;
  serviceRating?: number;
  valueRating?: number;
  totalPrice?: number;
  items: ReviewDishDraft[];
};
