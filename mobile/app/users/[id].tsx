import { api } from "@/lib/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
};

type UserProfile = {
  id: string;
  username: string;
  email: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  posts: Post[];
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const res = await api.get(`/users/${id}`);
      setUser(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFollow() {
    if (!user) return;

    try {
      if (user.isFollowing) {
        await api.delete(`/users/${user.id}/follow`);
      } else {
        await api.post(`/users/${user.id}/follow`);
      }

      await loadUser();
    } catch (error) {
      console.log(error);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <FlatList
      data={user.posts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 40,
      }}
      ListHeaderComponent={
        <View>
          <View className="h-20 w-20 items-center justify-center rounded-full bg-black">
            <Text className="text-3xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text className="mt-5 text-3xl font-bold text-black">
            @{user.username}
          </Text>

          <Text className="mt-2 text-gray-500">{user.email}</Text>

          <View className="mt-6 flex-row">
            <View className="mr-8">
              <Text className="text-xl font-bold">{user.posts.length}</Text>
              <Text className="text-gray-500">Posts</Text>
            </View>

            <View className="mr-8">
              <Text className="text-xl font-bold">{user.followersCount}</Text>
              <Text className="text-gray-500">Followers</Text>
            </View>

            <View>
              <Text className="text-xl font-bold">{user.followingCount}</Text>
              <Text className="text-gray-500">Following</Text>
            </View>
          </View>

          <TouchableOpacity
            className="mt-6 rounded-2xl bg-black py-4"
            onPress={toggleFollow}
          >
            <Text className="text-center font-bold text-white">
              {user.isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>

          <Text className="mt-8 mb-4 text-xl font-bold">Posts</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View className="mb-4 rounded-2xl border border-gray-200 p-4">
          <Text className="text-lg font-bold">{item.title}</Text>

          {!!item.description && (
            <Text className="mt-2 text-gray-600">{item.description}</Text>
          )}
        </View>
      )}
    />
  );
}
