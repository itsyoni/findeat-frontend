import { CommentsBottomSheet, LoadingScreen } from "@/components/common";
import PostOptionsBottomSheet from "@/components/chats/PostOptionsBottomSheet";
import SharePostBottomSheet from "@/components/chats/share/SharePostBottomSheet";
import ContentFeed from "@/components/posts/content/ContentFeed";
import ReviewFeed from "@/components/posts/review/ReviewFeed";
import { api } from "@/lib/api";
import { Post, PostType } from "@findeat/types/post";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [posts, setPosts] = useState<Post[]>([]);
  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [optionsPostId, setOptionsPostId] = useState<string | null>(null);
  const [feedHeight, setFeedHeight] = useState(0);
  const [loadedPostId, setLoadedPostId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPostsData = useCallback(async () => {
    if (!id) return null;

    const openedPost = await api.posts.get(id);
    const feedPosts = await api.posts.feed(openedPost.type);

    const withoutDuplicate = feedPosts.items.filter(
      (post) => post.id !== openedPost.id,
    );

    return {
      id,
      openedPost,
      posts: [openedPost, ...withoutDuplicate],
    };
  }, [id]);

  const loadPosts = useCallback(async () => {
    const result = await fetchPostsData();

    if (!result) return;

    setActiveFeed(result.openedPost.type);
    setPosts(result.posts);
    setLoadedPostId(result.id);
  }, [fetchPostsData]);

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
        if (post.restaurant?.id !== restaurantId) {
          return post;
        }

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
      if (isWantToTry) {
        await api.restaurants.removeWantToTry(restaurantId);
      } else {
        await api.restaurants.wantToTry(restaurantId, postId);
      }
    } catch (error) {
      console.error("Failed to toggle want to try", error);
      await loadPosts();
    }
  }

  async function deletePost(postId: string) {
    try {
      await api.posts.delete(postId);

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId),
      );

      setOptionsPostId(null);
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

  function openComments(postId: string) {
    setSelectedPostId(postId);
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialPost() {
      try {
        const result = await fetchPostsData();

        if (!result || cancelled) return;

        setActiveFeed(result.openedPost.type);
        setPosts(result.posts);
        setLoadedPostId(result.id);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load post", error);
        }
      }
    }

    void fetchInitialPost();

    return () => {
      cancelled = true;
    };
  }, [fetchPostsData]);

  const loading = !id || loadedPostId !== id;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen options={{ title: "" }} />

      <View
        className="flex-1 bg-white dark:bg-black"
        onLayout={(event) => setFeedHeight(event.nativeEvent.layout.height)}
      >
        {feedHeight > 0 &&
          (activeFeed === "CONTENT" ? (
            <ContentFeed
              posts={posts}
              height={feedHeight}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onToggleLike={toggleLike}
              onOpenComments={openComments}
              onToggleWantToTry={toggleWantToTry}
              onDeletePost={deletePost}
              onOpenSharePost={setSharePostId}
              onOpenPostOptions={setOptionsPostId}
              initialIndex={0}
            />
          ) : (
            <ReviewFeed
              posts={posts}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onToggleLike={toggleLike}
              onOpenComments={openComments}
              onToggleWantToTry={toggleWantToTry}
              onOpenSharePost={setSharePostId}
              onOpenPostOptions={setOptionsPostId}
            />
          ))}

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
    </>
  );
}
