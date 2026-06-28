import SearchUsersView from "@/components/chats/SearchUsersView";
import { CommentsBottomSheet } from "@/components/CommentsBottomSheet";
import ContentFeedList from "@/components/feed/ContentFeedList";
import FeedPostList from "@/components/feed/FeedPostList";
import SearchBar from "@/components/SearchBar";
import Tabs from "@/components/Tabs";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Post, PostType } from "@/types/post";
import BottomSheet from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { refresh } = useLocalSearchParams();

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
      const res = await api.get(`/posts/feed?type=${activeFeed}`);
      setPosts(res.data);
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
      await api.delete(`/posts/${postId}/like`);
    } else {
      await api.post(`/posts/${postId}/like`);
    }

    await loadPosts();
  }

  async function toggleWantToTry(
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) {
    if (isWantToTry) {
      await api.delete(`/restaurants/${restaurantId}/want-to-try`);
    } else {
      await api.post(`/restaurants/${restaurantId}/want-to-try`, {
        savedFromPostId: postId,
      });
    }

    await loadPosts();
  }

  function openComments(postId: string) {
    setSelectedPostId(postId);
    commentsSheetRef.current?.snapToIndex(0);
  }

  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);
    loadPosts();
  }, [refresh, authLoading, user, loadPosts]);

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
          <SearchUsersView
            mode="profile"
            onCancel={() => setIsSearching(false)}
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
                <FeedPostList
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
