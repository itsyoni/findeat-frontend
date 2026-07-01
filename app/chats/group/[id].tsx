import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import { api } from "@/lib/api";
import { Chat } from "@/types/chat";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { CaretLeftIcon, UserPlusIcon } from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroup();
  }, [id]);

  async function loadGroup() {
    try {
      const res = await api.get(`/chats/${id}`);
      setChat(res.data);
    } catch (error) {
      console.error("load group failed", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !chat) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              className="flex-row items-center pr-3"
              onPress={() => router.back()}
            >
              <CaretLeftIcon size={24} color="black" />
              <Text className="text-lg text-black">Back</Text>
            </Pressable>
          ),
        }}
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View className="items-center border-b border-gray-100 px-6 py-8">
          <Avatar
            uri={chat.imageUrl}
            username={chat.title ?? "Group"}
            size={96}
          />

          <Text className="mt-4 text-3xl font-bold text-black">
            {chat.title ?? "Group"}
          </Text>

          <Text className="mt-2 text-gray-500">
            {chat.participants.length} members
          </Text>

          <TouchableOpacity
            className="mt-6 flex-row items-center rounded-2xl bg-black px-5 py-3"
            onPress={() =>
              router.push({
                pathname: "/chats/group/add-members",
                params: { id: chat.id },
              })
            }
          >
            <UserPlusIcon size={20} color="white" weight="bold" />
            <Text className="ml-2 font-bold text-white">Add members</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={chat.participants}
          keyExtractor={(item) => item.userId}
          ListHeaderComponent={
            <Text className="px-5 py-4 text-sm font-bold uppercase text-gray-400">
              Members
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center border-b border-gray-100 px-5 py-4"
              onPress={() =>
                router.push({
                  pathname: "/users/[id]",
                  params: { id: item.userId },
                })
              }
            >
              <Avatar
                uri={item.user.avatarUrl}
                username={item.user.username}
                size={48}
              />

              <View className="ml-4 flex-1">
                <Text className="font-bold text-black">
                  @{item.user.username}
                </Text>

                <Text className="mt-1 text-sm text-gray-500">
                  {item.role === "ADMIN" ? "Admin" : "Member"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </>
  );
}
