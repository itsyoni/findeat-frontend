import Text from "@/components/common/AppText";
import AppBottomSheet from "@/components/common/AppBottomSheet";
import Avatar from "@/components/common/Avatar";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";

type Props = {
  postId: string | null;
  onClose: () => void;
};

export default function SharePostBottomSheet({ postId, onClose }: Props) {
  const [chats, setChats] = useState<any[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    api.chats.list().then(setChats).catch(console.error);
  }, [postId]);

  async function sendToChat(conversationId: string) {
    if (!postId || sendingId) return;

    try {
      setSendingId(conversationId);

      await api.chats.sendMessage(conversationId, {
        type: "POST",
        postId,
      });

      onClose();
    } catch (error) {
      console.log("share post failed", error);
      console.log("share post response", (error as any)?.response?.data);
    } finally {
      setSendingId(null);
    }
  }

  return (
    <AppBottomSheet open={!!postId} snapPoints={["55%"]} onClose={onClose}>
      <Text className="mb-4 text-xl font-bold">Share post</Text>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => sendToChat(item.id)}
            className="flex-row items-center border-b border-gray-100 py-4"
          >
            <Avatar
              uri={item.imageUrl}
              username={item.title ?? "Chat"}
              size={44}
            />

            <View className="ml-3 flex-1">
              <Text className="font-bold">{item.title ?? "Chat"}</Text>
              <Text className="text-sm text-gray-500">
                {sendingId === item.id
                  ? "Sending..."
                  : (item.lastMessage ?? "Send post")}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </AppBottomSheet>
  );
}
