import Avatar from "@/components/common/Avatar";
import { Profile } from "@findeat/types/profile";
import { router } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";
import Text from "../common/AppText";
import ProfileManagedRestaurants from "./ProfileManagedRestaurants";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/contexts/ThemeContext";

type Props = {
  profile: Profile;
};

export default function PersonalProfileHeader({ profile }: Props) {
  const { t } = useTranslation(["common", "profile"]);
  const { isDark } = useAppTheme();
  return (
    <View className="bg-white pb-5 dark:bg-black">
      <View className="items-center">
        <Image
          source={{ uri: profile.coverUrl ?? "fallback" }}
          className="h-70 w-full bg-gray-200 rounded-b-4xl"
          resizeMode="cover"
        />
        <View className="-mt-15 px-5">
          <Avatar
            uri={profile.avatarUrl}
            username={profile.username}
            size={100}
            style={{
              outlineStyle: "solid",
              outlineWidth: 7,
              outlineColor: isDark ? "#000" : "#FFF",
            }}
          />
        </View>

        <Text className="mt-2 text-2xl font-bold text-black dark:text-white">
          {profile.username}
        </Text>

        <View className="w-full">
          <ProfileManagedRestaurants
            memberships={profile.restaurantMemberships}
          />
        </View>

        {!!profile.bio && (
          <Text className="mt-4 text-base text-black dark:text-white">
            {profile.bio}
          </Text>
        )}

        <View className="mt-5 flex-row w-full">
          <View className="flex-1">
            <Text className="text-center text-xl font-bold text-black dark:text-white">
              {profile.postsCount ?? 0}
            </Text>
            <Text className="mt-1 text-sm text-gray-500 text-center">
              {t("profile:posts")}
            </Text>
          </View>

          <TouchableOpacity
            className="flex-1"
            onPress={() =>
              router.push({
                pathname: "/(users)/connections",
                params: { id: profile.id, type: "followers" },
              })
            }
          >
            <Text className="text-center text-xl font-bold text-black dark:text-white">
              {profile.followersCount ?? 0}
            </Text>
            <Text className="mt-1 text-sm text-gray-500 text-center">
              {t("profile:followers")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1"
            onPress={() =>
              router.push({
                pathname: "/(users)/connections",
                params: { id: profile.id, type: "following" },
              })
            }
          >
            <Text className="text-center text-xl font-bold text-black dark:text-white">
              {profile.followingCount ?? 0}
            </Text>
            <Text className="mt-1 text-sm text-gray-500 text-center">
              {t("profile:following")}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="mt-5 w-40 rounded-lg bg-[#F5F4F5] py-2 dark:bg-gray-800"
          onPress={() => router.push("/(profile)/edit-profile")}
        >
          <Text className="text-center text-black dark:text-white">
            {t("profile:editProfile")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
