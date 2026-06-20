import { UserSummary } from "./user";

export type Post = {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  user: UserSummary;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
};
