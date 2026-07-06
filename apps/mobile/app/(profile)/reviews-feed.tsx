import { CommentsBottomSheet } from "@/components/common/CommentsBottomSheet";
import FeedPostList from "@/components/posts/review/ReviewFeed";
import { api } from "@/lib/api";
import { Post } from "@findeat/types/post";
import { filterPostsByType } from "@findeat/utils/posts";
import BottomSheet from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function ProfileReviewsFeedScreen() {
  const commentsSheetRef = useRef<BottomSheet>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    try {
      const profile = await api.users.me();

      setPosts(filterPostsByType(profile.posts, "REVIEW"));
    } finally {
      setLoading(false);
    }
  }

  async function toggleLike(postId: string, isLiked: boolean) {
    if (isLiked) {
      await api.posts.unlike(postId);
    } else {
      await api.posts.like(postId);
    }

    await loadPosts();
  }

  function openComments(postId: string) {
    setSelectedPostId(postId);
    commentsSheetRef.current?.snapToIndex(0);
  }

  async function toggleWantToTry(
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) {
    if (isWantToTry) {
      await api.restaurants.removeWantToTry(restaurantId);
    } else {
      await api.restaurants.wantToTry(restaurantId, postId);
    }

    await loadPosts();
  }

  useEffect(() => {
    loadPosts();
  }, []);

  if (loading) {
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
        onRefresh={loadPosts}
        onToggleLike={toggleLike}
        onOpenComments={openComments}
        onToggleWantToTry={toggleWantToTry}
      />

      <CommentsBottomSheet ref={commentsSheetRef} postId={selectedPostId} />
    </View>
  );
}
