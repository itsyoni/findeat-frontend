import type { UserSummary } from './user';

export type NotificationType =
  | 'POST_LIKE'
  | 'POST_COMMENT'
  | 'COMMENT_REPLY'
  | 'FOLLOW'
  | 'FOLLOW_BACK'
  | 'FRIEND'
  | 'MESSAGE'
  | 'GROUP_INVITE'
  | 'GROUP_JOIN'
  | 'POLL_CREATED'
  | 'POLL_ENDED'
  | 'RESTAURANT_CLAIM_APPROVED'
  | 'RESTAURANT_CLAIM_REJECTED';

export type AppNotification = {
  id: string;
  recipientId: string;
  actorId?: string | null;
  actor?: UserSummary | null;
  type: NotificationType;
  title?: string | null;
  body?: string | null;
  postId?: string | null;
  commentId?: string | null;
  conversationId?: string | null;
  restaurantId?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export type NotificationsPage = {
  items: AppNotification[];
  nextCursor: string | null;
};
