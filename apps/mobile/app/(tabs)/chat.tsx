import { ThemedInput } from "@/components/ThemedInput";
import { api } from "@/lib/api";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  FlatList,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MagnifyingGlass from "@/assets/icons/MagnifyingGlass.svg";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

type SearchedUser = {
  id: string;
  username: string;
  displayName: string;
  profilePictureUrl?: string | null;
};

type Conversation = {
  id: string;
  isGroup: boolean;
  name?: string | null;
  imageUrl?: string | null;
  updatedAt: string;
  participants: {
    id: string;
    userId: string;
    user: {
      id: string;
      username: string;
      displayName: string;
      profilePictureUrl?: string | null;
    };
  }[];
  lastMessage?: {
    id: string;
    content: string | null;
    createdAt: string;
    senderId: string;
  } | null;
};

type ConversationsApiResponse = {
  id: string;
  isGroup: boolean;
  name?: string | null;
  imageUrl?: string | null;
  updatedAt: string;
  participants: {
    id: string;
    userId: string;
    user: {
      id: string;
      username: string;
      displayName: string;
      profilePictureUrl?: string | null;
    };
  }[];
  messages: {
    id: string;
    content: string | null;
    createdAt: string;
    senderId: string;
  }[];
};

export default function Chat() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);

        const response = await api.get<ConversationsApiResponse[]>(
          "/chat/conversations",
        );

        const mappedConversations: Conversation[] = response.data.map(
          (conversation) => ({
            id: conversation.id,
            isGroup: conversation.isGroup,
            name: conversation.name,
            imageUrl: conversation.imageUrl,
            updatedAt: conversation.updatedAt,
            participants: conversation.participants,
            lastMessage: conversation.messages?.[0] ?? null,
          }),
        );

        setConversations(mappedConversations);
      } catch (error) {
        console.log("Fetch conversations failed:", error);
        setConversations([]);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const trimmed = search.trim();

      if (!trimmed) {
        setResults([]);
        return;
      }

      try {
        setLoadingSearch(true);

        const response = await api.get("/users/search", {
          params: { q: trimmed },
        });

        setResults(response.data);
      } catch (error) {
        console.log("User search failed:", error);
        setResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleUserPress = async (userId: string) => {
    try {
      const response = await api.post("/chat/conversations", {
        participantIds: [userId],
        isGroup: false,
      });

      router.push({
        pathname: "/chat/[id]",
        params: { id: response.data.id },
      });
    } catch (error) {
      console.log("Create/open conversation failed:", error);
    }
  };

  const handleConversationPress = (conversationId: string) => {
    router.push({
      pathname: "/chat/[id]",
      params: { id: conversationId },
    });
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.name || "Group chat";
    }

    const otherParticipant = conversation.participants.find(
      (participant) => participant.user.id !== user?.id,
    );

    return otherParticipant?.user.displayName || "Unknown user";
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    if (!conversation.lastMessage?.content) {
      return "No messages yet";
    }

    return conversation.lastMessage.content;
  };

  const isSearching = search.trim().length > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View className="flex-1 px-5 pt-2">
          <ThemedInput
            icon={MagnifyingGlass}
            iconSize={20}
            iconColor="none"
            value={search}
            onChangeText={setSearch}
            placeholder="Search users"
            placeholderTextColor="#888"
            autoCapitalize="none"
            autoCorrect={false}
            className="bg-[#f5f5f5] text-base text-[#212121]"
          />

          <View className="mt-4 flex-1">
            {isSearching ? (
              loadingSearch ? (
                <Text className="text-[#888]">Searching...</Text>
              ) : (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => handleUserPress(item.id)}
                      className="border-b border-[#eee] py-4"
                    >
                      <Text className="text-base font-cabinet-medium text-[#212121]">
                        {item.displayName}
                      </Text>
                      <Text className="text-sm text-[#888]">
                        @{item.username}
                      </Text>
                    </Pressable>
                  )}
                  ListEmptyComponent={
                    <Text className="text-[#888]">No users found</Text>
                  }
                />
              )
            ) : loadingConversations ? (
              <Text className="text-[#888]">Loading conversations...</Text>
            ) : (
              <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleConversationPress(item.id)}
                    className="border-b border-[#eee] py-4"
                  >
                    <Text className="text-base font-cabinet-medium text-[#212121]">
                      {getConversationTitle(item)}
                    </Text>
                    <Text numberOfLines={1} className="text-sm text-[#888]">
                      {getConversationSubtitle(item)}
                    </Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text className="text-[#888]">No conversations yet</Text>
                }
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
