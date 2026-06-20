import Avatar from "@/components/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { api, API_URL } from "@/lib/api";
import { Chat, Message } from "@/types/chat";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

export default function ChatScreen() {
  const { user } = useAuth();

  const { id } = useLocalSearchParams<{ id: string }>();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  const otherUser = chat?.participants.find((p) => p.userId !== user?.id)?.user;

  const loadChat = useCallback(async () => {
    try {
      const res = await api.get(`/chats/${id}`);
      setChat(res.data);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  const loadMessages = useCallback(async () => {
    try {
      const res = await api.get(`/chats/${id}/messages`);
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([loadChat(), loadMessages()]);
      setLoading(false);
    }

    init();
  }, [loadChat, loadMessages]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = io(API_URL, {
      auth: {
        userId: user.id,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_conversation", {
        conversationId: id,
      });
    });

    socket.on("receive_message", (message: Message) => {
      setMessages((current) => {
        const exists = current.some((item) => item.id === message.id);
        if (exists) return current;
        return [...current, message];
      });
    });

    socket.on("user_online", ({ userId }: { userId: string }) => {
      setChat((current) => {
        if (!current) return current;

        return {
          ...current,
          participants: current.participants.map((p) =>
            p.userId === userId
              ? {
                  ...p,
                  user: {
                    ...p.user,
                    isOnline: true,
                    lastSeenAt: null,
                  },
                }
              : p,
          ),
        };
      });
    });

    socket.on(
      "user_offline",
      ({ userId, lastSeenAt }: { userId: string; lastSeenAt: string }) => {
        setChat((current) => {
          if (!current) return current;

          return {
            ...current,
            participants: current.participants.map((p) =>
              p.userId === userId
                ? {
                    ...p,
                    user: {
                      ...p.user,
                      isOnline: false,
                      lastSeenAt,
                    },
                  }
                : p,
            ),
          };
        });
      },
    );

    return () => {
      socket.off("receive_message");
      socket.off("user_online");
      socket.off("user_offline");
      socket.disconnect();
    };
  }, [id, user?.id]);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([loadChat(), loadMessages()]);
    setRefreshing(false);
  }

  async function sendMessage() {
    if (!content.trim()) return;

    socketRef.current?.emit("send_message", {
      conversationId: id,
      userId: user?.id,
      content: content.trim(),
    });

    setContent("");
  }

  function getStatusText() {
    if (otherUser?.isOnline) return "Online now";
    if (otherUser?.lastSeenAt)
      return `Last seen ${new Date(otherUser.lastSeenAt).toLocaleTimeString()}`;
    return "Last seen recently";
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerShadowVisible: false,
          headerLeft: () => (
            <View className="flex-row items-center">
              <Pressable
                onPress={() => router.back()}
                className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              >
                <ChevronLeftIcon size={22} color="black" />
              </Pressable>

              <Pressable
                onPress={() => {
                  if (!otherUser?.id) return;

                  router.push({
                    pathname: "/users/[id]",
                    params: { id: otherUser.id },
                  });
                }}
                className="flex-row items-center"
              >
                <Avatar
                  uri={otherUser?.avatarUrl}
                  username={otherUser?.username}
                  size={40}
                />

                <View className="ml-3">
                  <Text className="text-base font-bold text-black">
                    {otherUser?.username ?? "Chat"}
                  </Text>

                  <Text className="text-xs text-gray-500">
                    {getStatusText()}
                  </Text>
                </View>
              </Pressable>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingTop: 10,
          }}
          renderItem={({ item }) => {
            const isMine = item.senderId === user?.id;

            return (
              <View
                className={`mb-3 max-w-[80%] rounded-2xl px-4 py-3 ${
                  isMine
                    ? "self-end rounded-br-none bg-[#F7D786]"
                    : "self-start rounded-bl-none bg-[#EEEEEE]"
                }`}
              >
                <Text className="text-black">{item.content}</Text>
              </View>
            );
          }}
        />

        <View className="flex-row items-center gap-2 border-t border-gray-200 px-4 py-3">
          <TextInput
            className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-black"
            placeholder="Message..."
            placeholderTextColor="#9CA3AF"
            value={content}
            onChangeText={setContent}
          />

          <TouchableOpacity
            className="rounded-2xl bg-black px-4 py-3"
            onPress={sendMessage}
          >
            <Text className="font-bold text-white">Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
