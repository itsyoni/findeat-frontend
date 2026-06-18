import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Chat } from "@/types/chat";
import { UserProfile } from "@/types/profile";
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
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatsScreen() {
  const { user } = useAuth();
  const { refresh } = useLocalSearchParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadChats();
  }, [refresh]);

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

  async function startChat() {
    if (!user) return;

    try {
      const res = await api.post(`/chats/start/${user.id}`);

      router.push({
        pathname: "/chats/[id]",
        params: { id: res.data.id },
      });
    } catch (error) {
      console.error(error);
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
      console.error(error);
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
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <TextInput
        className="rounded-lg m-5 px-4 py-2 text-base bg-[#F5F4F5] border-0"
        placeholder="Search people..."
        placeholderTextColor="#9CA3AF"
        value={query}
        onChangeText={searchUsers}
      />
      <MagnifyingGlassIcon
        className="h-5 w-5 text-gray-500"
        fill="currentColor"
      />
      {users.length > 0 && (
        <View className="mb-6 rounded-2xl border border-gray-200">
          {users.map((user: UserProfile) => (
            <TouchableOpacity
              key={user.id}
              onPress={startChat}
              className="border-b border-gray-100 p-4"
            >
              <Text className="font-bold">@{user.username}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
              className="m-5 gap-2 rounded-lg flex flex-row items-center"
              onPress={() =>
                router.push({
                  pathname: "/chats/[id]",
                  params: { id: item.id, title: item.id },
                })
              }
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-black">
                <Text className="text-lg font-bold text-white">
                  {otherUser?.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-black">
                  @{otherUser?.username}
                </Text>

                <Text className="text-gray-500">
                  {lastMessage?.content || "No messages yet"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
