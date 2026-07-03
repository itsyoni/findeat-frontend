import ChatList from "@/components/chats/ChatList";
import SearchBar from "@/components/common/SearchBar";
import SearchResultRow from "@/components/search/SearchResultRow";
import SearchResultsView from "@/components/search/SearchResultsView";
import { api } from "@/lib/api";
import { searchGlobal } from "@/lib/search";
import { Chat } from "@findeat/types/chat";
import { SearchResultItem } from "@findeat/types/search";
import { router, useFocusEffect } from "expo-router";
import { PlusIcon } from "phosphor-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatsScreen() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, []),
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

  function handleSearchSelect(item: SearchResultItem) {
    setIsSearching(false);

    if (item.type === "USER") {
      router.push({
        pathname: "/chats/[id]",
        params: {
          id: "new-direct",
          type: "DIRECT",
          targetUserId: item.id,
          title: item.title,
          imageUrl: item.imageUrl ?? "",
        },
      });

      return;
    }

    router.push({
      pathname: "/chats/[id]",
      params: {
        id: "new-restaurant",
        type: "RESTAURANT",
        restaurantId: item.id,
        title: item.title,
        imageUrl: item.imageUrl ?? "",
      },
    });
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
          <SearchResultsView
            searchRequest={searchGlobal}
            onCancel={() => setIsSearching(false)}
            onSelect={handleSearchSelect}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={(item) => <SearchResultRow item={item} />}
          />
        </Animated.View>
      ) : (
        <Animated.View
          key="normal"
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          className="flex-1"
        >
          <SearchBar
            editable={false}
            placeholder="Search"
            onPress={() => setIsSearching(true)}
            rightAccessory={
              <TouchableOpacity
                className="aspect-square items-center justify-center rounded-2xl bg-black h-full"
                onPress={() => router.push("/chats/create-group")}
              >
                <PlusIcon size={22} color="white" weight="bold" />
              </TouchableOpacity>
            }
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
