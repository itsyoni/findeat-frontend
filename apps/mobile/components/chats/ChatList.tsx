import { Chat } from "@findeat/types/chat";
import { ChatCircleIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import Text from "../common/AppText";
import ChatRow from "./ChatRow";

type Props = {
  chats: Chat[];
  refreshing: boolean;
  onRefresh: () => void;
};

export default function ChatList({ chats, refreshing, onRefresh }: Props) {
  const { t } = useTranslation("chat");

  return (
    <FlatList
      refreshing={refreshing}
      onRefresh={onRefresh}
      data={chats}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatRow chat={item} />}
      contentContainerStyle={
        chats.length === 0
          ? { flexGrow: 1 }
          : { paddingBottom: 24 }
      }
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center px-10 pb-20">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
            <ChatCircleIcon size={36} color="#9CA3AF" weight="fill" />
          </View>
          <Text className="mt-5 text-xl font-bold text-black dark:text-white">
            {t("noConversations")}
          </Text>
          <Text className="mt-2 text-center leading-5 text-gray-500">
            {t("noConversationsDescription")}
          </Text>
        </View>
      }
    />
  );
}
