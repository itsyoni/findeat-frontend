import { api } from "@/lib/api";
import { Profile } from "@/types/profile";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View className="flex-1 bg-white">
        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          data={profile?.posts ?? []}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View className="flex items-center">
              <View className="flex items-center w-full">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-black">
                  <Text className="text-3xl font-bold text-white">
                    {profile?.username?.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <Text className="mt-2 text-2xl font-bold text-black">
                  @{profile?.username}
                </Text>

                {!!profile?.bio && (
                  <Text className="mt-4 text-base text-black">
                    {profile.bio}
                  </Text>
                )}

                <View className="mt-5 px-7 flex flex-row w-full">
                  <View className="flex flex-1">
                    <Text className="text-xl font-bold text-black text-center">
                      {profile?.postsCount ?? 0}
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500 text-center">
                      Posts
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="flex flex-1"
                    onPress={() =>
                      router.push({
                        pathname: "/users/connections",
                        params: { id: profile?.id, type: "followers" },
                      })
                    }
                  >
                    <Text className="text-xl font-bold text-black text-center">
                      {profile?.followersCount ?? 0}
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500 text-center">
                      Followers
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex flex-1"
                    onPress={() =>
                      router.push({
                        pathname: "/users/connections",
                        params: { id: profile?.id, type: "following" },
                      })
                    }
                  >
                    <Text className="text-xl font-bold text-black text-center">
                      {profile?.followingCount ?? 0}
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500 text-center">
                      Following
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                className="mt-5 rounded-lg py-2 bg-[#F5F4F5] w-40"
                onPress={() => router.push("/edit-profile")}
              >
                <Text className="text-center text-black">Edit Profile</Text>
              </TouchableOpacity>

              <Text className="mt-8 mb-4 text-xl font-bold text-black">
                My Posts
              </Text>

              {loading && (
                <View className="py-6">
                  <ActivityIndicator />
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View className="mb-4 bg-white p-4">
              <Text className="text-lg font-bold text-black">{item.title}</Text>

              {!!item.description && (
                <Text className="mt-2 text-gray-600">{item.description}</Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <Text className="text-gray-500 text-center">No posts yet</Text>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
