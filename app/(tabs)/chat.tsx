import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Chat = {
  id: string;
  participants: {
    userId: string;
    user: {
      id: string;
      username: string;
    };
  }[];
  messages: {
    content: string | null;
    createdAt: string;
  }[];
};

export default function ChatsScreen() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  }

  async function loadChats() {
    try {
      const res = await api.get("/chats");
      setChats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      <Text className="mb-6 text-3xl font-bold text-black">Chats</Text>

      <FlatList
        refreshing={refreshing}
        onRefresh={onRefresh}
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const otherUser = item.participants.find(
            (p) => p.userId !== user?.id,
          )?.user;

          const lastMessage = item.messages[0];

          return (
            <TouchableOpacity
              className="mb-4 rounded-2xl border border-gray-200 p-4"
              onPress={() =>
                router.push({
                  pathname: "/chats/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Text className="text-lg font-bold text-black">
                @{otherUser?.username}
              </Text>

              <Text className="mt-1 text-gray-500">
                {lastMessage?.content || "No messages yet"}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
