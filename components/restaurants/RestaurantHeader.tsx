import Avatar from "@/components/Avatar";
import { Restaurant } from "@/types";
import { Image, Text, View } from "react-native";
import RestaurantFollowButton from "./RestaurantFollowButton";
import RestaurantStats from "./RestaurantStats";

type Props = {
  restaurant: Restaurant;
  onToggleFollow: () => void;
};

export default function RestaurantHeader({
  restaurant,
  onToggleFollow,
}: Props) {
  return (
    <>
      {restaurant.coverUrl ? (
        <Image
          source={{ uri: restaurant.coverUrl }}
          className="h-56 w-full bg-gray-100"
          resizeMode="cover"
        />
      ) : (
        <View className="h-56 w-full bg-gray-100" />
      )}

      <View className="px-6 pb-10">
        <View className="-mt-12">
          <Avatar
            uri={restaurant.avatarUrl}
            username={restaurant.name}
            size={96}
          />
        </View>

        <Text className="mt-4 text-3xl font-bold text-black">
          {restaurant.name}
        </Text>

        {!!restaurant.account?.username && (
          <Text className="mt-1 text-gray-500">
            @{restaurant.account.username}
          </Text>
        )}

        {restaurant.account?.id && (
          <RestaurantStats
            accountId={restaurant.account.id}
            postsCount={restaurant.posts.length}
            followersCount={restaurant.followersCount}
            followingCount={restaurant.followingCount}
          />
        )}

        {!!restaurant.address && (
          <Text className="mt-6 text-gray-700">📍 {restaurant.address}</Text>
        )}

        {!!restaurant.city && (
          <Text className="mt-1 text-gray-500">{restaurant.city}</Text>
        )}

        {!!restaurant.description && (
          <Text className="mt-5 text-base leading-6 text-gray-700">
            {restaurant.description}
          </Text>
        )}

        {!!restaurant.account?.id && (
          <RestaurantFollowButton
            isFollowing={restaurant.isFollowing}
            onPress={onToggleFollow}
          />
        )}
      </View>
    </>
  );
}
