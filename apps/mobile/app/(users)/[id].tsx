import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import Tabs from "@/components/common/Tabs";
import ProfileManagedRestaurants from "@/components/profile/ProfileManagedRestaurants";
import ProfilePostGrid from "@/components/profile/ProfilePostGrid";
import { useUserProfile } from "@/hooks/useUserProfile";
import { api } from "@/lib/api";
import { PostType } from "@findeat/types/post";
import {
  filterPostsByType,
  getRelationshipButtonColor,
  getRelationshipButtonText,
  isFollowingRelationship,
  isFriendRelationship,
} from "@findeat/utils";
import { router, useLocalSearchParams } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");
  const {
    profile: user,
    setProfile: setUser,
    loading,
  } = useUserProfile(id as string);

  const posts = useMemo(
    () => filterPostsByType(user?.posts, activeFeed),
    [user, activeFeed],
  );

  async function toggleFollow() {
    if (!user) return;

    try {
      const shouldUnfollow = isFollowingRelationship(user.relationship);

      const result = shouldUnfollow
        ? await api.users.unfollow(user.id)
        : await api.users.follow(user.id);

      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              relationship: result.relationship,
              isFollowing: isFollowingRelationship(result.relationship),
              followersCount: shouldUnfollow
                ? Math.max(0, currentUser.followersCount - 1)
                : currentUser.followersCount + 1,
            }
          : currentUser,
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function startChat() {
    if (!user) return;

    try {
      const chat = await api.chats.startDirectConversation(user.id);

      router.push({
        pathname: "/chats/[id]",
        params: { id: chat.id },
      });
    } catch (error) {
      console.error(error);
    }
  }

  if (loading || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View>
        <View>
          <View className="relative">
            <Image
              source={{ uri: user.coverUrl ?? "fallback" }}
              className="h-70 w-full bg-gray-200"
              resizeMode="cover"
            />

            <SafeAreaView
              edges={["top"]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              <TouchableOpacity
                className="ml-4 mt-2 h-11 w-11 items-center justify-center rounded-full bg-black/30"
                onPress={() => router.back()}
              >
                <CaretLeftIcon size={24} color="white" />
              </TouchableOpacity>
            </SafeAreaView>
          </View>
          <View className="-mt-15 px-5">
            <Avatar
              uri={user.avatarUrl}
              username={user.username}
              size={100}
              style={{
                outlineStyle: "solid",
                outlineWidth: 5,
                outlineColor: "white",
              }}
            />
          </View>
        </View>
        <View className="px-5">
          <Text className="mt-5 text-3xl font-bold text-black">
            @{user.username}
          </Text>

          <ProfileManagedRestaurants memberships={user.restaurantMemberships} />

          {!!user.email && (
            <Text className="mt-2 text-gray-500">{user.email}</Text>
          )}

          {!!user.bio && <Text className="mt-3 text-black">{user.bio}</Text>}

          <View className="mt-6 flex-row">
            <View className="mr-8">
              <Text className="text-xl font-bold">{user.posts.length}</Text>
              <Text className="text-gray-500">Posts</Text>
            </View>

            <TouchableOpacity
              className="mr-8"
              onPress={() =>
                router.push({
                  pathname: "/(users)/connections",
                  params: { id: user.id, type: "followers" },
                })
              }
            >
              <Text className="text-xl font-bold">{user.followersCount}</Text>
              <Text className="text-gray-500">Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(users)/connections",
                  params: { id: user.id, type: "following" },
                })
              }
            >
              <Text className="text-xl font-bold">{user.followingCount}</Text>
              <Text className="text-gray-500">Following</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-6 flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 rounded-2xl py-4 ${getRelationshipButtonColor(
                user.relationship,
              )}`}
              onPress={toggleFollow}
            >
              <Text
                className={`text-center font-bold ${
                  isFriendRelationship(user.relationship)
                    ? "text-black"
                    : "text-white"
                }`}
              >
                {getRelationshipButtonText(user.relationship)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-2xl border border-gray-200 py-4"
              onPress={startChat}
            >
              <Text className="text-center font-bold text-black">Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Tabs
          activeTab={activeFeed}
          onChange={setActiveFeed}
          tabs={[
            { label: "Content", value: "CONTENT" },
            { label: "Reviews", value: "REVIEW" },
          ]}
        />

        <View style={{ flex: 1 }}>
          <ProfilePostGrid
            posts={posts}
            onPressPost={(postId) => {
              router.push({
                pathname:
                  activeFeed === "CONTENT"
                    ? "/(users)/content-feed"
                    : "/(users)/reviews-feed",
                params: {
                  userId: user.id,
                  postId,
                },
              });
            }}
          />
        </View>
      </View>
    </View>
  );
}
