import { Post } from "@findeat/types/post";
import { useState } from "react";
import { FlatList } from "react-native";
import ContentPost from "./ContentPost";
import EmptyPostsState from "../EmptyPostsState";

type Props = {
  posts: Post[];
  height: number;
  contentTopInset?: number;
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached?: () => void;
  loadingMore?: boolean;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onOpenSharePost: (postId: string) => void;
  onOpenPostOptions: (postId: string) => void;
  onToggleWantToTry: (
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) => void;
  initialIndex?: number;
};

export default function ContentFeed({
  posts,
  height,
  contentTopInset = 0,
  refreshing,
  onRefresh,
  onEndReached,
  onToggleLike,
  onOpenComments,
  onToggleWantToTry,
  onDeletePost,
  initialIndex = 0,
  onOpenSharePost,
  onOpenPostOptions,
}: Props) {
  const [isPinchingMedia, setIsPinchingMedia] = useState(false);

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.6}
      initialNumToRender={2}
      maxToRenderPerBatch={2}
      windowSize={3}
      removeClippedSubviews
      pagingEnabled
      scrollEnabled={!isPinchingMedia}
      showsVerticalScrollIndicator={false}
      decelerationRate="fast"
      initialScrollIndex={initialIndex}
      contentContainerStyle={{
        flexGrow: 1,
      }}
      ListEmptyComponent={<EmptyPostsState type="CONTENT" />}
      getItemLayout={(_, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
      renderItem={({ item }) => (
        <ContentPost
          post={item}
          height={height}
          contentTopInset={contentTopInset}
          onToggleLike={onToggleLike}
          onOpenComments={onOpenComments}
          onToggleWantToTry={onToggleWantToTry}
          onOpenSharePost={onOpenSharePost}
          onOpenPostOptions={onOpenPostOptions}
          onPinchStart={() => setIsPinchingMedia(true)}
          onPinchEnd={() => setIsPinchingMedia(false)}
        />
      )}
    />
  );
}
