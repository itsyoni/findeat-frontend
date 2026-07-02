import { CommentsBottomSheet } from "@/components/common/CommentsBottomSheet";
import ContentFeedList from "@/components/posts/content/ContentFeed";
import { api } from "@/lib/api";
import { Post } from "@/types/post";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

export default function ProfileContentFeedScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const commentsSheetRef = useRef<BottomSheet>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const initialIndex = useMemo(() => {
    return Math.max(
      posts.findIndex((post) => post.id === postId),
      0,
    );
  }, [posts, postId]);

  async function loadPosts() {
    try {
      const res = await api.get("/users/me");
      setPosts(res.data.posts.filter((post: Post) => post.type === "CONTENT"));
    } finally {
      setLoading(false);
    }
  }

  async function toggleLike(postId: string, isLiked: boolean) {
    if (isLiked) {
      await api.delete(`/posts/${postId}/like`);
    } else {
      await api.post(`/posts/${postId}/like`);
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
      await api.delete(`/restaurants/${restaurantId}/want-to-try`);
    } else {
      await api.post(`/restaurants/${restaurantId}/want-to-try`, {
        savedFromPostId: postId,
      });
    }

    await loadPosts();
  }

  useEffect(() => {
    loadPosts();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator />
      </View>
    );
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
        refreshing={false}
        onRefresh={loadPosts}
        onToggleLike={toggleLike}
        onOpenComments={openComments}
        initialIndex={initialIndex}
        onToggleWantToTry={toggleWantToTry}
      />

      <CommentsBottomSheet ref={commentsSheetRef} postId={selectedPostId} />
    </View>
  );
}
