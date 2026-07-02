import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import Tabs from "@/components/common/Tabs";
import { api } from "@/lib/api";
import { ConnectionItem } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

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

  useEffect(() => {
    loadConnections();
  }, [id, activeTab]);

  async function onRefresh() {
    setRefreshing(true);
    await loadConnections();
    setRefreshing(false);
  }

  async function loadConnections() {
    try {
      setLoading(true);

      const res = await api.get(`/users/${id}/${activeTab}`);
      setItems(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFollow(targetUserId: string, relationship?: string) {
    const isFollowing =
      relationship === "FOLLOWING" || relationship === "FRIENDS";

    setItems((prev) =>
      prev.map((item) => {
        const user = getUserFromConnection(item);

        if (user?.id !== targetUserId) return item;

        const nextRelationship =
          relationship === "FRIENDS"
            ? "FOLLOWED_BY"
            : isFollowing
              ? "NONE"
              : "FOLLOWING";

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

    if (isFollowing) {
      await api.delete(`/users/${targetUserId}/follow`);
    } else {
      await api.post(`/users/${targetUserId}/follow`);
    }

    await loadConnections();
  }

  function getUserFromConnection(item: ConnectionItem) {
    if (activeTab === "following") return item.following;
    return item.follower;
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-4">
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
          const isFollowing =
            relationship === "FOLLOWING" || relationship === "FRIENDS";

          const buttonText =
            relationship === "FRIENDS"
              ? "Friends"
              : relationship === "FOLLOWING"
                ? "Following"
                : relationship === "FOLLOWED_BY"
                  ? "Follow back"
                  : "Follow";

          return (
            <TouchableOpacity
              className="mb-5 flex-row items-center justify-between"
              onPress={() =>
                router.push({
                  pathname: "/users/[id]",
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
                  <Text className="text-lg font-bold text-black">
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
                className={`w-30 items-center rounded-xl px-4 py-2 ${
                  relationship === "FRIENDS"
                    ? "bg-[#F7D786]"
                    : relationship === "FOLLOWING"
                      ? "bg-gray-900"
                      : "bg-black"
                }`}
                onPress={(event) => {
                  event.stopPropagation();
                  toggleFollow(user.id, relationship);
                }}
              >
                <Text
                  className={`text-center font-bold ${
                    user.relationship === "FRIENDS"
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
    </View>
  );
}
