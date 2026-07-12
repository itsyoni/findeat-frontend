import Avatar from '@/components/common/Avatar';
import { useAppTheme } from '@/contexts/ThemeContext';
import type { AppNotification } from '@findeat/types';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  notificationText,
  relativeNotificationTime,
} from './notificationHelpers';

type Props = { item: AppNotification; onPress: () => void };

export default function NotificationRow({ item, onPress }: Props) {
  const { t, i18n } = useTranslation('notifications');
  const { isDark } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="flex-row items-center px-5 py-3"
      style={{ backgroundColor: item.readAt ? 'transparent' : isDark ? '#172033' : '#F2F7FF' }}
    >
      <Avatar uri={item.actor?.avatarUrl} size={48} />
      <View className="ml-3 flex-1">
        <Text className="text-[15px] text-black dark:text-white">
          {notificationText(item, t)}
        </Text>
        {item.body ? (
          <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {item.body}
          </Text>
        ) : null}
        <Text className="mt-1 text-xs text-gray-400">
          {relativeNotificationTime(item.createdAt, i18n.language)}
        </Text>
      </View>
      {!item.readAt ? <View className="ml-3 h-2.5 w-2.5 rounded-full bg-blue-500" /> : null}
    </TouchableOpacity>
  );
}
