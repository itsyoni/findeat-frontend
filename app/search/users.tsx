import Text from "@/components/AppText";
import SearchBar from "@/components/SearchBar";
import { api } from "@/lib/api";
import { User } from "@/types";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserSearchScreen() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  async function searchUsers(text: string) {
    setQuery(text);

    if (!text.trim()) {
      setUsers([]);
      return;
    }

    const res = await api.get(`/users/search?q=${text}`);
    setUsers(res.data);
  }

  async function startChat(userId: string) {
    const res = await api.post(`/chats/start/${userId}`);

    router.replace({
      pathname: "/chats/[id]",
      params: { id: res.data.id },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <SearchBar value={query} onChangeText={searchUsers} autoFocus />

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => startChat(item.id)}
            className="border-b border-gray-100 p-4"
          >
            <Text className="font-bold">@{item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
