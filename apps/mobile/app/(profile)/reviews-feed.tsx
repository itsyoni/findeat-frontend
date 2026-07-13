import { CommentsBottomSheet } from "@/components/common";
import { useMyProfile } from "@/hooks/useMyProfile";
import { api } from "@/lib/api";
import { filterPostsByType } from "@findeat/utils";
import PostOptionsBottomSheet from "@/components/chats/PostOptionsBottomSheet";
import SharePostBottomSheet from "@/components/chats/share/SharePostBottomSheet";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import ReviewFeed from "@/components/posts/review/ReviewFeed";
import { useAppTheme } from "@/contexts/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { removePostFromAppCache } from "@/hooks/useFeed";

export default function ProfileReviewsFeedScreen() {
  const queryClient = useQueryClient();
  const { isDark } = useAppTheme();
  const { profile, loading, refresh } = useMyProfile();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [optionsPostId, setOptionsPostId] = useState<string | null>(null);

  const posts = useMemo(
    () => filterPostsByType(profile?.posts, "REVIEW"),
    [profile?.posts],
  );

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  async function toggleLike(postId: string, isLiked: boolean) {
    await api.posts.toggleLike(postId, isLiked);
    await refresh();
  }

  async function toggleWantToTry(
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) {
    await api.restaurants.toggleWantToTry(restaurantId, isWantToTry, postId);

    await refresh();
  }

  function openComments(postId: string) {
    setSelectedPostId(postId);
  }

  async function deletePost(postId: string) {
    try {
      await api.posts.delete(postId);
      removePostFromAppCache(queryClient, postId);
      void refresh();
      setOptionsPostId(null);
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/profile");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not delete post");
    }
  }

  if (loading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FFF" }}
    >
      <ReviewFeed
        posts={posts}
        refreshing={false}
        onRefresh={refresh}
        onToggleLike={toggleLike}
        onOpenComments={openComments}
        onToggleWantToTry={toggleWantToTry}
        onOpenSharePost={setSharePostId}
        onOpenPostOptions={setOptionsPostId}
      />

      <PostOptionsBottomSheet
        postId={optionsPostId}
        onClose={() => setOptionsPostId(null)}
        onDelete={deletePost}
      />

      <SharePostBottomSheet
        postId={sharePostId}
        onClose={() => setSharePostId(null)}
        onShared={() => void refresh()}
      />

      <CommentsBottomSheet
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </SafeAreaView>
  );
}
