import { CommentsBottomSheet } from "@/components/common";
import ContentFeed from "@/components/posts/content/ContentFeed";
import ReviewFeed from "@/components/posts/review/ReviewFeed";
import { api } from "@/lib/api";
import { Post, PostType } from "@findeat/types/post";
import BottomSheet from "@gorhom/bottom-sheet";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const commentsSheetRef = useRef<BottomSheet>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [feedHeight, setFeedHeight] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const openedPost = await api.posts.get(id);
      const feedPosts = await api.posts.feed(openedPost.type);

      const withoutDuplicate = feedPosts.filter((post) => post.id !== id);

      setActiveFeed(openedPost.type);
      setPosts([openedPost, ...withoutDuplicate]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  async function toggleLike(postId: string, isLiked: boolean) {
    if (isLiked) {
      await api.posts.unlike(postId);
    } else {
      await api.posts.like(postId);
    }

    await loadPosts();
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

  function openComments(postId: string) {
    setSelectedPostId(postId);
    commentsSheetRef.current?.snapToIndex(0);
  }

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "" }} />

      <View
        className="flex-1 bg-white"
        onLayout={(event) => setFeedHeight(event.nativeEvent.layout.height)}
      >
        {feedHeight > 0 &&
          (activeFeed === "CONTENT" ? (
            <ContentFeed
              posts={posts}
              height={feedHeight}
              refreshing={false}
              onRefresh={loadPosts}
              onToggleLike={toggleLike}
              onOpenComments={openComments}
              onToggleWantToTry={toggleWantToTry}
              initialIndex={0}
            />
          ) : (
            <ReviewFeed
              posts={posts}
              refreshing={false}
              onRefresh={loadPosts}
              onToggleLike={toggleLike}
              onOpenComments={openComments}
              onToggleWantToTry={toggleWantToTry}
            />
          ))}

        <CommentsBottomSheet ref={commentsSheetRef} postId={selectedPostId} />
      </View>
    </>
  );
}
