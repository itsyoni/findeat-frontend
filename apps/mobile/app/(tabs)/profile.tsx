import { AppButton } from "@/components/common";
import Tabs from "@/components/common/Tabs";
import PersonalProfileHeader from "@/components/profile/PersonalProfileHeader";
import ProfilePostGrid from "@/components/profile/ProfilePostGrid";
import { useMyProfile } from "@/hooks/useMyProfile";
import { api } from "@/lib/api";
import { PostType } from "@findeat/types/post";
import { ManagedRestaurant } from "@findeat/types/restaurant";
import { filterPostsByType } from "@findeat/utils/posts";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

export default function ProfileScreen() {
  const { t } = useTranslation(["common", "profile"]);
  const { profile, loading, refresh } = useMyProfile();
  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");
  const [managedRestaurants, setManagedRestaurants] = useState<
    ManagedRestaurant[]
  >([]);

  const posts = useMemo(
    () => filterPostsByType(profile?.posts, activeFeed),
    [profile?.posts, activeFeed],
  );

  const loadManagedRestaurants = useCallback(async () => {
    try {
      const managedRestaurants = await api.restaurants.mine();
      setManagedRestaurants(managedRestaurants);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void loadManagedRestaurants();
    }, [refresh, loadManagedRestaurants]),
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

      {managedRestaurants.length > 0 && (
        <View className="px-5 pb-4">
          <AppButton
            title={t("profile:manageRestaurants")}
            onPress={() => router.push("/business/menu")}
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
