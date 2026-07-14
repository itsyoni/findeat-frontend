import Text from "@/components/common/AppText";

import Avatar from "@/components/common/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { api, API_URL } from "@/lib/api";
import { Chat, Message } from "@findeat/types/chat";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { CaretLeftIcon, PaperPlaneTiltIcon, XIcon } from "phosphor-react-native";
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
import ChatSkeleton, { ChatHeaderSkeleton } from "@/components/chats/ChatSkeleton";
import Animated, {
  cancelAnimation,
  FadeIn,
  FadeOut,
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomInEasyDown,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/contexts/ThemeContext";
import RestaurantBadge from "@/components/restaurants/RestaurantBadge";
import MessageActionsBottomSheet from "@/components/chats/MessageActionsBottomSheet";

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

function TypingDot({ delay }: { delay: number }) {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 180 }),
          withTiming(0, { duration: 180 }),
          withTiming(0, { duration: 360 }),
        ),
        -1,
      ),
    );

    return () => cancelAnimation(offset);
  }, [delay, offset]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(offset.value, [-4, 0], [1, 0.45]),
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-300"
    />
  );
}

function TypingDots() {
  return (
    <View className="flex-row items-center gap-1">
      <TypingDot delay={0} />
      <TypingDot delay={120} />
      <TypingDot delay={240} />
    </View>
  );
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
  const shouldResolveRestaurantChat =
    id === "new-restaurant" &&
    params.type === "RESTAURANT" &&
    !!params.restaurantId;

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [composerHeight, setComposerHeight] = useState(42);
  const [loading, setLoading] = useState(
    !isNewChat || shouldResolveRestaurantChat,
  );
  const [isThreadReady, setIsThreadReady] = useState(
    isNewChat && !shouldResolveRestaurantChat,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [animateNewMessages, setAnimateNewMessages] = useState(false);
  const [conversationId, setConversationId] = useState(id);
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesListRef = useRef<FlatList<ChatMessage>>(null);
  const composerBaseContentHeightRef = useRef<number | null>(null);
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const typingUserTimersRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>(),
  );
  const sentTypingRef = useRef(false);
  const shouldScrollToEndRef = useRef(false);
  const scrollToEndAnimatedRef = useRef(false);
  const hasPositionedAtBottomRef = useRef(false);

  const scheduleScrollToEnd = useCallback((animated: boolean) => {
    shouldScrollToEndRef.current = true;
    scrollToEndAnimatedRef.current = animated;

    requestAnimationFrame(() => {
      messagesListRef.current?.scrollToEnd({ animated });
    });
  }, []);

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

  const typingParticipant = chat?.participants.find(
    (participant) => participant.userId === typingUserIds[0],
  );
  const typingName =
    typingParticipant?.user.displayName ??
    typingParticipant?.user.username ??
    t("someone");
  const typingLabel = isGroupChat
    ? typingUserIds.length > 1
      ? t("peopleTyping", { count: typingUserIds.length })
      : t("userTyping", { name: typingName })
    : t("typing");

  const removeTypingUser = useCallback((typingUserId: string) => {
    const timer = typingUserTimersRef.current.get(typingUserId);
    if (timer) clearTimeout(timer);
    typingUserTimersRef.current.delete(typingUserId);
    setTypingUserIds((current) =>
      current.filter((userId) => userId !== typingUserId),
    );
  }, []);

  const stopTyping = useCallback(() => {
    if (typingStopTimerRef.current) {
      clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }

    if (sentTypingRef.current && !isNewChat) {
      socketRef.current?.emit("typing_stop", { conversationId });
    }

    sentTypingRef.current = false;
  }, [conversationId, isNewChat]);

  const handleContentChange = useCallback(
    (nextContent: string) => {
      setContent(nextContent);

      const socket = socketRef.current;
      if (isNewChat || !socket?.connected) return;

      if (!nextContent.trim()) {
        stopTyping();
        return;
      }

      if (!sentTypingRef.current) {
        socket.emit("typing_start", { conversationId });
        sentTypingRef.current = true;
      }

      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current);
      }

      typingStopTimerRef.current = setTimeout(() => {
        socket.emit("typing_stop", { conversationId });
        sentTypingRef.current = false;
        typingStopTimerRef.current = null;
      }, 1_500);
    },
    [conversationId, isNewChat, stopTyping],
  );

  const loadChat = useCallback(async () => {
    if (isNewChat) return;

    const chat = await api.chats.get(conversationId);
    setChat(chat);
  }, [conversationId, isNewChat]);

  const loadMessages = useCallback(async (prepareInitialPosition = false) => {
    if (isNewChat) return;

    const messages = await api.chats.messages(conversationId);
    if (prepareInitialPosition) {
      hasPositionedAtBottomRef.current = false;
      setIsThreadReady(false);
    }
    shouldScrollToEndRef.current = true;
    scrollToEndAnimatedRef.current = false;
    setMessages(messages);

    requestAnimationFrame(() => setAnimateNewMessages(true));
  }, [conversationId, isNewChat]);

  useEffect(() => {
    let active = true;

    async function init() {
      if (isNewChat) {
        setAnimateNewMessages(true);

        if (shouldResolveRestaurantChat && params.restaurantId) {
          try {
            setLoading(true);
            const existingChat =
              await api.chats.findRestaurantConversation(params.restaurantId);

            if (!active) return;

            if (existingChat) {
              setChat(existingChat);
              setConversationId(existingChat.id);
              router.setParams({ id: existingChat.id });
              return;
            }
          } catch (error) {
            console.error("Could not resolve restaurant conversation", error);
          }
        }

        if (!active) return;
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await Promise.all([loadChat(), loadMessages(true)]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    void init();

    return () => {
      active = false;
    };
  }, [
    isNewChat,
    loadChat,
    loadMessages,
    params.restaurantId,
    shouldResolveRestaurantChat,
  ]);

  useEffect(() => {
    if (!user?.id || isNewChat) return;

    const socket = io(API_URL, {
      auth: { userId: user.id },
    });
    const typingUserTimers = typingUserTimersRef.current;

    socketRef.current = socket;

    socket.on("connect", () => {
      setTypingUserIds([]);
      socket.emit("join_conversation", {
        conversationId,
      });
    });

    socket.on("receive_message", (message: Message) => {
      removeTypingUser(message.senderId);
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

    socket.on(
      "message_deleted",
      (event: { messageId: string; deletedAt: string }) => {
        setMessages((current) =>
          current.map((message) =>
            message.id === event.messageId
              ? {
                  ...message,
                  content: null,
                  imageUrl: null,
                  post: null,
                  restaurant: null,
                  deletedAt: event.deletedAt,
                }
              : message.replyTo?.id === event.messageId
                ? {
                    ...message,
                    replyTo: {
                      ...message.replyTo,
                      content: null,
                      imageUrl: null,
                      deletedAt: event.deletedAt,
                    },
                  }
                : message,
          ),
        );
        setReplyingTo((current) =>
          current?.id === event.messageId ? null : current,
        );
      },
    );

    socket.on(
      "typing_changed",
      (event: {
        conversationId: string;
        userId: string;
        isTyping: boolean;
      }) => {
        if (
          event.conversationId !== conversationId ||
          event.userId === user.id
        ) {
          return;
        }

        if (!event.isTyping) {
          removeTypingUser(event.userId);
          return;
        }

        setTypingUserIds((current) =>
          current.includes(event.userId) ? current : [...current, event.userId],
        );

        const currentTimer = typingUserTimers.get(event.userId);
        if (currentTimer) clearTimeout(currentTimer);
        typingUserTimers.set(
          event.userId,
          setTimeout(() => removeTypingUser(event.userId), 3_500),
        );
      },
    );

    return () => {
      if (sentTypingRef.current) {
        socket.emit("typing_stop", { conversationId });
      }
      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = null;
      }
      typingUserTimers.forEach(clearTimeout);
      typingUserTimers.clear();
      sentTypingRef.current = false;
      socket.off("receive_message");
      socket.off("message_deleted");
      socket.off("typing_changed");
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [conversationId, isNewChat, removeTypingUser, user?.id]);

  async function onRefresh() {
    if (isNewChat) return;

    setRefreshing(true);
    await Promise.all([loadChat(), loadMessages(false)]);
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
      replyToId: replyingTo?.id,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            type: replyingTo.type,
            content: replyingTo.content,
            imageUrl: replyingTo.imageUrl,
            deletedAt: replyingTo.deletedAt,
            sender: replyingTo.sender,
            sentAsRestaurant: replyingTo.sentAsRestaurant,
          }
        : null,
    };

    stopTyping();
    scheduleScrollToEnd(hasPositionedAtBottomRef.current);
    setMessages((current) => [...current, optimisticMessage]);
    setContent("");
    const replyToId = replyingTo?.id;
    setReplyingTo(null);
    setComposerHeight(42);

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
          replyToId,
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

  async function deleteMessage(
    message: Message,
    scope: "me" | "everyone",
  ) {
    if (message.id.startsWith("pending-")) {
      setMessages((current) => current.filter((item) => item.id !== message.id));
      return;
    }

    const result = await api.chats.deleteMessage(
      conversationId,
      message.id,
      scope,
    );
    if (scope === "me") {
      setMessages((current) => current.filter((item) => item.id !== message.id));
    } else {
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? {
                ...item,
                content: null,
                imageUrl: null,
                post: null,
                restaurant: null,
                deletedAt: result.deletedAt ?? new Date().toISOString(),
              }
            : item.replyTo?.id === message.id
              ? {
                  ...item,
                  replyTo: {
                    ...item.replyTo,
                    content: null,
                    imageUrl: null,
                    deletedAt: result.deletedAt ?? new Date().toISOString(),
                  },
                }
              : item,
        ),
      );
    }
    setReplyingTo((current) => current?.id === message.id ? null : current);
  }

  function replyPreview(
    message: Pick<Message, "deletedAt" | "content" | "type">,
  ) {
    if (message.deletedAt) return t("deletedMessage");
    if (message.content) return message.content;
    if (message.type === "IMAGE") return t("photoMessage");
    if (message.type === "POST") return t("postMessage");
    if (message.type === "RESTAURANT") return t("restaurantMessage");
    return t("message");
  }

  function replyAuthor(message: Message) {
    if (message.senderId === user?.id) return t("you");
    return message.sentAsRestaurant?.name ?? message.sender.displayName ?? message.sender.username;
  }

  function scrollToMessage(messageId: string) {
    const index = messages.findIndex((message) => message.id === messageId);
    if (index >= 0) {
      messagesListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }
  }

  function getStatusText() {
    if (isNewChat) return t("newConversation");

    if (typingUserIds.length > 0) return typingLabel;

    if (isGroupChat) {
      const count = chat?.participants.length ?? 0;
      return t("members", { count });
    }

    if (isRestaurantChat) {
      return t("restaurantChat");
    }

    if (
      user?.showActivityStatus === false ||
      otherUser?.showActivityStatus === false
    ) {
      return "";
    }

    if (otherUser?.isOnline) return t("onlineNow");

    if (otherUser?.lastSeenAt) {
      return t("lastSeen", {
        time: new Date(otherUser.lastSeenAt).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
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

  const statusText = loading ? "" : getStatusText();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <SafeAreaView
              edges={["top"]}
              style={{ backgroundColor: isDark ? "#0F0F10" : "white" }}
            >
              <View className="h-16 flex-row items-center border-b border-gray-100 bg-white px-2 dark:border-gray-900 dark:bg-[#0F0F10]">
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

                {loading ? <ChatHeaderSkeleton /> : <Pressable
                  onPress={openChatProfile}
                  disabled={isNewChat}
                  className="min-w-0 flex-1 flex-row items-center py-2"
                >
                  <Avatar
                    uri={headerImage}
                    username={headerTitle ?? "Chat"}
                    size={42}
                    fallbackType={isRestaurantChat ? "restaurant" : "user"}
                  />

                  <View className="ml-3 min-w-0 flex-1">
                    <View className="flex-row items-center">
                      <Text numberOfLines={1} className="shrink text-base font-bold text-black dark:text-white">
                        {headerTitle ?? "Chat"}
                      </Text>
                      {isRestaurantChat ? <RestaurantBadge /> : null}
                    </View>

                    {statusText ? (
                      <Text
                        numberOfLines={1}
                        className={`text-xs ${typingUserIds.length > 0 || (!isGroupChat && !isRestaurantChat && otherUser?.isOnline) ? "font-semibold text-emerald-600 dark:text-emerald-400" : "text-gray-500"}`}
                      >
                        {statusText}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>}
              </View>
            </SafeAreaView>
          ),
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={{ flex: 1, backgroundColor: isDark ? "#080808" : "#FBFAF8" }}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={110}
        >
          {(loading || !isThreadReady) && <ChatSkeleton />}
          {!loading && <>
          <FlatList
            ref={messagesListRef}
            style={{ opacity: isThreadReady ? 1 : 0 }}
            refreshing={refreshing}
            onRefresh={onRefresh}
            data={messages}
            keyExtractor={(item) => item.renderKey ?? item.id}
            keyboardShouldPersistTaps="handled"
            onScrollToIndexFailed={({ index }) => {
              messagesListRef.current?.scrollToOffset({
                offset: Math.max(0, index * 72),
                animated: true,
              });
            }}
            onLayout={() => {
              if (!shouldScrollToEndRef.current) return;
              requestAnimationFrame(() => {
                messagesListRef.current?.scrollToEnd({
                  animated: scrollToEndAnimatedRef.current,
                });
                if (!isThreadReady) {
                  requestAnimationFrame(() => setIsThreadReady(true));
                }
              });
            }}
            onScrollBeginDrag={() => {
              shouldScrollToEndRef.current = false;
            }}
            onContentSizeChange={() => {
              if (!shouldScrollToEndRef.current) return;
              messagesListRef.current?.scrollToEnd({
                animated: scrollToEndAnimatedRef.current,
              });
              hasPositionedAtBottomRef.current = true;
              if (!isThreadReady) {
                requestAnimationFrame(() => {
                  messagesListRef.current?.scrollToEnd({ animated: false });
                  requestAnimationFrame(() => setIsThreadReady(true));
                });
              }
            }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 12,
              paddingBottom: 8,
              paddingTop: 12,
            }}
            ListEmptyComponent={
              isNewChat ? (
                <View className="flex-1 items-center justify-center px-8">
                  <Text className="text-center text-xl font-bold text-black dark:text-white">
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

              const nextMessageIsDifferentSender =
                !!nextMessage && nextMessage.senderId !== item.senderId;

              return (
                <View>
                  {shouldShowDateSeparator && (
                    <View className="my-4 items-center">
                      <View className="rounded-full bg-white px-3 py-1.5 dark:bg-[#1B1B1D]">
                        <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">
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
                    className={`${nextMessageIsDifferentSender ? "mb-3" : "mb-1"} flex-row ${
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

                    <Pressable
                      onLongPress={() => {
                        if (!item.deletedAt) setSelectedMessage(item);
                      }}
                      delayLongPress={260}
                      className={`max-w-[78%] rounded-[22px] border px-4 py-2.5 ${
                        isMine
                          ? `${nextMessage?.senderId !== item.senderId ? "rounded-br-md" : ""} border-[#FFD8CD] bg-brand-soft`
                          : `${nextMessage?.senderId !== item.senderId ? "rounded-bl-md" : ""} border-gray-100 bg-white dark:border-gray-800 dark:bg-[#1B1B1D]`
                      }`}
                    >
                      {shouldShowSenderName && (
                        <Text className="mb-1 text-xs font-bold text-gray-500">
                          @{item.sender.username}
                        </Text>
                      )}

                      {item.replyTo ? (
                        <Pressable
                          onPress={() => scrollToMessage(item.replyTo!.id)}
                          className={`mb-2 min-w-[150px] overflow-hidden rounded-xl border-l-4 border-brand px-3 py-2 ${isMine ? "bg-white/55" : "bg-gray-100 dark:bg-black/30"}`}
                        >
                          <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
                            {item.replyTo.sender.id === user?.id
                              ? t("you")
                              : item.replyTo.sentAsRestaurant?.name ?? item.replyTo.sender.displayName ?? item.replyTo.sender.username}
                          </Text>
                          <Text numberOfLines={2} className={`mt-0.5 text-xs ${isMine ? "text-black/60" : "text-gray-500 dark:text-gray-400"}`}>
                            {replyPreview(item.replyTo)}
                          </Text>
                        </Pressable>
                      ) : null}

                      {item.deletedAt ? (
                        <Text className={`italic ${isMine ? "text-black/55" : "text-gray-500 dark:text-gray-400"}`}>
                          {t("deletedMessage")}
                        </Text>
                      ) : item.type === "POST" ? (
                        item.post ? (
                          <Pressable
                            className="overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900"
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
                                      <Text className="font-bold text-black dark:text-white">
                                        {item.post.restaurant?.name ?? t("findEatPost")}
                                      </Text>
                                      {item.post.restaurant?.name ? <RestaurantBadge /> : null}
                                    </View>

                                    {!!description && (
                                      <Text
                                        numberOfLines={2}
                                        className="mt-1 text-sm text-gray-600 dark:text-gray-300"
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
                        <Text
                          className={
                            isMine
                              ? "text-black"
                              : "text-black dark:text-white"
                          }
                        >
                          {item.content}
                        </Text>
                      )}

                      <Text
                        className={`mt-1 self-end text-[10px] ${
                          isMine
                            ? "text-black/50"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {formatMessageTime(item.createdAt)}
                      </Text>
                    </Pressable>
                  </Animated.View>
                </View>
              );
            }}
          />

          {typingUserIds.length > 0 ? (
            <Animated.View
              entering={FadeIn.duration(140)}
              exiting={FadeOut.duration(140)}
              className="mx-3 mb-2 self-start flex-row items-center rounded-[18px] rounded-bl-md border border-gray-100 bg-white px-3 py-2 dark:border-gray-800 dark:bg-[#1B1B1D]"
            >
              <TypingDots />
              <Text className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-300">
                {typingLabel}
              </Text>
            </Animated.View>
          ) : null}

          <View className="border-t border-line bg-white px-3 py-2 dark:border-gray-900 dark:bg-[#0F0F10]">
            {replyingTo ? (
              <View className="mb-2 flex-row items-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-[#1B1B1D]">
                <View className="h-full w-1 bg-brand" />
                <View className="min-w-0 flex-1 px-3 py-2">
                  <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    {replyAuthor(replyingTo)}
                  </Text>
                  <Text numberOfLines={1} className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {replyPreview(replyingTo)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setReplyingTo(null)} hitSlop={8} className="h-11 w-11 items-center justify-center">
                  <XIcon size={20} color={isDark ? "#D1D5DB" : "#6B7280"} weight="bold" />
                </TouchableOpacity>
              </View>
            ) : null}
            <View className="flex-row items-end">
            <RNTextInput
              className="flex-1 rounded-3xl border border-line bg-soft px-4 text-ink dark:border-gray-800 dark:bg-[#1B1B1D] dark:text-white"
              placeholder={t("messagePlaceholder")}
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={handleContentChange}
              onBlur={stopTyping}
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
              className={`ml-2 h-10 w-10 items-center justify-center rounded-full ${content.trim() && !sending ? "bg-brand" : "bg-gray-200 dark:bg-gray-800"}`}
              onPress={sendMessage}
              disabled={!content.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator color={isDark ? "white" : "#111"} />
              ) : (
                <PaperPlaneTiltIcon
                  size={21}
                  color={content.trim() ? "#FFF" : "#9CA3AF"}
                  weight="fill"
                />
              )}
            </TouchableOpacity>
            </View>
          </View>
          </>}
        </KeyboardAvoidingView>
      </SafeAreaView>
      <MessageActionsBottomSheet
        message={selectedMessage}
        isMine={selectedMessage?.senderId === user?.id}
        onClose={() => setSelectedMessage(null)}
        onReply={(message) => setReplyingTo(message)}
        onDelete={deleteMessage}
      />
    </>
  );
}
