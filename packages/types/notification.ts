import type { UserSummary } from './user';
import type { UserRelationship } from './profile';

export type NotificationType =
  | 'POST_LIKE'
  | 'POST_COMMENT'
  | 'COMMENT_LIKE'
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
  | 'RESTAURANT_CLAIM_REJECTED'
  | 'RESTAURANT_FOLLOW'
  | 'RESTAURANT_REVIEW';

export type AppNotification = {
  id: string;
  recipientId: string;
  actorId?: string | null;
  actor?: UserSummary | null;
  actorIsFollowing?: boolean;
  actorRelationship?: UserRelationship;
  type: NotificationType;
  title?: string | null;
  body?: string | null;
  postId?: string | null;
  postPreview?: {
    imageUrl?: string | null;
    text?: string | null;
    type?: 'CONTENT' | 'REVIEW';
    rating?: number | null;
  } | null;
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

export type RestaurantNotificationsPage = NotificationsPage & {
  unreadCount: number;
};
