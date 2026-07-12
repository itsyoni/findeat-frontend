import { Restaurant } from '@findeat/types';
import { router } from 'expo-router';
import { ImagesSquareIcon } from 'phosphor-react-native';
import { ActivityIndicator, Image, Pressable, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import Text from '../common/AppText';
import { useTranslation } from 'react-i18next';

type Props = {
  posts: Restaurant['posts'];
  emptyText: string;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
};

export default function RestaurantPostsSection({ posts, emptyText, loading, loadingMore, hasMore, onLoadMore }: Props) {
  const { isDark } = useAppTheme();
  const { t } = useTranslation('restaurants');

  if (loading) {
    return <ActivityIndicator className="my-16" />;
  }

  if (posts.length === 0) {
    return (
      <View className="items-center justify-center py-16">
        <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-700">
          <ImagesSquareIcon size={28} color={isDark ? '#FFF' : '#111'} />
        </View>
        <Text className="mt-4 text-center text-gray-500">{emptyText}</Text>
      </View>
    );
  }

  return (
    <View className="-mx-6">
      <View className="flex-row flex-wrap">
        {posts.map((post) => (
        <Pressable
          key={post.id}
          onPress={() => router.push({ pathname: '/(posts)/[id]', params: { id: post.id } })}
          className="aspect-square w-1/3 border-[0.5px] border-gray-100 bg-gray-200 dark:border-gray-900"
        >
          {post.imageUrl ? (
            <Image source={{ uri: post.imageUrl }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <View className="h-full w-full items-center justify-center bg-gray-900 p-2">
              <Text className="text-center text-xs text-white" numberOfLines={4}>{post.description}</Text>
            </View>
          )}
          {post.type === 'REVIEW' && post.rating != null ? (
            <View className="absolute right-2 top-2 rounded-full bg-black/65 px-2 py-1">
              <Text className="text-xs font-bold text-white">⭐ {post.rating}</Text>
            </View>
          ) : null}
        </Pressable>
        ))}
      </View>
      {hasMore ? (
        <TouchableOpacity disabled={loadingMore} onPress={onLoadMore} className="mx-6 my-5 rounded-xl bg-gray-100 py-3 dark:bg-gray-800">
          {loadingMore ? <ActivityIndicator /> : <Text className="text-center font-bold text-black dark:text-white">{t('loadMore')}</Text>}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
