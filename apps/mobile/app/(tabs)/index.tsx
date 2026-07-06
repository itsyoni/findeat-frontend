import { CommentsBottomSheet } from "@/components/common/CommentsBottomSheet";
import SearchBar from "@/components/common/SearchBar";
import Tabs from "@/components/common/Tabs";
import ContentFeedList from "@/components/posts/content/ContentFeed";
import ReviewFeed from "@/components/posts/review/ReviewFeed";
import SearchResultRow from "@/components/search/SearchResultRow";
import SearchResultsView from "@/components/search/SearchResultsView";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { searchGlobal } from "@/lib/search";
import { Post, PostType } from "@findeat/types/post";
import { SearchResultItem } from "@findeat/types/search";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const commentsSheetRef = useRef<BottomSheet>(null);

  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [feedHeight, setFeedHeight] = useState(0);

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

  function openComments(postId: string) {
    setSelectedPostId(postId);
    commentsSheetRef.current?.snapToIndex(0);
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
            placeholder="Search"
            onPress={() => setIsSearching(true)}
          />

          <Tabs
            activeTab={activeFeed}
            onChange={setActiveFeed}
            tabs={[
              { label: "Content", value: "CONTENT" },
              { label: "Reviews", value: "REVIEW" },
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
                />
              ) : (
                <ReviewFeed
                  posts={posts}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  onToggleLike={toggleLike}
                  onOpenComments={openComments}
                  onToggleWantToTry={toggleWantToTry}
                />
              ))}
          </View>

          <CommentsBottomSheet ref={commentsSheetRef} postId={selectedPostId} />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
