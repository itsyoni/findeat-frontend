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
  TextInput as RNTextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { LoadingScreen } from "@/components/common";
import Animated, {
  LinearTransition,
  ZoomInEasyDown,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/contexts/ThemeContext";
import RestaurantBadge from "@/components/restaurants/RestaurantBadge";

type ChatMessage = Message & {
  renderKey?: string;
};

function isSameDay(left?: string, right?: string) {
  if (!left || !right) return false;

  const leftDate = new Date(left);
  const rightDate = new Date(right);

  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
}

function formatMessageDate(
  value: string,
  labels: { today: string; yesterday: string },
) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(value, today.toISOString())) return labels.today;
  if (isSameDay(value, yesterday.toISOString())) return labels.yesterday;

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatScreen() {
  const { user } = useAuth();
  const { t } = useTranslation("chat");
  const { isDark } = useAppTheme();

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [composerHeight, setComposerHeight] = useState(42);
  const [loading, setLoading] = useState(!isNewChat);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [animateNewMessages, setAnimateNewMessages] = useState(false);
  const [conversationId, setConversationId] = useState(id);

  const socketRef = useRef<Socket | null>(null);
  const messagesListRef = useRef<FlatList<ChatMessage>>(null);
  const composerBaseContentHeightRef = useRef<number | null>(null);

  const otherUser = chat?.participants.find((p) => p.userId !== user?.id)?.user;

  const isGroupChat = chat?.type === "GROUP";
  const isRestaurantChat =
    chat?.type === "RESTAURANT" || params.type === "RESTAURANT";

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

    requestAnimationFrame(() => setAnimateNewMessages(true));
  }, [conversationId, isNewChat]);

  useEffect(() => {
    async function init() {
      if (isNewChat) {
        setAnimateNewMessages(true);
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

        const matchingPendingMessage = current.find(
          (item) =>
            item.id.startsWith("pending-") &&
            item.senderId === message.senderId &&
            item.type === message.type &&
            item.content === message.content,
        );

        if (matchingPendingMessage) {
          return current.map((item) =>
            item.id === matchingPendingMessage.id
              ? { ...message, renderKey: matchingPendingMessage.renderKey }
              : item,
          );
        }

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
    if (!trimmedContent || sending || !user) return;

    const optimisticId = `pending-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      renderKey: optimisticId,
      type: "TEXT",
      content: trimmedContent,
      createdAt: new Date().toISOString(),
      senderId: user.id,
      sender: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    };

    setMessages((current) => [...current, optimisticMessage]);
    setContent("");
    setComposerHeight(42);

    requestAnimationFrame(() => {
      messagesListRef.current?.scrollToEnd({ animated: true });
    });

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

        setMessages((current) =>
          current.map((item) =>
            item.id === optimisticId
              ? { ...message, renderKey: item.renderKey }
              : item,
          ),
        );
        setConversationId(message.conversationId);

        router.setParams({
          id: message.conversationId,
        });

        return;
      }

      socketRef.current?.timeout(10_000).emit(
        "send_message",
        {
          conversationId,
          userId: user.id,
          type: "TEXT",
          content: trimmedContent,
        },
        (error: Error | null, message: Message) => {
          if (error || !message?.id) {
            setMessages((current) =>
              current.filter((item) => item.id !== optimisticId),
            );
            console.error("send message failed", error);
            return;
          }

          setMessages((current) =>
            current.some((item) => item.id === optimisticId)
              ? current
                  .filter((item) => item.id !== message.id)
                  .map((item) =>
                    item.id === optimisticId
                      ? { ...message, renderKey: item.renderKey }
                      : item,
                  )
              : current.some((item) => item.id === message.id)
                ? current
                : [...current, message],
          );
        },
      );
    } catch (error) {
      setMessages((current) =>
        current.filter((item) => item.id !== optimisticId),
      );
      console.error("send message failed", error);
    } finally {
      setSending(false);
    }
  }

  function getStatusText() {
    if (isNewChat) return t("newConversation");

    if (isGroupChat) {
      const count = chat?.participants.length ?? 0;
      return t("members", { count });
    }

    if (isRestaurantChat) {
      return t("restaurantChat");
    }

    if (otherUser?.isOnline) return t("onlineNow");

    if (otherUser?.lastSeenAt) {
      return t("lastSeen", {
        time: new Date(otherUser.lastSeenAt).toLocaleTimeString(),
      });
    }

    return t("lastSeenRecently");
  }

  function openChatProfile() {
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
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <SafeAreaView
              edges={["top"]}
              style={{ backgroundColor: isDark ? "#000" : "white" }}
            >
              <View className="h-15 flex-row items-center border-b border-gray-100 bg-white px-2 dark:border-gray-800 dark:bg-black">
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={8}
                  className="h-11 w-11 items-center justify-center"
                >
                  <CaretLeftIcon
                    size={28}
                    color={isDark ? "white" : "black"}
                    weight="bold"
                  />
                </Pressable>

                <Pressable
                  onPress={openChatProfile}
                  disabled={isNewChat}
                  className="min-w-0 flex-1 flex-row items-center py-2"
                >
                  <Avatar
                    uri={headerImage}
                    username={headerTitle ?? "Chat"}
                    size={40}
                    fallbackType={isRestaurantChat ? "restaurant" : "user"}
                  />

                  <View className="ml-3 min-w-0 flex-1">
                    <View className="flex-row items-center">
                      <Text numberOfLines={1} className="shrink text-base font-bold text-black dark:text-white">
                        {headerTitle ?? "Chat"}
                      </Text>
                      {isRestaurantChat ? <RestaurantBadge /> : null}
                    </View>

                    <Text numberOfLines={1} className="text-xs text-gray-500">
                      {getStatusText()}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </SafeAreaView>
          ),
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={{ flex: 1, backgroundColor: isDark ? "#000" : "white" }}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={110}
        >
          <FlatList
            ref={messagesListRef}
            refreshing={refreshing}
            onRefresh={onRefresh}
            data={messages}
            keyExtractor={(item) => item.renderKey ?? item.id}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 10,
              paddingTop: 10,
            }}
            ListEmptyComponent={
              isNewChat ? (
                <View className="flex-1 items-center justify-center px-8">
                  <Text className="text-center text-xl font-bold text-black">
                    {t("noMessages")}
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

              const shouldShowDateSeparator =
                !previousMessage ||
                !isSameDay(previousMessage.createdAt, item.createdAt);

              return (
                <View>
                  {shouldShowDateSeparator && (
                    <View className="my-4 items-center">
                      <View className="rounded-full bg-gray-100 px-3 py-1.5">
                        <Text className="text-xs font-semibold text-gray-500">
                          {formatMessageDate(item.createdAt, {
                            today: t("today"),
                            yesterday: t("yesterday"),
                          })}
                        </Text>
                      </View>
                    </View>
                  )}

                  <Animated.View
                    entering={
                      animateNewMessages
                        ? ZoomInEasyDown.duration(180)
                        : undefined
                    }
                    layout={LinearTransition.duration(160)}
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
                          : "rounded-bl-none bg-[#EEEEEE] dark:bg-gray-800"
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
                                    <View className="flex-row items-center">
                                      <Text className="font-bold text-black">
                                        {item.post.restaurant?.name ?? t("findEatPost")}
                                      </Text>
                                      {item.post.restaurant?.name ? <RestaurantBadge /> : null}
                                    </View>

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
                              {t("deletedPost")}
                            </Text>
                          </View>
                        )
                      ) : (
                        <Text className="text-black dark:text-white">
                          {item.content}
                        </Text>
                      )}

                      <Text
                        className={`mt-1 self-end text-[10px] ${
                          isMine ? "text-gray-700" : "text-gray-500"
                        }`}
                      >
                        {formatMessageTime(item.createdAt)}
                      </Text>
                    </View>
                  </Animated.View>
                </View>
              );
            }}
          />

          <View className="flex-row items-end px-3 py-2">
            <RNTextInput
              className="flex-1 rounded-3xl border-0 bg-[#F5F4F5] px-4 text-black dark:bg-gray-900 dark:text-white"
              placeholder={t("messagePlaceholder")}
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={setContent}
              multiline
              scrollEnabled={composerHeight >= 136}
              onContentSizeChange={(event) => {
                const measuredHeight = Math.ceil(
                  event.nativeEvent.contentSize.height,
                );

                if (
                  composerBaseContentHeightRef.current === null ||
                  content.length === 0
                ) {
                  composerBaseContentHeightRef.current = measuredHeight;
                }

                const baseHeight = composerBaseContentHeightRef.current;
                const measuredLines = Math.max(
                  1,
                  Math.round((measuredHeight - baseHeight) / 20) + 1,
                );
                const visibleLines = Math.min(6, measuredLines);
                const nextHeight = 42 + (visibleLines - 1) * 20;

                setComposerHeight((currentHeight) =>
                  currentHeight === nextHeight
                    ? currentHeight
                    : nextHeight,
                );
              }}
              style={{
                height: composerHeight,
                minHeight: 42,
                maxHeight: 136,
                paddingTop: 10,
                paddingBottom: 10,
                lineHeight: 20,
                fontSize: 16,
                fontFamily: "CabinetRegular",
              }}
            />

            <TouchableOpacity
              className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-black"
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
