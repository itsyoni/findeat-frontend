import Text from "@/components/common/AppText";
import Tabs from "@/components/common/Tabs";
import PersonalProfileHeader from "@/components/profile/PersonalProfileHeader";
import ProfilePostGrid from "@/components/profile/ProfilePostGrid";
import { api } from "@/lib/api";
import { PostType } from "@/types/post";
import { Profile } from "@/types/profile";
import { ManagedRestaurant } from "@/types/restaurant";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");
  const [loading, setLoading] = useState(true);
  const [managedRestaurants, setManagedRestaurants] = useState<
    ManagedRestaurant[]
  >([]);

  const posts = useMemo(() => {
    return profile?.posts?.filter((post) => post.type === activeFeed) ?? [];
  }, [profile, activeFeed]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadManagedRestaurants();
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

  async function loadManagedRestaurants() {
    try {
      const res = await api.get("/restaurants/me");
      setManagedRestaurants(res.data);
    } catch (error) {
      console.error(error);
    }
  }

  if (loading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  const isAdmin = profile.email === "yoni@gmail.com";

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <PersonalProfileHeader profile={profile} />

      {isAdmin && (
        <View className="px-5 pb-4">
          <TouchableOpacity
            className="rounded-2xl bg-black py-4"
            onPress={() => router.push("/admin/claims")}
          >
            <Text className="text-center font-bold text-white">
              Restaurant Claims
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {managedRestaurants.length > 0 && (
        <View className="px-5 pb-4">
          <TouchableOpacity
            className="rounded-2xl bg-black py-4"
            onPress={() => router.push("/business/menu")}
          >
            <Text className="text-center font-bold text-white">
              Manage restaurant
            </Text>
          </TouchableOpacity>
        </View>
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
