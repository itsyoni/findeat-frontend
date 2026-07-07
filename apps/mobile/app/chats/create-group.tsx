import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import SearchResultRow from "@/components/search/SearchResultRow";
import SearchResultsView from "@/components/search/SearchResultsView";
import { api } from "@/lib/api";
import { searchFriends } from "@/services/search";
import { SearchResultItem } from "@findeat/types/search";
import { router, Stack } from "expo-router";
import { CaretLeftIcon, CheckIcon } from "phosphor-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateGroupScreen() {
  const [selectedUsers, setSelectedUsers] = useState<SearchResultItem[]>([]);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  function toggleUser(user: SearchResultItem) {
    setSelectedUsers((current) => {
      const exists = current.some((item) => item.id === user.id);

      if (exists) {
        return current.filter((item) => item.id !== user.id);
      }

      return [...current, user];
    });
  }

  async function createGroup() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle || selectedUsers.length < 2 || creating) return;

    try {
      setCreating(true);

      const group = await api.chats.createGroup({
        title: trimmedTitle,
        participantIds: selectedUsers.map((user) => user.id),
      });

      router.replace({
        pathname: "/chats/[id]",
        params: { id: group.id },
      });
    } catch (error) {
      console.error("create group failed", error);
    } finally {
      setCreating(false);
    }
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
        <View className="border-b border-gray-100 px-5 pb-4">
          <Text className="text-3xl font-bold text-black">New group</Text>

          <TextInput
            className="mt-5 rounded-2xl border border-gray-200 px-4 py-3 text-black"
            placeholder="Group name"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />

          {!!selectedUsers.length && (
            <View className="mt-4 flex-row flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  className="flex-row items-center rounded-full bg-[#F7D786] px-3 py-2"
                  onPress={() => toggleUser(user)}
                >
                  <Avatar uri={user.imageUrl} username={user.title} size={24} />
                  <Text className="ml-2 font-semibold text-black">
                    {user.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            className={`mt-4 flex-row items-center justify-center rounded-2xl py-4 ${
              title.trim() && selectedUsers.length >= 2
                ? "bg-black"
                : "bg-gray-300"
            }`}
            onPress={createGroup}
            disabled={!title.trim() || selectedUsers.length < 2 || creating}
          >
            {creating ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <CheckIcon size={20} color="white" weight="bold" />
                <Text className="ml-2 font-bold text-white">Create group</Text>
              </>
            )}
          </TouchableOpacity>

          <Text className="mt-3 text-center text-xs text-gray-500">
            Add at least 2 friends.
          </Text>
        </View>

        <SearchResultsView
          searchRequest={searchFriends}
          placeholder="Search friends"
          emptyText="No friends found"
          onCancel={() => router.back()}
          onSelect={toggleUser}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <SearchResultRow item={item} />}
        />
      </SafeAreaView>
    </>
  );
}
