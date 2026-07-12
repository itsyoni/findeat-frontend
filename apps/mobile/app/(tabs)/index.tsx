import { CommentsBottomSheet } from "@/components/common";
import SearchBar from "@/components/common/inputs/SearchBar";
import Tabs from "@/components/common/Tabs";
import ContentFeedList from "@/components/posts/content/ContentFeed";
import ReviewFeed from "@/components/posts/review/ReviewFeed";
import SearchResultRow from "@/components/search/SearchResultRow";
import SearchResultsView from "@/components/search/SearchResultsView";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { searchGlobal } from "@/services/search";
import { Post, PostType } from "@findeat/types/post";
import { SearchResultItem } from "@findeat/types/search";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import PostOptionsBottomSheet from "@/components/chats/PostOptionsBottomSheet";
import SharePostBottomSheet from "@/components/chats/share/SharePostBottomSheet";

export default function HomeScreen() {
  const { t } = useTranslation("common");
  const { user, isLoading: authLoading } = useAuth();

  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [feedHeight, setFeedHeight] = useState(0);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [optionsPostId, setOptionsPostId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    if (!user) return;

    try {
      const posts = await api.posts.feed(activeFeed);
      setPosts(posts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user, activeFeed]);

  async function onRefresh() {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }

  async function toggleLike(postId: string, isLiked: boolean) {
    setPosts((prev) =>
      prev.map((post) =>
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
      console.error("toggle like failed", error);

      setPosts((prev) =>
        prev.map((post) =>
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
    setPosts((prev) =>
      prev.map((post) => {
        if (post.restaurant?.id !== restaurantId) return post;

        return {
          ...post,
          restaurantSavesCount: Math.max(
            0,
            post.restaurantSavesCount + (isWantToTry ? -1 : 1),
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
      console.error("toggle want to try failed", error);
      await loadPosts();
    }
  }

  async function deletePost(postId: string) {
    try {
      await api.posts.delete(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error(error);
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

  function openComments(postId: string) {
    setSelectedPostId(postId);
  }

  function handleSearchSelect(item: SearchResultItem) {
    setIsSearching(false);

    if (item.type === "USER") {
      router.push({
        pathname: "/(users)/[id]",
        params: { id: item.id },
      });
      return;
    }

    router.push({
      pathname: "/restaurants/[id]",
      params: { id: item.id },
    });
  }

  useFocusEffect(
    useCallback(() => {
      if (authLoading || !user) return;

      setLoading(true);
      loadPosts();
    }, [authLoading, user, loadPosts]),
  );

  if (authLoading || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "white" }}>
      {isSearching ? (
        <Animated.View
          key="search"
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          className="flex-1"
        >
          <SearchResultsView
            searchRequest={searchGlobal}
            onCancel={() => setIsSearching(false)}
            onSelect={handleSearchSelect}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={(item) => <SearchResultRow item={item} />}
          />
        </Animated.View>
      ) : (
        <Animated.View
          key="normal"
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          className="flex-1"
        >
          <SearchBar
            editable={false}
            placeholder={t("search")}
            onPress={() => setIsSearching(true)}
          />

          <Tabs
            activeTab={activeFeed}
            onChange={setActiveFeed}
            tabs={[
              { label: t("content"), value: "CONTENT" },
              { label: t("reviews"), value: "REVIEW" },
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
                  onToggleWantToTry={toggleWantToTry}
                  onDeletePost={deletePost}
                  onOpenSharePost={setSharePostId}
                  onOpenPostOptions={setOptionsPostId}
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
          </View>
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
            onCommentAdded={handleCommentAdded}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
