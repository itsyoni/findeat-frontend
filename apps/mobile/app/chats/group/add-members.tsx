import { SkeletonList, ThemedSafeAreaView } from "@/components/common";
import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import SearchResultRow from "@/components/search/SearchResultRow";
import SearchResultsView from "@/components/search/SearchResultsView";
import { api } from "@/lib/api";
import { searchFriends } from "@/services/search";
import { SearchResultItem } from "@findeat/types/search";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { UserPlusIcon } from "phosphor-react-native";
import DirectionalIcon from "@/components/common/icons/DirectionalIcon";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddGroupMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [selectedUsers, setSelectedUsers] = useState<SearchResultItem[]>([]);
  const [existingMemberIds, setExistingMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api.chats
      .get(id)
      .then((chat) => {
        if (cancelled) return;

        setExistingMemberIds(
          chat.participants.map((participant: { userId: string }) => {
            return participant.userId;
          }),
        );
      })
      .catch((error) => console.error("load group failed", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function searchAvailableFriends(query: string) {
    const friends = await searchFriends(query);

    return friends.filter((friend) => !existingMemberIds.includes(friend.id));
  }

  const selectedUserIds = useMemo(
    () => new Set(selectedUsers.map((user) => user.id)),
    [selectedUsers],
  );

  function toggleUser(user: SearchResultItem) {
    setSelectedUsers((current) => {
      const exists = current.some((item) => item.id === user.id);

      if (exists) {
        return current.filter((item) => item.id !== user.id);
      }

      return [...current, user];
    });
  }

  async function addMembers() {
    if (selectedUsers.length === 0 || adding) return;

    try {
      setAdding(true);

      await api.chats.addMembers(
        id,
        selectedUsers.map((user) => user.id),
      );

      router.back();
    } catch (error) {
      console.error("add members failed", error);
    } finally {
      setAdding(false);
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
              <DirectionalIcon direction="back" size={24} color="black" />
              <Text className="text-lg text-black">Back</Text>
            </Pressable>
          ),
        }}
      />

      <ThemedSafeAreaView>
        <View className="border-b border-gray-100 px-5 pb-4">
          <Text className="text-3xl font-bold text-black">Add members</Text>

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
              selectedUsers.length > 0 ? "bg-black" : "bg-gray-300"
            }`}
            onPress={addMembers}
            disabled={selectedUsers.length === 0 || adding}
          >
            {adding ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <UserPlusIcon size={20} color="white" weight="bold" />
                <Text className="ml-2 font-bold text-white">
                  Add {selectedUsers.length || ""} members
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {loading ? <SkeletonList count={7} /> : <SearchResultsView
          searchRequest={searchAvailableFriends}
          placeholder="Search friends"
          emptyText="No friends found"
          onCancel={() => router.back()}
          onSelect={toggleUser}
          keyExtractor={(item) => item.id}
          renderItem={(item) => (
            <View
              className={selectedUserIds.has(item.id) ? "bg-yellow-50" : ""}
            >
              <SearchResultRow item={item} />
            </View>
          )}
        />}
      </ThemedSafeAreaView>
    </>
  );
}
