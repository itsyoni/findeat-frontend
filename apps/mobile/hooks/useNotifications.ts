import { api } from '@/lib/api';
import type { NotificationsPage } from '@findeat/types';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export const notificationsQueryKey = ['notifications'] as const;
export const notificationUnreadQueryKey = ['notifications', 'unread'] as const;

export function useNotifications(enabled = true) {
  return useInfiniteQuery<NotificationsPage>({
    queryKey: notificationsQueryKey,
    queryFn: ({ pageParam }) => api.notifications.list(pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled,
  });
}

export function useNotificationUnreadCount(enabled = true) {
  return useQuery({
    queryKey: notificationUnreadQueryKey,
    queryFn: () => api.notifications.unreadCount(),
    enabled,
  });
}
