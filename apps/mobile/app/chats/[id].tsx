import Text from "@/components/common/AppText";

import Avatar from "@/components/common/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { api, API_URL } from "@/lib/api";
import { Chat, Message } from "@findeat/types/chat";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { CaretLeftIcon, PaperPlaneTiltIcon } from "phosphor-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { LoadingScreen, TextInput } from "@/components/common";

export default function ChatScreen() {
  const { user } = useAuth();

  const params = useLocalSearchParams<{
    id: string;
    type?: "DIRECT" | "RESTAURANT";
    targetUserId?: string;
    restaurantId?: string;
    title?: string;
    imageUrl?: string;
  }>();

  const { id } = params;
  const isNewChat = id === "new-direct" || id === "new-restaurant";

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(!isNewChat);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(id);

  const socketRef = useRef<Socket | null>(null);

  const otherUser = chat?.participants.find((p) => p.userId !== user?.id)?.user;

  const isGroupChat = chat?.type === "GROUP";
  const isRestaurantChat = chat?.type === "RESTAURANT";

  const headerTitle = isNewChat
    ? params.title
    : isGroupChat
      ? chat?.title
      : isRestaurantChat
        ? chat?.restaurant?.name
        : otherUser?.username;

  const headerImage = isNewChat
    ? params.imageUrl
    : isGroupChat
      ? chat?.imageUrl
      : isRestaurantChat
        ? chat?.restaurant?.logoUrl
        : otherUser?.avatarUrl;

  const loadChat = useCallback(async () => {
    if (isNewChat) return;

    const chat = await api.chats.get(conversationId);
    setChat(chat);
  }, [conversationId, isNewChat]);

  const loadMessages = useCallback(async () => {
    if (isNewChat) return;

    const messages = await api.chats.messages(conversationId);
    setMessages(messages);
  }, [conversationId, isNewChat]);

  useEffect(() => {
    async function init() {
      if (isNewChat) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await Promise.all([loadChat(), loadMessages()]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [isNewChat, loadChat, loadMessages]);

  useEffect(() => {
    if (!user?.id || isNewChat) return;

    const socket = io(API_URL, {
      auth: { userId: user.id },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_conversation", {
        conversationId,
      });
    });

    socket.on("receive_message", (message: Message) => {
      setMessages((current) => {
        const exists = current.some((item) => item.id === message.id);
        if (exists) return current;
        return [...current, message];
      });
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [conversationId, isNewChat, user?.id]);

  async function onRefresh() {
    if (isNewChat) return;

    setRefreshing(true);
    await Promise.all([loadChat(), loadMessages()]);
    setRefreshing(false);
  }

  async function sendMessage() {
    const trimmedContent = content.trim();
    if (!trimmedContent || sending) return;

    try {
      setSending(true);

      if (isNewChat) {
        const message =
          params.type === "DIRECT"
            ? await api.chats.sendDirectMessage(
                params.targetUserId!,
                trimmedContent,
              )
            : await api.chats.sendRestaurantMessage(
                params.restaurantId!,
                trimmedContent,
              );

        setMessages((current) => [...current, message]);
        setContent("");
        setConversationId(message.conversationId);

        router.setParams({
          id: message.conversationId,
        });

        return;
      }

      socketRef.current?.emit("send_message", {
        conversationId,
        userId: user?.id,
        type: "TEXT",
        content: trimmedContent,
      });

      setContent("");
    } catch (error) {
      console.error("send message failed", error);
    } finally {
      setSending(false);
    }
  }

  function getStatusText() {
    if (isNewChat) return "New conversation";

    if (isGroupChat) {
      const count = chat?.participants.length ?? 0;
      return `${count} members`;
    }

    if (isRestaurantChat) {
      return "Restaurant chat";
    }

    if (otherUser?.isOnline) return "Online now";

    if (otherUser?.lastSeenAt) {
      return `Last seen ${new Date(otherUser.lastSeenAt).toLocaleTimeString()}`;
    }

    return "Last seen recently";
  }

  if (loading) {
    return <LoadingScreen />;
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
                <CaretLeftIcon size={22} color="black" />
              </Pressable>

              <Pressable
                onPress={() => {
                  if (isNewChat) return;

                  if (isGroupChat) {
                    router.push({
                      pathname: "/chats/group/[id]",
                      params: { id: conversationId },
                    });
                    return;
                  }

                  if (isRestaurantChat && chat?.restaurant?.id) {
                    router.push({
                      pathname: "/restaurants/[id]",
                      params: { id: chat.restaurant.id },
                    });
                    return;
                  }

                  if (!otherUser?.id) return;

                  router.push({
                    pathname: "/(users)/[id]",
                    params: { id: otherUser.id },
                  });
                }}
                className="flex-row items-center"
              >
                <Avatar
                  uri={headerImage}
                  username={headerTitle ?? "Chat"}
                  size={40}
                />

                <View className="ml-3">
                  <Text className="text-base font-bold text-black">
                    {headerTitle ?? "Chat"}
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
      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={{ flex: 1, backgroundColor: "white" }}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={90}
        >
          <FlatList
            refreshing={refreshing}
            onRefresh={onRefresh}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 10,
              paddingTop: 10,
            }}
            ListEmptyComponent={
              isNewChat ? (
                <View className="flex-1 items-center justify-center px-8">
                  <Text className="text-center text-xl font-bold text-black">
                    No messages yet
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item, index }) => {
              const isMine = item.senderId === user?.id;

              const previousMessage = index > 0 ? messages[index - 1] : null;
              const nextMessage =
                index < messages.length - 1 ? messages[index + 1] : null;

              const isGroupMessageFromOther = isGroupChat && !isMine;

              const shouldShowAvatar =
                isGroupMessageFromOther &&
                nextMessage?.senderId !== item.senderId;

              const shouldShowSenderName =
                isGroupMessageFromOther &&
                previousMessage?.senderId !== item.senderId;

              return (
                <View
                  className={`mb-1 flex-row ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  {isGroupMessageFromOther && (
                    <View className="mr-2 w-8 justify-end">
                      {shouldShowAvatar ? (
                        <Avatar
                          uri={item.sender.avatarUrl}
                          username={item.sender.username}
                          size={32}
                        />
                      ) : null}
                    </View>
                  )}

                  <View
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      isMine
                        ? "rounded-br-none bg-[#F7D786]"
                        : "rounded-bl-none bg-[#EEEEEE]"
                    }`}
                  >
                    {shouldShowSenderName && (
                      <Text className="mb-1 text-xs font-bold text-gray-500">
                        @{item.sender.username}
                      </Text>
                    )}

                    {item.type === "POST" ? (
                      item.post ? (
                        <Pressable
                          className="overflow-hidden rounded-xl bg-white"
                          onPress={() =>
                            router.push({
                              pathname: "/(posts)/[id]",
                              params: { id: item.post!.id },
                            })
                          }
                        >
                          {(() => {
                            const image =
                              item.post.contentPost?.imageUrl ??
                              item.post.reviewPost?.coverImageUrl;

                            const description =
                              item.post.contentPost?.description ??
                              item.post.reviewPost?.summary;

                            return (
                              <>
                                {!!image && (
                                  <Image
                                    source={{ uri: image }}
                                    className="h-40 w-56"
                                    resizeMode="cover"
                                  />
                                )}

                                <View className="p-3">
                                  <Text className="font-bold text-black">
                                    {item.post.restaurant?.name ??
                                      "FindEat post"}
                                  </Text>

                                  {!!description && (
                                    <Text
                                      numberOfLines={2}
                                      className="mt-1 text-sm text-gray-600"
                                    >
                                      {description}
                                    </Text>
                                  )}
                                </View>
                              </>
                            );
                          })()}
                        </Pressable>
                      ) : (
                        <View className="items-center rounded-xl bg-gray-100 px-5 py-6">
                          <Text className="text-center text-sm font-medium text-gray-500">
                            This post has been deleted
                          </Text>
                        </View>
                      )
                    ) : (
                      <Text className="text-black">{item.content}</Text>
                    )}
                  </View>
                </View>
              );
            }}
          />

          <View className="flex-row items-center px-4 py-3">
            <TextInput
              className="flex-1 rounded-2xl bg-[#F5F4F5] border-0 px-4 text-black"
              placeholder="Message..."
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={setContent}
              multiline
            />

            <TouchableOpacity
              className="ml-3 h-11 w-11 items-center justify-center rounded-full bg-black"
              onPress={sendMessage}
              disabled={!content.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator color="white" />
              ) : (
                <PaperPlaneTiltIcon size={22} color="white" weight="fill" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
