import { Chat } from "@/types/chat";
import { FlatList } from "react-native";
import ChatRow from "./ChatRow";

type Props = {
  chats: Chat[];
  refreshing: boolean;
  onRefresh: () => void;
};

export default function ChatList({ chats, refreshing, onRefresh }: Props) {
  return (
    <FlatList
      refreshing={refreshing}
      onRefresh={onRefresh}
      data={chats}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatRow chat={item} />}
    />
  );
}
