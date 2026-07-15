import type { UserSummary } from "./user";

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: UserSummary;
  parentId?: string | null;
  parent?: {
    id: string;
    content: string;
    user: UserSummary;
  } | null;
  likesCount: number;
  isLiked: boolean;
  likedByAuthor: boolean;
  canDelete: boolean;
  canModerate: boolean;
  isPinned: boolean;
  canPin: boolean;
  mentions?: { user: UserSummary }[];
};
