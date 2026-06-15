import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

type Post = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
};

export default function HomeScreen() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
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
      <View className="px-6 pt-16 pb-4">
        <Text className="text-3xl font-bold">FindEat</Text>

        <Text className="mt-1 text-gray-500">
          Logged in as @{user?.username}
        </Text>
      </View>

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
          </View>
        )}
      />
    </View>
  );
}
