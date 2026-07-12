import PostOptionsBottomSheet from "@/components/chats/PostOptionsBottomSheet";
import SharePostBottomSheet from "@/components/chats/share/SharePostBottomSheet";
import { CommentsBottomSheet } from "@/components/common";
import ContentFeedList from "@/components/posts/content/ContentFeed";
import { useMyProfile } from "@/hooks/useMyProfile";
import { api } from "@/lib/api";
import { filterPostsByType } from "@findeat/utils";
import { router, useLocalSearchParams } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

export default function ProfileContentFeedScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();

  const { profile, loading, refresh } = useMyProfile();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [optionsPostId, setOptionsPostId] = useState<string | null>(null);

  const posts = useMemo(
    () => filterPostsByType(profile?.posts, "CONTENT"),
    [profile?.posts],
  );

  const initialIndex = useMemo(() => {
    return Math.max(
      posts.findIndex((post) => post.id === postId),
      0,
    );
  }, [posts, postId]);

  async function toggleLike(postId: string, isLiked: boolean) {
    await api.posts.toggleLike(postId, isLiked);
    await refresh();
  }

  async function toggleWantToTry(
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) {
    await api.restaurants.toggleWantToTry(restaurantId, isWantToTry, postId);

    await refresh();
  }

  function openComments(postId: string) {
    setSelectedPostId(postId);
  }

  async function deletePost(postId: string) {
    try {
      await api.posts.delete(postId);
      await refresh();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not delete post");
    }
  }

  if (loading || !profile) {
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
        onRefresh={refresh}
        onToggleLike={toggleLike}
        onOpenComments={openComments}
        initialIndex={initialIndex}
        onToggleWantToTry={toggleWantToTry}
        onDeletePost={deletePost}
        onOpenSharePost={setSharePostId}
        onOpenPostOptions={setOptionsPostId}
      />

      <PostOptionsBottomSheet
        postId={optionsPostId}
        onClose={() => setOptionsPostId(null)}
        onDelete={deletePost}
      />

      <SharePostBottomSheet
        postId={sharePostId}
        onClose={() => setSharePostId(null)}
        onShared={() => void refresh()}
      />

      <CommentsBottomSheet
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </View>
  );
}
