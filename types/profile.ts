import { Post } from "./post";

export type Profile = {
  id: string;
  email: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  posts: Post[];
};

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  posts: Post[];
};
