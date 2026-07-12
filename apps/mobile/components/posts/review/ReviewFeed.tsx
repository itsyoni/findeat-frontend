import { Post } from "@findeat/types/post";
import { FlatList } from "react-native";
import ReviewPost from "./ReviewPost";
import EmptyPostsState from "../EmptyPostsState";

type Props = {
  posts: Post[];
  refreshing: boolean;
  onRefresh: () => void;
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
      contentContainerStyle={{
        flexGrow: 1,
      }}
      ListEmptyComponent={<EmptyPostsState type="REVIEW" />}
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
