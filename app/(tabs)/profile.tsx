import { CommentsBottomSheet } from "@/components/CommentsBottomSheet";
import ContentFeedList from "@/components/feed/ContentFeedList";
import FeedPostList from "@/components/feed/FeedPostList";
import BusinessProfileHeader from "@/components/profile/BusinessProfileHeader";
import PersonalProfileHeader from "@/components/profile/PersonalProfileHeader";
import Tabs from "@/components/Tabs";
import { api } from "@/lib/api";
import { PostType } from "@/types/post";
import { Profile } from "@/types/profile";
import BottomSheet from "@gorhom/bottom-sheet";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
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

  if (loading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  const isBusiness = profile.accountType === "BUSINESS";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {isBusiness ? (
        <BusinessProfileHeader profile={profile} />
      ) : (
        <PersonalProfileHeader profile={profile} />
      )}

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
