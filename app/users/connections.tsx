import Text from "@/components/common/AppText";
import { api } from "@/lib/api";
import { ConnectionItem } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

export default function ConnectionsScreen() {
  const { id, type } = useLocalSearchParams<{
    id: string;
    type: "followers" | "following";
  }>();

  const [items, setItems] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConnections();
  }, [id, type]);

  async function onRefresh() {
    setRefreshing(true);
    await loadConnections();
    setRefreshing(false);
  }

  async function loadConnections() {
    try {
      const res = await api.get(`/users/${id}/${type}`);

      setItems(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const title = type === "following" ? "Following" : "Followers";

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      <Text className="mb-6 text-3xl font-bold text-black">{title}</Text>

      <FlatList
        refreshing={refreshing}
        onRefresh={onRefresh}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const user = type === "following" ? item.following : item.follower;

          if (!user) return null;

          return (
            <TouchableOpacity
              className="mb-4 rounded-2xl border border-gray-200 p-4"
              onPress={() =>
                router.push({
                  pathname: "/users/[id]",
                  params: { id: user.id },
                })
              }
            >
              <Text className="text-lg font-bold text-black">
                @{user.username}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text className="text-gray-500">No users yet</Text>}
      />
    </View>
  );
}
