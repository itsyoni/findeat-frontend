import type { Post } from "./post";
import type { RestaurantMembership } from "./restaurant";
import type { User } from "./user";

export type UserRelationship = "NONE" | "FOLLOWING" | "FOLLOWED_BY" | "FRIENDS";

export type Profile = User & {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  relationship: UserRelationship;
  isFollowing: boolean;
  posts: Post[];
  restaurantMemberships: RestaurantMembership[];
};
