import Avatar from "@/components/common/Avatar";
import FullScreenImageViewer from "@/components/common/FullScreenImageViewer";
import { Profile } from "@findeat/types/profile";
import { router } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";
import Text from "../common/AppText";
import ProfileManagedRestaurants from "./ProfileManagedRestaurants";
import ProfileDetails from "./ProfileDetails";
import { useTranslation } from "react-i18next";
import { GearSixIcon } from "phosphor-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Skeleton, SkeletonPulse } from "../common";

type Props = {
  profile?: Profile | null;
  loading?: boolean;
};

export default function PersonalProfileHeader({ profile, loading = false }: Props) {
  const { t } = useTranslation(["common", "profile"]);
  const [avatarOpen, setAvatarOpen] = useState(false);

  if (loading || !profile) {
    return (
      <SkeletonPulse>
        <View className="bg-white dark:bg-black">
          <View className="relative">
            <Skeleton height={240} radius={0} />
            <SafeAreaView edges={["top"]} style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
              <View className="items-end px-4 pt-2"><Skeleton width={44} height={44} circle /></View>
            </SafeAreaView>
          </View>
          <View className="-mt-7 items-center rounded-t-[30px] bg-white pb-5 dark:bg-black">
            <Skeleton width={112} height={112} circle style={{ marginTop: -48 }} />
            <Skeleton width="46%" height={22} radius={8} style={{ marginTop: 12 }} />
            <Skeleton width="27%" height={13} radius={6} style={{ marginTop: 8 }} />
            <View className="mt-5 w-full flex-row">
              {[0, 1, 2].map((item) => <View key={item} className="flex-1 items-center gap-2"><Skeleton width={38} height={19} radius={7} /><Skeleton width={58} height={11} radius={6} /></View>)}
            </View>
            <Skeleton width={160} height={38} radius={9} style={{ marginTop: 20 }} />
          </View>
        </View>
      </SkeletonPulse>
    );
  }
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
        <TouchableOpacity
          activeOpacity={profile.avatarUrl ? 0.8 : 1}
          disabled={!profile.avatarUrl}
          accessibilityRole={profile.avatarUrl ? "imagebutton" : undefined}
          accessibilityLabel={profile.avatarUrl ? "Open profile picture" : undefined}
          onPress={() => setAvatarOpen(true)}
          className="-mt-12 rounded-full bg-white p-1.5 dark:bg-black"
        >
          <Avatar uri={profile.avatarUrl} username={profile.username} size={100} />
        </TouchableOpacity>

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

        <ProfileDetails profile={profile} />

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
      <FullScreenImageViewer
        uri={profile.avatarUrl}
        visible={avatarOpen}
        onClose={() => setAvatarOpen(false)}
      />
    </View>
  );
}
