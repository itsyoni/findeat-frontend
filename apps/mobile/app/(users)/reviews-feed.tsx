import { LoadingScreen } from "@/components/common";
import { CommentsBottomSheet } from "@/components/common/CommentsBottomSheet";
import FeedPostList from "@/components/posts/review/ReviewFeed";
import { api } from "@/lib/api";
import { Post } from "@findeat/types/post";
import BottomSheet from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";

export default function UserReviewsFeedScreen() {
  const { userId } = useLocalSearchParams<{
    userId: string;
    postId?: string;
  }>();

  const commentsSheetRef = useRef<BottomSheet>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    try {
      const user = await api.users.get(userId);

      setPosts(user.posts.filter((post: Post) => post.type === "REVIEW"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  async function toggleLike(postId: string, isLiked: boolean) {
    await api.posts.toggleLike(postId, isLiked);
    await loadPosts();
  }

  async function toggleWantToTry(
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) {
    await api.restaurants.toggleWantToTry(restaurantId, isWantToTry, postId);

    await loadPosts();
  }

  function openComments(postId: string) {
    setSelectedPostId(postId);
    commentsSheetRef.current?.snapToIndex(0);
  }

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <FeedPostList
        posts={posts}
        refreshing={false}
        onRefresh={loadPosts}
        onToggleLike={toggleLike}
        onOpenComments={openComments}
        onToggleWantToTry={toggleWantToTry}
      />

      <CommentsBottomSheet ref={commentsSheetRef} postId={selectedPostId} />
    </View>
  );
}
