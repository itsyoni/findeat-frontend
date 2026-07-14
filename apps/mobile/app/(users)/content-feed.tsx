import { CommentsBottomSheet, LoadingScreen } from "@/components/common";
import PostOptionsBottomSheet from "@/components/chats/PostOptionsBottomSheet";
import SharePostBottomSheet from "@/components/chats/share/SharePostBottomSheet";
import ContentFeedList from "@/components/posts/content/ContentFeed";
import { api } from "@/lib/api";
import { Post } from "@findeat/types/post";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Dimensions, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { removePostFromAppCache } from "@/hooks/useFeed";

const { height } = Dimensions.get("window");

export default function UserContentFeedScreen() {
  const queryClient = useQueryClient();
  const { userId, postId } = useLocalSearchParams<{
    userId: string;
    postId: string;
  }>();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [optionsPostId, setOptionsPostId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const initialIndex = useMemo(() => {
    return Math.max(
      posts.findIndex((post) => post.id === postId),
      0,
    );
  }, [posts, postId]);

  const fetchPosts = useCallback(async () => {
    if (!userId) return null;

    const user = await api.users.get(userId);

    return user.posts.filter((post: Post) => post.type === "CONTENT");
  }, [userId]);

  const loadPosts = useCallback(async () => {
    const nextPosts = await fetchPosts();

    if (!nextPosts || !userId) return;

    setPosts(nextPosts);
    setLoadedUserId(userId);
  }, [fetchPosts, userId]);

  useFocusEffect(
    useCallback(() => {
      void loadPosts();
    }, [loadPosts]),
  );

  async function onRefresh() {
    try {
      setRefreshing(true);
      await loadPosts();
    } catch (error) {
      console.error("Failed to refresh posts", error);
    } finally {
      setRefreshing(false);
    }
  }

  async function toggleLike(postId: string, isLiked: boolean) {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !isLiked,
              likesCount: Math.max(0, post.likesCount + (isLiked ? -1 : 1)),
            }
          : post,
      ),
    );

    try {
      await api.posts.toggleLike(postId, isLiked);
    } catch (error) {
      console.error("Failed to toggle like", error);

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked,
                likesCount: Math.max(0, post.likesCount + (isLiked ? 1 : -1)),
              }
            : post,
        ),
      );
    }
  }

  async function toggleWantToTry(
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.restaurant?.id !== restaurantId) return post;

        return {
          ...post,
          restaurantSavesCount: Math.max(
            0,
            (post.restaurantSavesCount ?? 0) + (isWantToTry ? -1 : 1),
          ),
          restaurant: {
            ...post.restaurant,
            userSaves: isWantToTry
              ? []
              : [
                  {
                    id: "",
                    wantToTry: true,
                    visited: false,
                    favorite: false,
                  },
                ],
          },
        };
      }),
    );

    try {
      await api.restaurants.toggleWantToTry(restaurantId, isWantToTry, postId);
    } catch (error) {
      console.error("Failed to toggle want to try", error);
      await loadPosts();
    }
  }

  async function deletePost(postId: string) {
    try {
      await api.posts.delete(postId);
      removePostFromAppCache(queryClient, postId);
      setOptionsPostId(null);
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to delete post", error);
      Alert.alert("Error", "Could not delete post");
    }
  }

  function handleCommentAdded(postId: string) {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentsCount: post.commentsCount + 1,
            }
          : post,
      ),
    );
  }

  function handlePostShared(postId: string) {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? { ...post, sharesCount: (post.sharesCount ?? 0) + 1 }
          : post,
      ),
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialPosts() {
      try {
        const nextPosts = await fetchPosts();

        if (!nextPosts || cancelled || !userId) return;

        setPosts(nextPosts);
        setLoadedUserId(userId);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load posts", error);
        }
      }
    }

    void fetchInitialPosts();

    return () => {
      cancelled = true;
    };
  }, [fetchPosts, userId]);

  const loading = !userId || loadedUserId !== userId;

  if (loading) {
    return <LoadingScreen variant="feed" />;
  }

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView
        edges={["top"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        <TouchableOpacity
          className="ml-4 mt-2 h-11 w-11 items-center justify-center rounded-full bg-black/50"
          onPress={() => router.back()}
        >
          <CaretLeftIcon size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      <ContentFeedList
        posts={posts}
        height={height}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onToggleLike={toggleLike}
        onOpenComments={setSelectedPostId}
        onToggleWantToTry={toggleWantToTry}
        onDeletePost={deletePost}
        onOpenSharePost={setSharePostId}
        onOpenPostOptions={setOptionsPostId}
        initialIndex={initialIndex}
      />

      <PostOptionsBottomSheet
        postId={optionsPostId}
        onClose={() => setOptionsPostId(null)}
        onDelete={deletePost}
      />

      <SharePostBottomSheet
        postId={sharePostId}
        onClose={() => setSharePostId(null)}
        onShared={handlePostShared}
      />

      <CommentsBottomSheet
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
        onCommentAdded={handleCommentAdded}
      />
    </View>
  );
}
