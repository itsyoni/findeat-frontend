import { Post } from "@/types/post";
import { FlatList } from "react-native";
import FeedPostCard from "./FeedPostCard";

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

export default function FeedPostList({
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
        <FeedPostCard
          post={item}
          onToggleLike={onToggleLike}
          onOpenComments={onOpenComments}
          onToggleWantToTry={onToggleWantToTry}
        />
      )}
    />
  );
}
