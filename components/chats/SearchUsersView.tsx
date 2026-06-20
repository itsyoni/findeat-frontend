import SearchBar from "@/components/SearchBar";
import { api } from "@/lib/api";
import {
  addRecentSearch,
  getRecentSearches,
  RecentSearchItem,
} from "@/lib/recentSearches";
import { UserProfile } from "@/types/profile";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";

type Props = {
  onCancel: () => void;
  mode?: "chat" | "profile";
};

export default function SearchUsersView({ onCancel, mode = "profile" }: Props) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

  useEffect(() => {
    getRecentSearches().then(setRecentSearches);
  }, []);

  async function searchUsers(text: string) {
    setQuery(text);

    if (!text.trim()) {
      setUsers([]);
      return;
    }

    const res = await api.get(`/users/search?q=${text}`);
    setUsers(res.data);
  }

  async function handleUserPress(userId: string) {
    try {
      const selectedUser = users.find((u) => u.id === userId);

      if (selectedUser) {
        const updated = await addRecentSearch({
          id: selectedUser.id,
          type: "user",
          title: `@${selectedUser.username}`,
        });

        setRecentSearches(updated);
      }

      if (mode === "chat") {
        const res = await api.post(`/chats/start/${userId}`);

        router.push({
          pathname: "/chats/[id]",
          params: { id: res.data.id },
        });

        return;
      }

      router.push({
        pathname: "/users/[id]",
        params: { id: userId },
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(120)}
        className="flex-row items-center"
      >
        <Animated.View layout={Layout.springify()} className="flex-1">
          <SearchBar
            value={query}
            onChangeText={searchUsers}
            placeholder="Search people..."
            autoFocus
          />
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(80).duration(160)}
          exiting={FadeOut.duration(100)}
          layout={Layout.springify()}
        >
          <TouchableOpacity className="pr-5" onPress={onCancel}>
            <Text className="font-semibold text-black">Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {query.trim() ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleUserPress(item.id)}
              className="border-b border-gray-100 p-4"
            >
              <Text className="font-bold">@{item.username}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={recentSearches.filter((item) => item.type === "user")}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleUserPress(item.id)}
              className="border-b border-gray-100 p-4"
            >
              <Text className="font-bold">{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </>
  );
}
