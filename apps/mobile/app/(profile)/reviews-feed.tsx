import { CommentsBottomSheet } from "@/components/common/CommentsBottomSheet";
import FeedPostList from "@/components/posts/review/ReviewFeed";
import { useMyProfile } from "@/hooks/useMyProfile";
import { api } from "@/lib/api";
import { filterPostsByType } from "@findeat/utils";
import BottomSheet from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function ProfileReviewsFeedScreen() {
  const commentsSheetRef = useRef<BottomSheet>(null);

  const { profile, loading, refresh } = useMyProfile();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

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
    commentsSheetRef.current?.snapToIndex(0);
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
      <FeedPostList
        posts={posts}
        refreshing={false}
        onRefresh={refresh}
        onToggleLike={toggleLike}
        onOpenComments={openComments}
        onToggleWantToTry={toggleWantToTry}
      />

      <CommentsBottomSheet ref={commentsSheetRef} postId={selectedPostId} />
    </View>
  );
}
