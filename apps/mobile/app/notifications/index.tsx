import NotificationRow from '@/components/notifications/NotificationRow';
import { notificationHref } from '@/components/notifications/notificationHelpers';
import { useAppTheme } from '@/contexts/ThemeContext';
import {
  notificationUnreadQueryKey,
  notificationsQueryKey,
  useNotifications,
} from '@/hooks/useNotifications';
import { api } from '@/lib/api';
import type { AppNotification } from '@findeat/types';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowLeftIcon, BellIcon } from 'phosphor-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const { t } = useTranslation('notifications');
  const { isDark } = useAppTheme();
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const items = useMemo(
    () => notifications.data?.pages.flatMap((page) => page.items) ?? [],
    [notifications.data],
  );

  async function open(item: AppNotification) {
    if (!item.readAt) await api.notifications.markRead(item.id);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
      queryClient.invalidateQueries({ queryKey: notificationUnreadQueryKey }),
    ]);
    const href = notificationHref(item);
    if (href) router.push(href);
  }

  async function markAllRead() {
    await api.notifications.markAllRead();
    queryClient.setQueryData(notificationUnreadQueryKey, { count: 0 });
    void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#FFF' }}>
      <View className="h-14 flex-row items-center border-b border-gray-100 px-4 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} className="p-2">
          <ArrowLeftIcon size={24} color={isDark ? '#FFF' : '#111'} />
        </TouchableOpacity>
        <Text className="ml-2 flex-1 text-xl font-bold text-black dark:text-white">{t('title')}</Text>
        {items.some((item) => !item.readAt) ? (
          <TouchableOpacity onPress={() => void markAllRead()} className="p-2">
            <Text className="font-semibold text-blue-500">{t('markAllRead')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {notifications.isPending ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationRow item={item} onPress={() => void open(item)} />}
          onEndReached={() => {
            if (notifications.hasNextPage && !notifications.isFetchingNextPage) {
              void notifications.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          refreshing={notifications.isRefetching && !notifications.isFetchingNextPage}
          onRefresh={() => void notifications.refetch()}
          ListFooterComponent={notifications.isFetchingNextPage ? <ActivityIndicator className="my-5" /> : null}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-10 pt-40">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                <BellIcon size={30} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-semibold text-black dark:text-white">{t('emptyTitle')}</Text>
              <Text className="mt-1 text-center text-gray-500">{t('emptyBody')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
