import {
  IconButton,
  SkeletonList,
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
  isFriendRelationship,
  shouldRemoveFollowRelationship,
} from "@findeat/utils";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { DirectionalBackIcon } from "@/components/common/icons/DirectionalIcon";
import { useAuth } from "@/contexts/AuthContext";
import { AppAlert as Alert } from "@/lib/appAlert";
import { useTranslation } from "react-i18next";

type ConnectionsTab = "followers" | "following" | "friends";

export default function ConnectionsScreen() {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation(["profile", "common"]);
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
  const isOwnProfile = currentUser?.id === id;

  async function onRefresh() {
    setRefreshing(true);
    await loadConnections();
    setRefreshing(false);
  }

  function confirmRemoveFollower(userId: string, name: string) {
    Alert.alert(
      t("profile:removeFollowerTitle", { name }),
      t("profile:removeFollowerDescription"),
      [
        { text: t("common:cancel"), style: "cancel" },
        {
          text: t("profile:remove"),
          style: "destructive",
          onPress: () => {
            void api.users.removeFollower(userId).then(() => {
              setItems((current) =>
                current.filter((item) => item.follower?.id !== userId),
              );
            });
          },
        },
      ],
    );
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
    const isFollowing = shouldRemoveFollowRelationship(relationship);

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

  return (
    <ThemedSafeAreaView edges={["top"]} className="pt-4">
      <View className="px-4 pb-2">
        <IconButton
          icon={DirectionalBackIcon}
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

      {loading ? <SkeletonList count={7} /> : <FlatList
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
                    {user.displayName?.trim() || user.username}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    @{user.username}
                  </Text>
                </View>
              </View>

              {activeTab === "followers" && isOwnProfile ? (
                <TouchableOpacity
                  className="items-center rounded-xl bg-gray-200 px-4 py-2 dark:bg-gray-800"
                  onPress={(event) => {
                    event.stopPropagation();
                    confirmRemoveFollower(
                      user.id,
                      user.displayName?.trim() || user.username,
                    );
                  }}
                >
                  <Text className="font-bold text-black dark:text-white">
                    {t("profile:remove")}
                  </Text>
                </TouchableOpacity>
              ) : <TouchableOpacity
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
                      : user.relationship === "REQUESTED"
                        ? "text-black dark:text-white"
                      : "text-white dark:text-black"
                  }`}
                >
                  {buttonText}
                </Text>
              </TouchableOpacity>
              }
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text className="text-gray-500">No users yet</Text>}
      />}
    </ThemedSafeAreaView>
  );
}
