export type Post = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
};
