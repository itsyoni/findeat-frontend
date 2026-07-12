import ChatList from "@/components/chats/ChatList";
import { LoadingScreen } from "@/components/common";
import SearchBar from "@/components/common/inputs/SearchBar";
import SearchResultRow from "@/components/search/SearchResultRow";
import SearchResultsView from "@/components/search/SearchResultsView";
import { api } from "@/lib/api";
import { searchChatTargets } from "@/services/search";
import { Chat } from "@findeat/types/chat";
import { SearchResultItem } from "@findeat/types/search";
import { router, useFocusEffect } from "expo-router";
import { PlusIcon } from "phosphor-react-native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/contexts/ThemeContext";

export default function ChatsScreen() {
  const { t } = useTranslation("common");
  const { isDark } = useAppTheme();

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const nextChats = await api.chats.list();
      setChats(nextChats);
    } catch (error) {
      console.error("Failed to load chats", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadChats();
    }, [loadChats]),
  );

  async function onRefresh() {
    try {
      setRefreshing(true);
      await loadChats();
    } finally {
      setRefreshing(false);
    }
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
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FFF" }}
    >
      {isSearching ? (
        <Animated.View
          key="search"
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          className="flex-1"
        >
          <SearchResultsView
            searchRequest={searchChatTargets}
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
            placeholder={t("search")}
            onPress={() => setIsSearching(true)}
            rightAccessory={
              <TouchableOpacity
                className="h-full aspect-square items-center justify-center rounded-2xl bg-black"
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
