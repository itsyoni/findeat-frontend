import { CommentsBottomSheet } from "@/components/common";
import { useMyProfile } from "@/hooks/useMyProfile";
import { api } from "@/lib/api";
import { filterPostsByType } from "@findeat/utils";
import PostOptionsBottomSheet from "@/components/chats/PostOptionsBottomSheet";
import SharePostBottomSheet from "@/components/chats/share/SharePostBottomSheet";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import ReviewFeed from "@/components/posts/review/ReviewFeed";

export default function ProfileReviewsFeedScreen() {
  const { profile, loading, refresh } = useMyProfile();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [optionsPostId, setOptionsPostId] = useState<string | null>(null);

  const posts = useMemo(
    () => filterPostsByType(profile?.posts, "REVIEW"),
    [profile?.posts],
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
      await refresh();
      setOptionsPostId(null);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not delete post");
    }
  }

  if (loading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
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
      />

      <CommentsBottomSheet
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </View>
  );
}
