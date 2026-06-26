import Avatar from "@/components/Avatar";
import { Profile } from "@/types/profile";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  profile: Profile;
};

export default function PersonalProfileHeader({ profile }: Props) {
  return (
    <View className="bg-white px-5 pb-5">
      <View className="items-center">
        <Avatar uri={profile.avatarUrl} username={profile.username} size={96} />

        <Text className="mt-2 text-2xl font-bold text-black">
          {profile.username}
        </Text>

        {!!profile.bio && (
          <Text className="mt-4 text-base text-black">{profile.bio}</Text>
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

          <TouchableOpacity
            className="flex-1"
            onPress={() =>
              router.push({
                pathname: "/users/connections",
                params: { id: profile.id, type: "followers" },
              })
            }
          >
            <Text className="text-xl font-bold text-black text-center">
              {profile.followersCount ?? 0}
            </Text>
            <Text className="mt-1 text-sm text-gray-500 text-center">
              Followers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1"
            onPress={() =>
              router.push({
                pathname: "/users/connections",
                params: { id: profile.id, type: "following" },
              })
            }
          >
            <Text className="text-xl font-bold text-black text-center">
              {profile.followingCount ?? 0}
            </Text>
            <Text className="mt-1 text-sm text-gray-500 text-center">
              Following
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="mt-5 rounded-lg py-2 bg-[#F5F4F5] w-40"
          onPress={() => router.push("/edit-profile")}
        >
          <Text className="text-center text-black">Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
