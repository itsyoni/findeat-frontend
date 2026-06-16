import { api } from "@/lib/api";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Post = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
};

type Profile = {
  id: string;
  email: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  posts: Post[];
};

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
    <View className="flex-1 bg-white">
      <FlatList
        refreshing={refreshing}
        onRefresh={onRefresh}
        data={profile?.posts ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 80,
          paddingBottom: 40,
        }}
        ListHeaderComponent={
          <View>
            <Text className="text-3xl font-bold text-black">Profile</Text>

            <View className="mt-8 rounded-3xl border border-gray-200 bg-white p-5">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-black">
                <Text className="text-3xl font-bold text-white">
                  {profile?.username?.charAt(0).toUpperCase()}
                </Text>
              </View>

              <Text className="mt-5 text-2xl font-bold text-black">
                @{profile?.username}
              </Text>

              <Text className="mt-1 text-base text-gray-500">
                {profile?.email}
              </Text>

              {!!profile?.bio && (
                <Text className="mt-4 text-base text-black">{profile.bio}</Text>
              )}

              <View className="mt-6 h-px bg-gray-100" />

              <View className="mt-5 flex-row">
                <View className="mr-8">
                  <Text className="text-xl font-bold text-black">
                    {profile?.postsCount ?? 0}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">Posts</Text>
                </View>

                <View className="mr-8">
                  <Text className="text-xl font-bold text-black">
                    {profile?.followersCount ?? 0}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">Followers</Text>
                </View>

                <View>
                  <Text className="text-xl font-bold text-black">
                    {profile?.followingCount ?? 0}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">Following</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              className="mt-5 rounded-2xl border border-gray-200 py-4"
              onPress={() => router.push("/edit-profile")}
            >
              <Text className="text-center font-bold text-black">
                Edit Profile
              </Text>
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
          <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="text-lg font-bold text-black">{item.title}</Text>

            {!!item.description && (
              <Text className="mt-2 text-gray-600">{item.description}</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text className="text-gray-500">No posts yet</Text> : null
        }
      />
    </View>
  );
}
