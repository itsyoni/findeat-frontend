import { useAuth } from "@/contexts/AuthContext";
import { Chat } from "@/types/chat";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  chat: Chat;
};

export default function ChatRow({ chat }: Props) {
  const { user } = useAuth();
  const otherUser = chat.participants.find((p) => p.userId !== user?.id)?.user;
  const unreadCount = chat.unreadCount ?? 0;
  const hasUnread = unreadCount > 0;
  const isMine = chat.lastMessageSenderId === user?.id;
  const lastMessageText = chat.lastMessage
    ? `${isMine ? "You: " : ""}${chat.lastMessage}`
    : "No messages yet";

  return (
    <TouchableOpacity
      className={`flex-row items-center gap-4 p-5 ${
        hasUnread ? "bg-gray-100" : "bg-white"
      }`}
      onPress={() =>
        router.push({
          pathname: "/chats/[id]",
          params: { id: chat.id, title: chat.id },
        })
      }
    >
      {otherUser?.avatarUrl ? (
        <Image
          source={{ uri: otherUser.avatarUrl }}
          className="h-12 w-12 rounded-full"
        />
      ) : (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-black">
          <Text className="text-base font-bold text-white">
            {otherUser?.username?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
      )}

      <View className="flex-1">
        <Text
          className={`text-lg text-black ${
            hasUnread ? "font-bold" : "font-semibold"
          }`}
        >
          {otherUser?.username}
        </Text>

        <Text
          numberOfLines={1}
          className={hasUnread ? "font-semibold text-black" : "text-gray-500"}
        >
          {lastMessageText}
        </Text>
      </View>

      {hasUnread && (
        <View className="h-6 min-w-6 items-center justify-center rounded-full bg-blue-500 px-2">
          <Text className="text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
