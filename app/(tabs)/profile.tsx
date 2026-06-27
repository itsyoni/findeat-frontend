import BusinessProfileHeader from "@/components/profile/BusinessProfileHeader";
import PersonalProfileHeader from "@/components/profile/PersonalProfileHeader";
import ProfilePostGrid from "@/components/profile/ProfilePostGrid";
import Tabs from "@/components/Tabs";
import { api } from "@/lib/api";
import { PostType } from "@/types/post";
import { Profile } from "@/types/profile";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");
  const [loading, setLoading] = useState(true);

  const posts = useMemo(() => {
    return profile?.posts?.filter((post) => post.type === activeFeed) ?? [];
  }, [profile, activeFeed]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  async function loadProfile() {
    try {
      const res = await api.get("/users/me");
      setProfile(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  const isBusiness = profile.accountType === "BUSINESS";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {isBusiness ? (
        <BusinessProfileHeader profile={profile} />
      ) : (
        <PersonalProfileHeader profile={profile} />
      )}

      <Tabs
        activeTab={activeFeed}
        onChange={setActiveFeed}
        tabs={[
          { label: "Content", value: "CONTENT" },
          { label: "Reviews", value: "REVIEW" },
        ]}
      />

      <View style={{ flex: 1 }}>
        <ProfilePostGrid
          posts={posts}
          onPressPost={(postId) => {
            router.push({
              pathname:
                activeFeed === "CONTENT"
                  ? "/profile/content-feed"
                  : "/profile/reviews-feed",
              params: { postId },
            });
          }}
        />
      </View>
    </SafeAreaView>
  );
}
