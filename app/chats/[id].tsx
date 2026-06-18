import { useAuth } from "@/contexts/AuthContext";
import { api, API_URL } from "@/lib/api";
import { Message } from "@/types/chat";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { title } = useLocalSearchParams();

  useEffect(() => {
    loadMessages();

    const socket = io(API_URL);
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

    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }

  async function loadMessages() {
    try {
      const res = await api.get(`/chats/${id}/messages`);
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: title as string }} />
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
                    ? "self-end bg-[#F7D786] rounded-br-none"
                    : "self-start bg-[#EEEEEE] rounded-bl-none"
                }`}
              >
                <Text className={"text-black"}>{item.content}</Text>
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
