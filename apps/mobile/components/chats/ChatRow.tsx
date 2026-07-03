import { useAuth } from "@/contexts/AuthContext";
import { Chat } from "@findeat/types/chat";
import { router } from "expo-router";
import { UsersThreeIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";
import Text from "../common/AppText";
import Avatar from "../common/Avatar";

type Props = {
  chat: Chat;
};

export default function ChatRow({ chat }: Props) {
  const { user } = useAuth();

  const otherUser = chat.participants.find((p) => p.userId !== user?.id)?.user;

  const isGroupChat = chat.type === "GROUP";
  const isRestaurantChat = chat.type === "RESTAURANT";

  const title = isGroupChat
    ? chat.title
    : isRestaurantChat
      ? chat.restaurant?.name
      : otherUser?.username;

  const imageUrl = isGroupChat
    ? chat.imageUrl
    : isRestaurantChat
      ? chat.restaurant?.logoUrl
      : otherUser?.avatarUrl;

  const subtitle = isGroupChat
    ? `${chat.participants.length} members`
    : isRestaurantChat
      ? "Restaurant chat"
      : otherUser?.isOnline
        ? "Online now"
        : chat.lastMessage
          ? null
          : "No messages yet";

  const unreadCount = chat.unreadCount ?? 0;
  const hasUnread = unreadCount > 0;
  const isMine = chat.lastMessageSenderId === user?.id;

  const lastMessageText = chat.lastMessage
    ? `${isMine ? "You: " : ""}${chat.lastMessage}`
    : subtitle;

  return (
    <TouchableOpacity
      className={`flex-row items-center gap-4 p-5 ${
        hasUnread ? "bg-gray-100" : "bg-white"
      }`}
      onPress={() =>
        router.push({
          pathname: "/chats/[id]",
          params: {
            id: chat.id,
          },
        })
      }
    >
      {isGroupChat && !imageUrl ? (
        <View className="h-14 w-14 items-center justify-center rounded-full bg-[#F5F4F5]">
          <UsersThreeIcon size={26} color="#6B7280" weight="fill" />
        </View>
      ) : (
        <Avatar uri={imageUrl} username={title ?? "Chat"} size={48} />
      )}

      <View className="flex-1">
        <Text
          className={`text-lg text-black ${
            hasUnread ? "font-bold" : "font-semibold"
          }`}
        >
          {title ?? "Chat"}
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
