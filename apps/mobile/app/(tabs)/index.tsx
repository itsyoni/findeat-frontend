import { CommentsBottomSheet } from "@/components/common";
import SearchBar from "@/components/common/inputs/SearchBar";
import Tabs from "@/components/common/Tabs";
import ContentFeedList from "@/components/posts/content/ContentFeed";
import ReviewFeed from "@/components/posts/review/ReviewFeed";
import SearchResultRow from "@/components/search/SearchResultRow";
import SearchResultsView from "@/components/search/SearchResultsView";
import { useAuth } from "@/contexts/AuthContext";
import {
  feedQueryKey,
  updatePostInFeedCache,
  updateRestaurantStatusInFeedCache,
  useFeed,
} from "@/hooks/useFeed";
import { api } from "@/lib/api";
import { searchGlobal } from "@/services/search";
import { PostType } from "@findeat/types/post";
import { SearchResultItem } from "@findeat/types/search";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import type { FeedPage } from "@findeat/types";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import PostOptionsBottomSheet from "@/components/chats/PostOptionsBottomSheet";
import SharePostBottomSheet from "@/components/chats/share/SharePostBottomSheet";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useNotificationUnreadCount } from "@/hooks/useNotifications";
import { BellIcon } from "phosphor-react-native";

export default function HomeScreen() {
  const { t } = useTranslation("common");
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { isDark } = useAppTheme();
  const unread = useNotificationUnreadCount(!!user && !authLoading);

  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [feedHeight, setFeedHeight] = useState(0);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [optionsPostId, setOptionsPostId] = useState<string | null>(null);

  const feed = useFeed(activeFeed, !!user && !authLoading);
  const posts = useMemo(
    () => feed.data?.pages.flatMap((page) => page.items) ?? [],
    [feed.data],
  );

  async function onRefresh() {
    queryClient.setQueryData<InfiniteData<FeedPage>>(
      feedQueryKey(activeFeed),
      (current) =>
        current
          ? {
              pages: current.pages.slice(0, 1),
              pageParams: current.pageParams.slice(0, 1),
            }
          : current,
    );

    await feed.refetch();
  }

  async function toggleLike(postId: string, isLiked: boolean) {
    updatePostInFeedCache(queryClient, (post) =>
      post.id === postId
        ? {
            ...post,
            isLiked: !isLiked,
            likesCount: Math.max(0, post.likesCount + (isLiked ? -1 : 1)),
          }
        : post,
    );

    try {
      await api.posts.toggleLike(postId, isLiked);
    } catch (error) {
      console.error("toggle like failed", error);

      updatePostInFeedCache(queryClient, (post) =>
        post.id === postId
          ? {
              ...post,
              isLiked,
              likesCount: Math.max(0, post.likesCount + (isLiked ? 1 : -1)),
            }
          : post,
      );
    }
  }

  async function toggleWantToTry(
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) {
    updatePostInFeedCache(queryClient, (post) => {
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
    });

    try {
      if (isWantToTry) {
        await api.restaurants.removeWantToTry(restaurantId);
      } else {
        const status = await api.restaurants.wantToTry(restaurantId, postId);
        updateRestaurantStatusInFeedCache(queryClient, restaurantId, status);
      }
    } catch (error) {
      console.error("toggle want to try failed", error);
      await feed.refetch();
      Alert.alert("Could not save post", "Please try again.");
    }
  }

  async function deletePost(postId: string) {
    try {
      await api.posts.delete(postId);
      updatePostInFeedCache(queryClient, (post) =>
        post.id === postId ? null : post,
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not delete post");
    }
  }

  function handleCommentAdded(postId: string) {
    updatePostInFeedCache(queryClient, (post) =>
      post.id === postId
        ? { ...post, commentsCount: post.commentsCount + 1 }
        : post,
    );
  }

  function handlePostShared(postId: string) {
    updatePostInFeedCache(queryClient, (post) =>
      post.id === postId
        ? { ...post, sharesCount: (post.sharesCount ?? 0) + 1 }
        : post,
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

  if (authLoading || feed.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas dark:bg-black">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FBFAF8" }}
    >
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
            rightAccessory={
              <TouchableOpacity
                className="relative h-full aspect-square items-center justify-center rounded-2xl bg-ink dark:bg-white"
                onPress={() => router.push('/notifications')}
              >
                <BellIcon size={22} color={isDark ? '#000' : '#FFF'} weight="fill" />
                {(unread.data?.count ?? 0) > 0 ? (
                  <View
                    className="absolute -right-1 -top-1 h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 dark:border-black"
                    style={{ zIndex: 10 }}
                  >
                    <Text className="text-[10px] font-bold text-white">
                      {(unread.data?.count ?? 0) > 99 ? '99+' : unread.data?.count}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            }
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
                  refreshing={feed.isRefetching && !feed.isFetchingNextPage}
                  onRefresh={onRefresh}
                  onEndReached={() => {
                    if (feed.hasNextPage && !feed.isFetchingNextPage) {
                      void feed.fetchNextPage();
                    }
                  }}
                  loadingMore={feed.isFetchingNextPage}
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
                  refreshing={feed.isRefetching && !feed.isFetchingNextPage}
                  onRefresh={onRefresh}
                  onEndReached={() => {
                    if (feed.hasNextPage && !feed.isFetchingNextPage) {
                      void feed.fetchNextPage();
                    }
                  }}
                  loadingMore={feed.isFetchingNextPage}
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
            onShared={handlePostShared}
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
