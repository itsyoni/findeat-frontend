import { useAuth } from "@/contexts/AuthContext";
import { Chat } from "@findeat/types/chat";
import { router } from "expo-router";
import { UsersThreeIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";
import Text from "../common/AppText";
import Avatar from "../common/Avatar";
import { useTranslation } from "react-i18next";

type Props = {
  chat: Chat;
};

export default function ChatRow({ chat }: Props) {
  const { user } = useAuth();
  const { t } = useTranslation("chat");

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
    ? t("members", { count: chat.participants.length })
    : isRestaurantChat
      ? t("restaurantChat")
      : otherUser?.isOnline
        ? t("onlineNow")
        : chat.lastMessage
          ? null
          : t("noMessages");

  const unreadCount = chat.unreadCount ?? 0;
  const hasUnread = unreadCount > 0;
  const isMine = chat.lastMessageSenderId === user?.id;

  const lastMessageText = chat.lastMessage
    ? `${isMine ? `${t("you")}: ` : ""}${chat.lastMessage}`
    : subtitle;

  return (
    <TouchableOpacity
      className={`flex-row items-center gap-4 p-5 ${
        hasUnread
          ? "bg-gray-100 dark:bg-gray-800"
          : "bg-white dark:bg-black"
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
        <Avatar uri={imageUrl} username={title ?? t("chat")} size={48} />
      )}

      <View className="flex-1">
        <Text
          className={`text-lg text-black dark:text-white ${
            hasUnread ? "font-bold" : "font-semibold"
          }`}
        >
          {title ?? t("chat")}
        </Text>

        <Text
          numberOfLines={1}
          className={
            hasUnread
              ? "font-semibold text-black dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }
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
