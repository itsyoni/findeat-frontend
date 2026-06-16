import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Post = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
  likesCount: number;
  isLiked: boolean;
};

export default function HomeScreen() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refresh } = useLocalSearchParams();

  useEffect(() => {
    loadPosts();
  }, [refresh]);

  async function loadPosts() {
    try {
      const res = await api.get("/posts/feed");
      setPosts(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers(text: string) {
    setQuery(text);

    if (!text.trim()) {
      setUsers([]);
      return;
    }

    try {
      const res = await api.get(`/users/search?q=${text}`);
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function toggleLike(postId: string, isLiked: boolean) {
    if (isLiked) {
      await api.delete(`/posts/${postId}/like`);
    } else {
      await api.post(`/posts/${postId}/like`);
    }

    await loadPosts();
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-4 ">
        <Text className="text-3xl font-bold">FindEat</Text>

        <Text className="mt-1 text-gray-500">
          Logged in as @{user?.username}
        </Text>
      </View>
      <TextInput
        className="mb-6 mx-5 rounded-2xl border border-gray-200 px-4 py-4 text-base"
        placeholder="Search people..."
        placeholderTextColor="#9CA3AF"
        value={query}
        onChangeText={searchUsers}
      />
      {users.length > 0 && (
        <View className="mb-6 rounded-2xl border border-gray-200">
          {users.map((user: any) => (
            <TouchableOpacity
              key={user.id}
              onPress={() =>
                router.push({
                  pathname: "/users/[id]",
                  params: { id: user.id },
                })
              }
              className="border-b border-gray-100 p-4"
            >
              <Text className="font-bold">@{user.username}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32,
        }}
        renderItem={({ item }) => (
          <View className="mb-4 rounded-2xl border border-gray-200 p-4">
            <Text className="text-lg font-bold">{item.title}</Text>

            {!!item.description && (
              <Text className="mt-2 text-gray-600">{item.description}</Text>
            )}

            <Text className="mt-3 text-sm text-gray-400">
              @{item.user.username}
            </Text>

            <TouchableOpacity
              className="mt-3"
              onPress={() => toggleLike(item.id, item.isLiked)}
            >
              <Text>
                {item.isLiked ? "❤️" : "🤍"} {item.likesCount}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
