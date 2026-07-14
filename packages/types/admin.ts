import type { BusinessAccount } from "./business";
import type { ManagedRestaurant } from "./restaurant";

export type RestaurantClaim = {
  id: string;
  evidenceText?: string | null;
  evidenceUrl?: string | null;
  createdAt: string;
  restaurant: Pick<
    ManagedRestaurant,
    "id" | "name" | "address" | "city"
  >;
  user: Pick<
    BusinessAccount,
    "id" | "email" | "username" | "displayName"
  >;
};

export type AdminUser = BusinessAccount & {
  isProtectedAdmin: boolean;
  isCurrentUser: boolean;
};
