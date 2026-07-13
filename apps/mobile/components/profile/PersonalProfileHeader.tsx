import Avatar from "@/components/common/Avatar";
import { Profile } from "@findeat/types/profile";
import { router } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";
import Text from "../common/AppText";
import ProfileManagedRestaurants from "./ProfileManagedRestaurants";
import { useTranslation } from "react-i18next";
import { GearSixIcon } from "phosphor-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  profile: Profile;
};

export default function PersonalProfileHeader({ profile }: Props) {
  const { t } = useTranslation(["common", "profile"]);
  return (
    <View className="bg-white dark:bg-black">
      <View className="relative">
        {profile.coverUrl ? (
          <Image
            source={{ uri: profile.coverUrl }}
            className="h-60 w-full bg-gray-200"
            resizeMode="cover"
          />
        ) : (
          <View className="h-60 w-full bg-gray-200 dark:bg-gray-800" />
        )}
        <SafeAreaView
          edges={["top"]}
          pointerEvents="box-none"
          style={{ position: "absolute", left: 0, right: 0, top: 0 }}
        >
          <View className="items-end px-4 pt-2">
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              className="h-11 w-11 items-center justify-center rounded-full bg-black/45"
            >
              <GearSixIcon size={24} color="white" weight="bold" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View className="-mt-7 items-center rounded-t-[30px] bg-white pb-5 dark:bg-black">
        <View className="-mt-12 rounded-full bg-white p-1.5 dark:bg-black">
          <Avatar uri={profile.avatarUrl} username={profile.username} size={100} />
        </View>

        <Text className="mt-2 text-2xl font-bold text-black dark:text-white">
          {profile.displayName || profile.username}
        </Text>
        <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          @{profile.username}
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

        <View className="mt-5 w-full flex-row">
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
