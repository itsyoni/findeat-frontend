import {
  IconButton,
  LoadingScreen,
  ThemedSafeAreaView,
} from "@/components/common";
import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import Tabs from "@/components/common/Tabs";
import { api } from "@/lib/api";
import { ConnectionItem, UserRelationship } from "@findeat/types";
import {
  getNextRelationshipAfterToggle,
  getRelationshipButtonColor,
  getRelationshipButtonText,
  isFollowingRelationship,
  isFriendRelationship,
} from "@findeat/utils";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { CaretLeftIcon } from "phosphor-react-native";

type ConnectionsTab = "followers" | "following" | "friends";

export default function ConnectionsScreen() {
  const { id, type } = useLocalSearchParams<{
    id: string;
    type?: ConnectionsTab;
  }>();

  const [activeTab, setActiveTab] = useState<ConnectionsTab>(
    type ?? "followers",
  );
  const [items, setItems] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await loadConnections();
    setRefreshing(false);
  }

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);

      const connections =
        activeTab === "followers"
          ? await api.users.followers(id)
          : activeTab === "following"
            ? await api.users.following(id)
            : await api.users.friends(id);

      setItems(connections);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, activeTab]);

  async function toggleFollow(
    targetUserId: string,
    relationship?: UserRelationship,
  ) {
    const isFollowing = isFollowingRelationship(relationship);

    setItems((prev) =>
      prev.map((item) => {
        const user = getUserFromConnection(item);

        if (user?.id !== targetUserId) return item;

        const nextRelationship = getNextRelationshipAfterToggle(relationship);

        if (activeTab === "following") {
          return {
            ...item,
            following: {
              ...item.following!,
              relationship: nextRelationship,
            },
          };
        }

        return {
          ...item,
          follower: {
            ...item.follower!,
            relationship: nextRelationship,
          },
        };
      }),
    );

    await api.users.toggleFollow(targetUserId, isFollowing);
    await loadConnections();
  }
  function getUserFromConnection(item: ConnectionItem) {
    if (activeTab === "following") return item.following;
    return item.follower;
  }

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemedSafeAreaView edges={["top"]} className="pt-4">
      <View className="px-4 pb-2">
        <IconButton
          icon={CaretLeftIcon}
          variant="ghost"
          onPress={() => router.back()}
        />
      </View>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            label: "Followers",
            value: "followers",
          },
          {
            label: "Following",
            value: "following",
          },
          {
            label: "Friends",
            value: "friends",
          },
        ]}
      />

      <FlatList
        className="mt-6 px-6"
        refreshing={refreshing}
        onRefresh={onRefresh}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const user = getUserFromConnection(item);

          if (!user) return null;

          const relationship = user.relationship;

          const buttonText = getRelationshipButtonText(relationship);

          return (
            <TouchableOpacity
              className="mb-5 flex-row items-center justify-between"
              onPress={() =>
                router.push({
                  pathname: "/(users)/[id]",
                  params: { id: user.id },
                })
              }
            >
              <View className="flex-1 flex-row items-center">
                <Avatar
                  uri={user.avatarUrl}
                  username={user.username}
                  size={48}
                />

                <View className="ml-4 flex-1">
                  <Text className="text-lg font-bold text-black dark:text-white">
                    @{user.username}
                  </Text>

                  {!!user.displayName && (
                    <Text className="mt-1 text-sm text-gray-500">
                      {user.displayName}
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                className={`w-30 items-center rounded-xl px-4 py-2 ${getRelationshipButtonColor(
                  relationship,
                )}`}
                onPress={(event) => {
                  event.stopPropagation();
                  toggleFollow(user.id, relationship);
                }}
              >
                <Text
                  className={`text-center font-bold ${
                    isFriendRelationship(user.relationship)
                      ? "text-black"
                      : "text-white"
                  }`}
                >
                  {buttonText}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text className="text-gray-500">No users yet</Text>}
      />
    </ThemedSafeAreaView>
  );
}
