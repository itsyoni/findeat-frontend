import { Post } from "./post";
import { User } from "./user";

export type Profile = User & {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  posts: Post[];
};
