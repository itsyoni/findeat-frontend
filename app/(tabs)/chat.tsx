import FakeSearchBar from "@/components/FakeSearchBar";
import ChatList from "@/components/chats/ChatList";
import SearchUsersView from "@/components/chats/SearchUsersView";
import { api } from "@/lib/api";
import { Chat } from "@/types/chat";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatsScreen() {
  const { refresh } = useLocalSearchParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [refresh]),
  );

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

  async function onRefresh() {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {isSearching ? (
        <Animated.View
          key="search"
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          className="flex-1"
        >
          <SearchUsersView mode="chat" onCancel={() => setIsSearching(false)} />
        </Animated.View>
      ) : (
        <Animated.View
          key="normal"
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          className="flex-1"
        >
          <FakeSearchBar
            placeholder="Search people..."
            onPress={() => setIsSearching(true)}
          />

          <ChatList
            chats={chats}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
