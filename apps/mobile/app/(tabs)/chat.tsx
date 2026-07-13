import ChatList from "@/components/chats/ChatList";
import { LoadingScreen } from "@/components/common";
import Text from "@/components/common/AppText";
import SearchResultRow from "@/components/search/SearchResultRow";
import SearchResultsView from "@/components/search/SearchResultsView";
import { api } from "@/lib/api";
import { searchChatTargets } from "@/services/search";
import { Chat } from "@findeat/types/chat";
import { SearchResultItem } from "@findeat/types/search";
import { router, useFocusEffect } from "expo-router";
import { MagnifyingGlassIcon, PlusIcon } from "phosphor-react-native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/contexts/ThemeContext";

export default function ChatsScreen() {
  const { t } = useTranslation(["common", "chat"]);
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
      style={{ flex: 1, backgroundColor: isDark ? "#080808" : "#F7F7F8" }}
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
          <View className="px-5 pb-5 pt-2">
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-3xl font-bold text-black dark:text-white">
                {t("chat:messages")}
              </Text>
              <TouchableOpacity
                className="h-11 w-11 items-center justify-center rounded-full bg-[#F7D786]"
                onPress={() => router.push("/chats/create-group")}
              >
                <PlusIcon size={23} color="#111" weight="bold" />
              </TouchableOpacity>
            </View>

            <Pressable
              onPress={() => setIsSearching(true)}
              className="h-12 flex-row items-center rounded-2xl bg-gray-100 px-4 dark:bg-[#18181A]"
            >
              <MagnifyingGlassIcon size={20} color="#9CA3AF" />
              <Text className="ml-3 text-base text-gray-500">
                {t("common:search")}
              </Text>
            </Pressable>
          </View>

          <View className="flex-1 overflow-hidden rounded-t-[30px] bg-white pt-2 dark:bg-[#0F0F10]">
            <ChatList
              chats={chats}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
