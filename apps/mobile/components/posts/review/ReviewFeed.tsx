import { Post } from "@findeat/types/post";
import { ActivityIndicator, FlatList, View } from "react-native";
import ReviewPost from "./ReviewPost";
import EmptyPostsState from "../EmptyPostsState";

type Props = {
  posts: Post[];
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached?: () => void;
  loadingMore?: boolean;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
  onOpenSharePost: (postId: string) => void;
  onOpenPostOptions: (postId: string) => void;
  onToggleWantToTry: (
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) => void;
};

export default function ReviewFeed({
  posts,
  refreshing,
  onRefresh,
  onEndReached,
  loadingMore = false,
  onToggleLike,
  onOpenComments,
  onToggleWantToTry,
  onOpenSharePost,
  onOpenPostOptions,
}: Props) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.6}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={5}
      removeClippedSubviews
      contentContainerStyle={{
        flexGrow: 1,
      }}
      ListEmptyComponent={<EmptyPostsState type="REVIEW" />}
      ListFooterComponent={
        loadingMore ? (
          <View className="items-center py-6">
            <ActivityIndicator />
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <ReviewPost
          post={item}
          onToggleLike={onToggleLike}
          onOpenComments={onOpenComments}
          onToggleWantToTry={onToggleWantToTry}
          onOpenSharePost={onOpenSharePost}
          onOpenPostOptions={onOpenPostOptions}
        />
      )}
    />
  );
}
