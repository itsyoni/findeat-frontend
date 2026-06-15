import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
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
  createdAt: string;
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyPosts();
  }, []);

  async function loadMyPosts() {
    try {
      const res = await api.get("/posts/me");
      setPosts(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={posts}
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
                  {user?.username?.charAt(0).toUpperCase()}
                </Text>
              </View>

              <Text className="mt-5 text-2xl font-bold text-black">
                @{user?.username}
              </Text>

              <Text className="mt-1 text-base text-gray-500">
                {user?.email}
              </Text>

              <View className="mt-6 h-px bg-gray-100" />

              <View className="mt-5 flex-row">
                <View className="mr-8">
                  <Text className="text-xl font-bold text-black">
                    {posts.length}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">Posts</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              className="mt-5 rounded-2xl bg-black py-4"
              onPress={logout}
            >
              <Text className="text-center font-bold text-white">Logout</Text>
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
