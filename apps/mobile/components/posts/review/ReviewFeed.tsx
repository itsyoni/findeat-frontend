import { Post } from "@findeat/types/post";
import { FlatList } from "react-native";
import ReviewPost from "./ReviewPost";

type Props = {
  posts: Post[];
  refreshing: boolean;
  onRefresh: () => void;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
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
}: Props) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={({ item }) => (
        <ReviewPost
          post={item}
          onToggleLike={onToggleLike}
          onOpenComments={onOpenComments}
          onToggleWantToTry={onToggleWantToTry}
        />
      )}
    />
  );
}
