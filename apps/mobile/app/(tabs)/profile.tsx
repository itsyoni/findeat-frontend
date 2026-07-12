import { AppButton } from "@/components/common";
import Tabs from "@/components/common/Tabs";
import PersonalProfileHeader from "@/components/profile/PersonalProfileHeader";
import ProfilePostGrid from "@/components/profile/ProfilePostGrid";
import { useMyProfile } from "@/hooks/useMyProfile";
import { PostType } from "@findeat/types/post";
import { filterPostsByType } from "@findeat/utils/posts";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

export default function ProfileScreen() {
  const { t } = useTranslation(["common", "profile"]);
  const { profile, loading, refresh } = useMyProfile();
  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");

  const posts = useMemo(
    () => filterPostsByType(profile?.posts, activeFeed),
    [profile?.posts, activeFeed],
  );

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (loading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator />
      </View>
    );
  }

  const isAdmin = profile.email === "admin@gmail.com";

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <PersonalProfileHeader profile={profile} />

      {isAdmin && (
        <View className="px-5 pb-4">
          <AppButton
            title={t("profile:restaurantClaims")}
            onPress={() => router.push("/admin/claims")}
          />
        </View>
      )}

      <Tabs
        activeTab={activeFeed}
        onChange={setActiveFeed}
        tabs={[
          { label: t("common:content"), value: "CONTENT" },
          { label: t("common:reviews"), value: "REVIEW" },
        ]}
      />

      <View style={{ flex: 1 }}>
        <ProfilePostGrid
          posts={posts}
          type={activeFeed}
          onCreatePost={() =>
            router.push(activeFeed === "CONTENT" ? "/create/content" : "/create/review")
          }
          onPressPost={(postId) => {
            router.push({
              pathname:
                activeFeed === "CONTENT"
                  ? "/(profile)/content-feed"
                  : "/(profile)/reviews-feed",
              params: { postId },
            });
          }}
        />
      </View>
    </View>
  );
}
