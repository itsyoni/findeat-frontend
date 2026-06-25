import Avatar from "@/components/Avatar";
import { CommentsBottomSheet } from "@/components/CommentsBottomSheet";
import ContentFeedList from "@/components/feed/ContentFeedList";
import FeedPostList from "@/components/feed/FeedPostList";
import Tabs from "@/components/Tabs";
import { api } from "@/lib/api";
import { PostType } from "@/types/post";
import { Profile } from "@/types/profile";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const commentsSheetRef = useRef<BottomSheet>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [feedHeight, setFeedHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const posts = useMemo(() => {
    return profile?.posts?.filter((post) => post.type === activeFeed) ?? [];
  }, [profile, activeFeed]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  async function loadProfile() {
    try {
      const res = await api.get("/users/me");
      setProfile(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }

  async function toggleLike(postId: string, isLiked: boolean) {
    if (isLiked) {
      await api.delete(`/posts/${postId}/like`);
    } else {
      await api.post(`/posts/${postId}/like`);
    }

    await loadProfile();
  }

  function openComments(postId: string) {
    setSelectedPostId(postId);
    commentsSheetRef.current?.snapToIndex(0);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View className="bg-white px-5 pb-5">
        <View className="items-center">
          <Avatar
            uri={profile?.avatarUrl}
            username={profile?.username}
            size={96}
          />

          <Text className="mt-2 text-2xl font-bold text-black">
            {profile?.username}
          </Text>

          {!!profile?.bio && (
            <Text className="mt-4 text-base text-black">{profile.bio}</Text>
          )}

          <View className="mt-5 flex-row w-full">
            <View className="flex-1">
              <Text className="text-xl font-bold text-black text-center">
                {profile?.postsCount ?? 0}
              </Text>
              <Text className="mt-1 text-sm text-gray-500 text-center">
                Posts
              </Text>
            </View>

            <TouchableOpacity
              className="flex-1"
              onPress={() =>
                router.push({
                  pathname: "/users/connections",
                  params: { id: profile?.id, type: "followers" },
                })
              }
            >
              <Text className="text-xl font-bold text-black text-center">
                {profile?.followersCount ?? 0}
              </Text>
              <Text className="mt-1 text-sm text-gray-500 text-center">
                Followers
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1"
              onPress={() =>
                router.push({
                  pathname: "/users/connections",
                  params: { id: profile?.id, type: "following" },
                })
              }
            >
              <Text className="text-xl font-bold text-black text-center">
                {profile?.followingCount ?? 0}
              </Text>
              <Text className="mt-1 text-sm text-gray-500 text-center">
                Following
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="mt-5 rounded-lg py-2 bg-[#F5F4F5] w-40"
            onPress={() => router.push("/edit-profile")}
          >
            <Text className="text-center text-black">Edit Profile</Text>
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

      <View
        style={{ flex: 1 }}
        onLayout={(e) => setFeedHeight(e.nativeEvent.layout.height)}
      >
        {feedHeight > 0 &&
          (activeFeed === "CONTENT" ? (
            <ContentFeedList
              posts={posts}
              height={feedHeight}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onToggleLike={toggleLike}
              onOpenComments={openComments}
            />
          ) : (
            <FeedPostList
              posts={posts}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onToggleLike={toggleLike}
              onOpenComments={openComments}
            />
          ))}
      </View>

      <CommentsBottomSheet ref={commentsSheetRef} postId={selectedPostId} />
    </SafeAreaView>
  );
}
