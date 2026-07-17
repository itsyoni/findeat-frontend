import Tabs from "@/components/common/Tabs";
import PersonalProfileHeader from "@/components/profile/PersonalProfileHeader";
import ProfilePostGrid from "@/components/profile/ProfilePostGrid";
import { useMyProfile } from "@/hooks/useMyProfile";
import { PostType } from "@findeat/types/post";
import { filterPostsByType } from "@findeat/utils/posts";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated } from "react-native";

export default function ProfileScreen() {
  const { t } = useTranslation(["common", "profile"]);
  const { profile, loading, refresh } = useMyProfile();
  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");
  const [scrollY] = useState(() => new Animated.Value(0));

  const posts = useMemo(
    () => filterPostsByType(profile?.posts, activeFeed),
    [profile?.posts, activeFeed],
  );

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <Animated.ScrollView
      className="flex-1 bg-canvas dark:bg-black"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 110 }}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
      )}
    >
      <PersonalProfileHeader profile={profile} loading={loading} scrollY={scrollY} />

      <Tabs
        activeTab={activeFeed}
        onChange={setActiveFeed}
        tabs={[
          { label: t("common:content"), value: "CONTENT" },
          { label: t("common:reviews"), value: "REVIEW" },
        ]}
      />

      <ProfilePostGrid
        posts={posts}
        loading={loading}
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
    </Animated.ScrollView>
  );
}
