import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export type DeliveryStatus = "sending" | "sent" | "failed";

export type ChatMessage = {
  id: string;
  clientId?: string;
  conversationId: string;
  content: string | null;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    displayName: string;
    profilePictureUrl?: string | null;
  };
  deliveryStatus?: DeliveryStatus;
  isOptimistic?: boolean;
};

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);

        const response = await api.get(`/chat/conversations/${id}/messages`);

        setMessages(response.data);
      } catch (error) {
        console.log("Fetch messages failed:", error);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    if (id) {
      fetchMessages();
    }
  }, [id]);

  useEffect(() => {
    if (!messages.length) return;

    const timeout = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);

    return () => clearTimeout(timeout);
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = text.trim();

    if (!trimmed || sending || !user || !id) return;

    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const tempId = `temp-${clientId}`;
    const now = new Date().toISOString();

    const optimisticMessage: ChatMessage = {
      id: tempId,
      clientId,
      conversationId: id,
      content: trimmed,
      createdAt: now,
      senderId: user.id,
      sender: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        profilePictureUrl: user.profilePictureUrl ?? null,
      },
      deliveryStatus: "sending",
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setText("");
    setSending(true);

    try {
      const response = await api.post(`/chat/conversations/${id}/messages`, {
        content: trimmed,
        clientId,
      });

      const realMessage = response.data;

      setMessages((prev) =>
        prev.map((message) =>
          message.clientId === clientId
            ? {
                ...realMessage,
                deliveryStatus: "sent",
                isOptimistic: false,
              }
            : message,
        ),
      );
    } catch (error) {
      console.log("Send message failed:", error);

      setMessages((prev) =>
        prev.map((message) =>
          message.clientId === clientId
            ? {
                ...message,
                deliveryStatus: "failed",
              }
            : message,
        ),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Chat" }} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView
          edges={["left", "right", "bottom"]}
          style={{ flex: 1, backgroundColor: "#fff" }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={120}
          >
            <View className="flex-1 px-5">
              {loadingMessages ? (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-[#888]">Loading messages...</Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: 12,
                    paddingBottom: 12,
                  }}
                  renderItem={({ item }) => {
                    const isMine = item.senderId === user?.id;

                    return (
                      <View
                        className={`mb-3 flex-row ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        {isMine ? (
                          <View className="max-w-[80%] rounded-3xl bg-[#F7D786] px-4 py-3">
                            <Text className="mb-1 text-sm text-[#666]">
                              You
                            </Text>
                            <Text className="text-base text-[#212121]">
                              {item.content}
                            </Text>

                            {item.deliveryStatus === "sending" && (
                              <Text className="mt-1 text-xs text-[#666]">
                                Sending...
                              </Text>
                            )}

                            {item.deliveryStatus === "failed" && (
                              <Text className="mt-1 text-xs text-red-500">
                                Failed to send
                              </Text>
                            )}
                          </View>
                        ) : (
                          <View className="max-w-[80%] rounded-3xl bg-[#f3f3f3] px-4 py-3">
                            <Text className="mb-1 text-sm text-[#666]">
                              {item.sender.displayName}
                            </Text>
                            <Text className="text-base text-[#212121]">
                              {item.content}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    <Text className="mt-6 text-center text-[#888]">
                      No messages yet
                    </Text>
                  }
                />
              )}

              <View className="flex-row items-center gap-2 py-3">
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Type a message..."
                  className="flex-1 rounded-2xl bg-[#f5f5f5] px-4 py-3 text-base"
                />
                <Pressable
                  onPress={sendMessage}
                  disabled={sending || !text.trim()}
                  className="rounded-2xl bg-black px-4 py-3 disabled:opacity-50"
                >
                  <Text className="text-white">
                    {sending ? "Sending..." : "Send"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  );
}
