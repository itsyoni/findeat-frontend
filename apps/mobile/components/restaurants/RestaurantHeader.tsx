import Avatar from '@/components/common/Avatar';
import { Restaurant } from '@findeat/types';
import { router } from 'expo-router';
import { ArrowLeftIcon, CaretRightIcon, ChatCircleIcon, DotsThreeIcon, MapPinIcon } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { Image, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../common/AppText';
import RestaurantFollowButton from './RestaurantFollowButton';
import RestaurantStats from './RestaurantStats';
import RestaurantBadge from './RestaurantBadge';

type Props = {
  restaurant: Restaurant;
  onToggleFollow: () => void;
  onOpenOptions: () => void;
};

export default function RestaurantHeader({ restaurant, onToggleFollow, onOpenOptions }: Props) {
  const { t } = useTranslation('restaurants');
  const location = [restaurant.address, restaurant.city].filter(Boolean).join(', ');
  const reviewPosts = restaurant.posts.filter((post) => post.type === 'REVIEW');
  const ratings = reviewPosts
    .map((post) => post.rating)
    .filter((rating): rating is number => rating != null);
  const averageRating = ratings.length > 0
    ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
    : null;
  return (
    <View className="items-center pb-5">
      {restaurant.coverUrl ? (
        <Image source={{ uri: restaurant.coverUrl }} className="h-52 w-full bg-gray-100" resizeMode="cover" />
      ) : (
        <View className="h-52 w-full bg-gray-100 dark:bg-gray-800" />
      )}
      <SafeAreaView edges={["top"]} pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
        <View className="flex-row items-center justify-between px-4 pt-2">
          <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-black/45">
            <ArrowLeftIcon size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenOptions} className="h-11 w-11 items-center justify-center rounded-full bg-black/45">
            <DotsThreeIcon size={25} color="white" weight="bold" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <View className="-mt-14 rounded-full bg-white p-1.5 dark:bg-black">
        <Avatar uri={restaurant.logoUrl} username={restaurant.name} size={104} fallbackType="restaurant" />
      </View>
      <View className="mt-3 flex-row items-center justify-center px-6">
        <Text weight="bold" className="text-center text-2xl text-black dark:text-white">{restaurant.name}</Text>
        <RestaurantBadge size={19} status={restaurant.status} />
      </View>
      {location ? (
        <TouchableOpacity
          activeOpacity={0.7}
          className="mt-3 flex-row items-center rounded-full bg-blue-50 px-3 py-2 dark:bg-blue-950/40"
          onPress={() =>
            router.push({
              pathname: '/(tabs)/map',
              params: { restaurantId: restaurant.id },
            })
          }
        >
          <MapPinIcon size={16} color="#3B82F6" weight="fill" />
          <Text className="ml-1.5 max-w-72 text-center font-medium text-blue-600 dark:text-blue-400">{location}</Text>
          <CaretRightIcon size={14} color="#3B82F6" weight="bold" />
        </TouchableOpacity>
      ) : null}
      {restaurant.bio ? <Text className="mt-4 px-8 text-center leading-6 text-gray-700 dark:text-gray-300">{restaurant.bio}</Text> : null}
      <RestaurantStats
        averageRating={averageRating}
        reviewsCount={reviewPosts.length}
        followersCount={restaurant.followersCount}
      />
      {restaurant.status === 'CLAIMED' ? (
        <View className="mt-5 w-full flex-row gap-3 px-5">
          <RestaurantFollowButton className="flex-1" isFollowing={restaurant.isFollowing} onPress={onToggleFollow} />
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-xl bg-gray-100 py-3 dark:bg-gray-800"
            onPress={() => router.push({ pathname: '/chats/[id]', params: { id: 'new-restaurant', type: 'RESTAURANT', restaurantId: restaurant.id, title: restaurant.name, imageUrl: restaurant.logoUrl ?? '' } })}
          >
            <ChatCircleIcon size={20} color="#6B7280" />
            <Text className="ml-2 font-bold text-black dark:text-white">{t('message')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <RestaurantFollowButton isFollowing={restaurant.isFollowing} onPress={onToggleFollow} />
      )}
    </View>
  );
}
