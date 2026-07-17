import type { Post } from "./post";
import type { RestaurantMembership } from "./restaurant";
import type { User } from "./user";

export const PRONOUN_OPTIONS = [
  "SHE_HER",
  "HE_HIM",
  "THEY_THEM",
  "SHE_THEY",
  "HE_THEY",
  "ANY_PRONOUNS",
  "USE_MY_NAME",
  "ASK_ME",
  "ZE_HIR",
  "XE_XEM",
  "EY_EM",
  "FAE_FAER",
  "VE_VER",
  "IT_ITS",
] as const;

export type UserRelationship =
  | "NONE"
  | "FOLLOWING"
  | "FOLLOWED_BY"
  | "FRIENDS"
  | "REQUESTED";

export type Profile = User & {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  relationship: UserRelationship;
  isFollowing: boolean;
  canViewPrivateContent?: boolean;
  followRequestsCount?: number;
  posts: Post[];
  restaurantMemberships: RestaurantMembership[];
};
