import Avatar from "@/components/common/Avatar";
import { Restaurant } from "@findeat/types";
import { Image, View } from "react-native";
import Text from "../common/AppText";
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
            uri={restaurant.logoUrl}
            username={restaurant.name}
            size={96}
          />
        </View>

        <Text className="mt-4 text-3xl font-bold text-black">
          {restaurant.name}
        </Text>

        {!!restaurant.name && (
          <Text className="mt-1 text-gray-500">@{restaurant.name}</Text>
        )}

        {restaurant.id && (
          <RestaurantStats
            accountId={restaurant.id}
            postsCount={restaurant.posts.length}
            followersCount={restaurant.followersCount}
          />
        )}

        {!!restaurant.address && (
          <Text className="mt-6 text-gray-700">📍 {restaurant.address}</Text>
        )}

        {!!restaurant.city && (
          <Text className="mt-1 text-gray-500">{restaurant.city}</Text>
        )}

        {!!restaurant.bio && (
          <Text className="mt-5 text-base leading-6 text-gray-700">
            {restaurant.bio}
          </Text>
        )}

        {!!restaurant.id && (
          <RestaurantFollowButton
            isFollowing={restaurant.isFollowing}
            onPress={onToggleFollow}
          />
        )}
      </View>
    </>
  );
}
