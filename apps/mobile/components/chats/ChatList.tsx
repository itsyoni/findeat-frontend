import { Chat } from "@findeat/types/chat";
import { ChatCircleIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import Text from "../common/AppText";
import ChatRow from "./ChatRow";
import { Skeleton, SkeletonPulse } from "../common";

type Props = {
  chats: Chat[];
  refreshing: boolean;
  onRefresh: () => void;
  loading?: boolean;
};

export default function ChatList({ chats, refreshing, onRefresh, loading = false }: Props) {
  const { t } = useTranslation("chat");

  if (loading) {
    return (
      <SkeletonPulse style={{ paddingTop: 8 }}>
        {Array.from({ length: 7 }, (_, index) => (
          <View key={index} className="flex-row items-center px-4 py-3">
            <Skeleton width={58} height={58} circle />
            <View className="ml-3 flex-1 gap-2">
              <Skeleton width="52%" height={15} radius={7} />
              <Skeleton width="76%" height={12} radius={6} />
            </View>
            <View className="items-end gap-2">
              <Skeleton width={34} height={9} radius={5} />
              {index < 2 ? <Skeleton width={20} height={20} circle /> : null}
            </View>
          </View>
        ))}
      </SkeletonPulse>
    );
  }

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
