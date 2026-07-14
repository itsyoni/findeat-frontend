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

export type RestaurantOwnershipUser = Pick<
  BusinessAccount,
  "id" | "email" | "username" | "displayName" | "avatarUrl"
>;

export type RestaurantOwnershipRecord = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  logoUrl?: string | null;
  status: "PENDING" | "VERIFIED" | "CLAIMED" | "REJECTED" | "MERGED";
  members: Array<{
    id: string;
    createdAt: string;
    user: RestaurantOwnershipUser;
  }>;
  claims: Array<{
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
    user: RestaurantOwnershipUser;
  }>;
};
