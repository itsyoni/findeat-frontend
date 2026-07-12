import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/contexts/ThemeContext';
import Text from '../common/AppText';

type Props = {
  averageRating: number | null;
  reviewsCount: number;
  followersCount: number;
};

export default function RestaurantStats({
  averageRating,
  reviewsCount,
  followersCount,
}: Props) {
  const { t } = useTranslation('restaurants');
  const { isDark } = useAppTheme();
  const valueColor = isDark ? '#FFF' : '#111';

  const stats = [
    {
      label: t('overallRating'),
      value: averageRating == null ? '—' : `⭐ ${averageRating.toFixed(1)}`,
    },
    { label: t('reviewsCount'), value: reviewsCount.toLocaleString() },
    { label: t('followersCount'), value: followersCount.toLocaleString() },
  ];

  return (
    <View className="mt-5 w-full flex-row">
      {stats.map((stat) => (
        <View key={stat.label} className="flex-1 items-center px-1">
          <Text weight="bold" className="text-xl" style={{ color: valueColor }}>
            {stat.value}
          </Text>
          <Text className="mt-1 text-center text-xs text-gray-500">
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
