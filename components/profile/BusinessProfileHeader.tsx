import Avatar from "@/components/Avatar";
import { Profile } from "@/types/profile";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import Text from "../AppText";

type Props = {
  profile: Profile;
};

export default function BusinessProfileHeader({ profile }: Props) {
  const restaurant = profile.businessRestaurants?.[0];

  return (
    <View className="bg-white px-5 pb-5">
      <View className="items-center">
        <Avatar uri={profile.avatarUrl} username={profile.username} size={96} />

        <Text className="mt-2 text-2xl font-bold text-black">
          {restaurant?.name ?? profile.username}
        </Text>

        {!!restaurant?.address && (
          <Text className="mt-1 text-sm text-gray-500 text-center">
            {restaurant.address}
          </Text>
        )}

        {!!profile.bio && (
          <Text className="mt-4 text-base text-black text-center">
            {profile.bio}
          </Text>
        )}

        <View className="mt-5 flex-row w-full">
          <View className="flex-1">
            <Text className="text-xl font-bold text-black text-center">
              {profile.postsCount ?? 0}
            </Text>
            <Text className="mt-1 text-sm text-gray-500 text-center">
              Posts
            </Text>
          </View>

          <View className="flex-1">
            <Text className="text-xl font-bold text-black text-center">
              {restaurant?.menus?.length ?? 0}
            </Text>
            <Text className="mt-1 text-sm text-gray-500 text-center">
              Menus
            </Text>
          </View>

          <View className="flex-1">
            <Text className="text-xl font-bold text-black text-center">0</Text>
            <Text className="mt-1 text-sm text-gray-500 text-center">
              Reviews
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <TouchableOpacity
            className="rounded-lg py-2 bg-[#F5F4F5] w-44"
            onPress={() => router.push("/edit-profile")}
          >
            <Text className="text-center text-black">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-lg py-2 bg-black w-44"
            onPress={() => router.push("/business")}
          >
            <Text className="text-center font-semibold text-white">
              Manage business
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
